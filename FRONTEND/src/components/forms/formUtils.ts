import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { parseNumero } from '../../utils/format';

/** Los campos se guardan como texto (lo que se escribe) y se convierten al enviar. */
export function useCampos<T extends Record<string, string | boolean>>(inicial: T) {
  // Se amplian los literales inferidos (false -> boolean, '' -> string).
  type Campos = { [K in keyof T]: T[K] extends boolean ? boolean : string };
  const [valores, setValores] = useState<Campos>(inicial as Campos);
  const set = <K extends keyof T>(campo: K, valor: Campos[K]) => setValores((prev) => ({ ...prev, [campo]: valor }));
  return { valores, set };
}

/** Error de validacion del lado del cliente; su mensaje se muestra tal cual en el pie del modal. */
export class ErrorFormulario extends Error {}

export function numero(texto: string, etiqueta: string, opciones?: { min?: number; requerido?: boolean }): number | null {
  const n = parseNumero(texto);
  if (n === null) {
    if (opciones?.requerido) throw new ErrorFormulario(`${etiqueta} es obligatorio.`);
    return null;
  }
  if (Number.isNaN(n)) throw new ErrorFormulario(`${etiqueta}: "${texto}" no es un numero valido.`);
  if (opciones?.min !== undefined && n < opciones.min) {
    throw new ErrorFormulario(`${etiqueta} no puede ser menor que ${opciones.min}.`);
  }
  return n;
}

export function entero(texto: string, etiqueta: string, opciones?: { min?: number }): number | null {
  const n = numero(texto, etiqueta, opciones);
  if (n !== null && !Number.isInteger(n)) throw new ErrorFormulario(`${etiqueta} debe ser un numero entero.`);
  return n;
}

/** Valor de la API a texto de formulario, con coma decimal como se digita ("1,74"). */
export function aTexto(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  return typeof valor === 'number' ? String(valor).replace('.', ',') : valor;
}

export function texto(valor: string): string | null {
  const t = valor.trim();
  return t === '' ? null : t;
}

export function idSeleccionado(valor: string): number | null {
  return valor === '' ? null : Number(valor);
}

/** Campo obligatorio de una lista desplegable. */
export function idRequerido(valor: string, etiqueta: string): number {
  if (valor === '') throw new ErrorFormulario(`Selecciona ${etiqueta}.`);
  return Number(valor);
}

/** Mensaje para el pie del formulario cuando no cargan las listas desplegables. */
export function errorCatalogo(error: Error | null): string | null {
  if (!error) return null;
  return error.message.startsWith('404')
    ? 'No se pudieron cargar las listas: el backend no tiene /api/catalogos. Reinicia el backend con la version actual.'
    : `No se pudieron cargar las listas: ${error.message}`;
}

/** Opciones Si/No para las columnas CHAR(1) 'S' / 'N'. */
export const SI_NO_OPTIONS = [
  { value: 'S', label: 'Si' },
  { value: 'N', label: 'No' },
];

/**
 * Alta generica: valida y arma el cuerpo con `construirBody` (que lanza ErrorFormulario),
 * lo envia y, si sale bien, refresca todas las vistas y llama a `onDone` con la respuesta.
 */
export function useAlta<T, R = unknown>(mutationFn: (body: T) => Promise<R>, onDone: (resultado: R) => void) {
  const queryClient = useQueryClient();
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn,
    onSuccess: (resultado) => {
      // Un alta cambia KPIs, listados y catalogos a la vez: se invalida todo.
      queryClient.invalidateQueries();
      onDone(resultado);
    },
  });

  const guardar = (construirBody: () => T) => {
    setErrorLocal(null);
    let body: T;
    try {
      body = construirBody();
    } catch (e) {
      if (e instanceof ErrorFormulario) {
        setErrorLocal(e.message);
        return;
      }
      throw e;
    }
    mutation.mutate(body);
  };

  return {
    guardar,
    guardando: mutation.isPending,
    error: errorLocal ?? mutation.error?.message ?? null,
  };
}
