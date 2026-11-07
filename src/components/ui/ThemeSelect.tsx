"use client";

import { Check, ChevronDown, Monitor, Moon, Sun, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ThemePreference } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelect.module.css";

const MODES = [
  { value: "light", label: "Light", description: "Bright & airy", icon: Sun },
  { value: "dark", label: "Dark", description: "Calm & focused", icon: Moon },
  { value: "system", label: "System", description: "Match device", icon: Monitor },
] as const;

export function ThemeSelect() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  function positionPanel() {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(260, window.innerWidth - 24);
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`;
    panel.style.top = `${Math.max(12, Math.min(rect.bottom + 12, window.innerHeight - panel.offsetHeight - 12))}px`;
    panel.style.maxHeight = `${window.innerHeight - 24}px`;
  }

  useEffect(() => {
    if (!open) return;
    positionPanel();
    panelRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus({ preventScroll: true });
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [open]);

  function choose(next: ThemePreference) {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPreference(next, rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : undefined);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={id}
        aria-label={`Appearance: ${preference}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={styles.trigger}
        data-mode={resolvedTheme}
        data-open={open}
      >
        <span className={styles.orb} aria-hidden="true">
          <Sun className={styles.sun} size={17} />
          <Moon className={styles.moon} size={16} />
          <span className={styles.star} />
        </span>
        <span className={styles.triggerLabel}>{preference === "system" ? "Auto" : preference === "dark" ? "Dark" : "Light"}</span>
        <ChevronDown size={13} className={styles.chevron} aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        role="dialog"
        aria-label="Appearance settings"
        aria-describedby={`${id}-description`}
        className={styles.panel}
        onBeforeToggle={(event) => { if (event.newState === "open") positionPanel(); }}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>MAKE IT YOURS</p>
            <h2>Appearance</h2>
          </div>
          <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label="Close appearance settings" className={styles.close}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
        <p id={`${id}-description`} className="sr-only">Choose your favourite light for UrbanRise.</p>
        <fieldset className={styles.options}>
          <legend className="sr-only">Choose appearance</legend>
          {MODES.map(({ value, label, description, icon: Icon }) => (
            <label key={value} className={styles.option} title={description}>
              <input type="radio" name={`${id}-theme`} value={value} aria-label={label} aria-describedby={`${id}-${value}-description`} checked={preference === value} onChange={() => choose(value)} className={styles.input} />
              <span className={styles.card}>
                <span className={styles.preview} data-preview={value} aria-hidden="true">
                  <span className={styles.previewBar}><i /><i /><i /></span>
                  <span className={styles.previewContent}>
                    <span className={styles.previewCopy}><i /><i /><i /></span>
                    <span className={styles.previewHouse}><i /><i /></span>
                  </span>
                  <span className={styles.previewTiles}><i /><i /><i /></span>
                </span>
                <span className={styles.cardLabel}><Icon size={14} aria-hidden="true" />{label}</span>
                <span id={`${id}-${value}-description`} className="sr-only">{description}</span>
                <span className={styles.selected} aria-hidden="true"><Check size={10} strokeWidth={3} /></span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className={styles.footer}>
          <span className={styles.statusDot} aria-hidden="true" />
          <p role="status">{preference === "system" ? `Auto · ${resolvedTheme === "dark" ? "Dark" : "Light"}` : `${preference === "dark" ? "Dark" : "Light"} mode`}</p>
          <Monitor size={13} aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
