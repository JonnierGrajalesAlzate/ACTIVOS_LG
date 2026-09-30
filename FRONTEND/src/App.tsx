import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos solo cambian con las altas/ediciones de la app, y cada una invalida todas las
      // consultas (useAlta). Mientras tanto se reutiliza lo ya cargado: volver a una pagina es inmediato.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // El backend ya reintenta contra la base (arranque en frio de Azure SQL); un reintento aqui basta.
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
