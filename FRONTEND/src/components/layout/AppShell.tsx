import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { NavPanel } from './NavPanel';
import navPanelStyles from './NavPanel.module.css';
import { Rail } from './Rail';

const STORAGE_KEY = 'activos-lg.nav-expanded';

function readInitialExpanded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppShell() {
  const [expanded, setExpanded] = useState(readInitialExpanded);

  const setExpandedPersisted = (next: boolean) => {
    setExpanded(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // localStorage no disponible (modo privado, etc.); la preferencia solo dura la sesion.
    }
  };

  return (
    <div className={styles.shell}>
      <Rail onToggle={() => setExpandedPersisted(true)} />
      {expanded && (
        <>
          <NavPanel onCollapse={() => setExpandedPersisted(false)} />
          <div className={navPanelStyles.scrim} onClick={() => setExpandedPersisted(false)} />
        </>
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
