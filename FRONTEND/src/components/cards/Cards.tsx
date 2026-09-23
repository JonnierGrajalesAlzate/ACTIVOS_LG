import { AlertOctagon, AlertTriangle, Building2, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { ProgressBar } from '../progress/ProgressBar';
import { occupancyColor } from '../../utils/colors';
import styles from './Cards.module.css';

export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className={styles.sectionTitle}>{children}</div>;
}

interface AlertCardProps {
  titulo: string;
  contexto: string;
  motivo: string;
  detalle: string;
  severidad: string;
}

export function AlertCard({ titulo, contexto, motivo, detalle, severidad }: AlertCardProps) {
  const tone = severidad === 'danger' ? 'var(--danger)' : severidad === 'warn' ? 'var(--warn)' : 'var(--ink-2)';
  const iconBg =
    severidad === 'danger' ? 'rgba(194, 64, 91, 0.12)' : severidad === 'warn' ? 'rgba(154, 107, 34, 0.12)' : 'var(--fill)';
  const cls =
    severidad === 'danger' ? styles.alertDanger : severidad === 'warn' ? styles.alertWarn : '';
  const Icon = severidad === 'danger' ? AlertOctagon : severidad === 'warn' ? AlertTriangle : Info;

  return (
    <div className={`${styles.alert} ${cls}`}>
      <span className={styles.alertIcon} style={{ color: tone, background: iconBg }}>
        <Icon size={17} strokeWidth={2} />
      </span>
      <div>
        <b className={styles.alertTitle}>{titulo}</b>
        <div className={styles.alertContext}>{contexto}</div>
      </div>
      <div className={styles.alertRight}>
        <div className={styles.alertReason} style={{ color: tone }}>
          {motivo}
        </div>
        <div className={styles.alertDetail}>{detalle}</div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  nombre: string;
  inmuebles: number;
  arrendados: number;
  ocupacionPorcentaje: number;
  canonMensual: string;
  onClick?: () => void;
}

export function ProjectCard({ nombre, inmuebles, arrendados, ocupacionPorcentaje, canonMensual, onClick }: ProjectCardProps) {
  const tone = occupancyColor(ocupacionPorcentaje);
  return (
    <button type="button" className={styles.projectCard} onClick={onClick}>
      <div className={styles.projectCardTop}>
        <span className={styles.projectCardIcon}>
          <Building2 size={18} strokeWidth={2} />
        </span>
        <span className={styles.projectCardName} title={nombre}>
          {nombre}
        </span>
      </div>
      <div className={styles.projectCardCanon}>{canonMensual}</div>
      <ProgressBar value={ocupacionPorcentaje} height={6} color={tone} />
      <div className={styles.projectCardMeta}>
        <span>{ocupacionPorcentaje}% ocupado</span>
        <span>
          {arrendados}/{inmuebles} inmuebles
        </span>
      </div>
    </button>
  );
}

interface SoftCardProps {
  label: string;
  value: string;
  help?: string;
  tone?: 'accent' | 'danger' | 'ok';
}

export function SoftCard({ label, value, help, tone }: SoftCardProps) {
  const color =
    tone === 'accent' ? 'var(--accent)' : tone === 'danger' ? 'var(--danger)' : tone === 'ok' ? 'var(--ok)' : undefined;
  return (
    <div className={styles.soft}>
      <div className={styles.softLabel}>{label}</div>
      <div className={styles.softValue} style={{ color }}>
        {value}
      </div>
      {help && <div className={styles.softHelp}>{help}</div>}
    </div>
  );
}
