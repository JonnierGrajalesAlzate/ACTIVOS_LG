import { useSearchParams } from 'react-router-dom';
import { VistaTabs } from '../components/layout/VistaTabs';
import { ArrendatariosPage } from './ArrendatariosPage';
import { ContratosPage } from './ContratosPage';

type Vista = 'contratos' | 'arrendatarios';

const TABS = [
  { value: 'contratos' as const, label: 'Contratos' },
  { value: 'arrendatarios' as const, label: 'Arrendatarios' },
];

/** Contratos y arrendatarios comparten una sola pestana del menu; la vista vive en la URL (?vista=). */
export function ContratosHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vista: Vista = searchParams.get('vista') === 'arrendatarios' ? 'arrendatarios' : 'contratos';

  const tabs = (
    <VistaTabs
      ariaLabel="Vista de contratos"
      tabs={TABS}
      value={vista}
      onChange={(v) => setSearchParams(v === 'contratos' ? {} : { vista: v })}
    />
  );

  return vista === 'arrendatarios' ? <ArrendatariosPage tabs={tabs} /> : <ContratosPage tabs={tabs} />;
}
