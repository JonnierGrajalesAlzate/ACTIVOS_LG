import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
