import { Search, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./CollectionPanel.module.css";

export function CollectionPanel({ eyebrow, title, description, count, countLabel, children }: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  count: number;
  countLabel: string;
  children: ReactNode;
}) {
  return <section className={styles.panel} aria-label={countLabel + " collection"}>
    <header className={styles.heading}>
      <div className={styles.headingCopy}>
        <p className={styles.eyebrow}><span aria-hidden="true" />{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.count} role="status" aria-live="polite" aria-atomic="true">
        <strong>{count}</strong><span>{count === 1 ? countLabel.replace(/s$/, "") : countLabel}<small>ready to explore</small></span>
      </div>
    </header>
    {children}
  </section>;
}

export function CollectionSearch({ label, placeholder, value, onChange }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return <label className={styles.searchField}>
    <Search size={18} aria-hidden="true" />
    <span><span className={styles.searchLabel}>{label}</span>
      <input aria-label={label} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} enterKeyHint="search" />
    </span>
  </label>;
}

export function CollectionReset({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className={styles.reset}><RotateCcw size={14} aria-hidden="true" />Reset</button>;
}
