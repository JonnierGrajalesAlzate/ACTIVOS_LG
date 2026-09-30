import { Header } from '../components/layout/Header';
import type { TabId } from '../nav/navConfig';
import { pageMeta } from '../nav/navConfig';

interface PlaceholderPageProps {
  tab: TabId;
  note: string;
}

export function PlaceholderPage({ tab, note }: PlaceholderPageProps) {
  return (
    <div>
      <Header meta={pageMeta[tab]} />
      <div
        style={{
          border: '1px dashed var(--line)',
          borderRadius: 14,
          padding: 40,
          color: 'var(--ink-3)',
          fontSize: 13.5,
        }}
      >
        {note}
      </div>
    </div>
  );
}
