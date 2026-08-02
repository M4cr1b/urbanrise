"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * The shortlist ("basket" in the reference tool): the comparables a valuer has
 * gathered as evidence for the subject property, plus the rationale and
 * opinion of value carried through the workflow stages.
 *
 * Backed by localStorage through `useSyncExternalStore` rather than
 * state-plus-effect. localStorage genuinely is an external store, and this is
 * the API built for one: it gives a stable server snapshot (so SSR and the
 * first client render agree), it syncs across tabs for free, and it avoids the
 * cascading render that hydrating into `useState` from an effect causes.
 *
 * Moves to a `valuations` row in Supabase once auth is wired.
 */

const STORAGE_KEY = "urbanrise.shortlist.v1";

interface ShortlistState {
  ids: string[];
  rationale: string;
  opinion: number | null;
}

const EMPTY: ShortlistState = { ids: [], rationale: "", opinion: null };

/* --- The external store -------------------------------------------------- */

const listeners = new Set<() => void>();

// Cached so getSnapshot returns a referentially stable value between writes —
// returning a fresh object each call would loop the render forever.
let snapshot: ShortlistState = EMPTY;
let loaded = false;

function read(): ShortlistState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ShortlistState>;
    return {
      ids: Array.isArray(parsed.ids) ? parsed.ids : [],
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
      opinion: typeof parsed.opinion === "number" ? parsed.opinion : null,
    };
  } catch {
    // Corrupt or unavailable storage is not worth failing the page over.
    return EMPTY;
  }
}

function getSnapshot(): ShortlistState {
  if (!loaded) {
    snapshot = read();
    loaded = true;
  }
  return snapshot;
}

/** The server has no localStorage; an empty shortlist is the honest snapshot. */
function getServerSnapshot(): ShortlistState {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Keep multiple tabs of the same valuation in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: ShortlistState) {
  snapshot = next;
  loaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing can reject writes; the session still works in memory.
  }
  for (const listener of listeners) listener();
}

/* --- Hook ---------------------------------------------------------------- */

export function useShortlist() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    write({
      ...current,
      ids: current.ids.includes(id)
        ? current.ids.filter((x) => x !== id)
        : [...current.ids, id],
    });
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  const setRationale = useCallback((rationale: string) => {
    write({ ...getSnapshot(), rationale });
  }, []);

  const setOpinion = useCallback((opinion: number | null) => {
    write({ ...getSnapshot(), opinion });
  }, []);

  return useMemo(
    () => ({
      ids: state.ids,
      count: state.ids.length,
      has: (id: string) => state.ids.includes(id),
      toggle,
      clear,
      rationale: state.rationale,
      setRationale,
      opinion: state.opinion,
      setOpinion,
    }),
    [state, toggle, clear, setRationale, setOpinion],
  );
}

/**
 * Kept as a no-op wrapper so the workbench layout still declares the boundary
 * where shortlist state lives, and so swapping to a Supabase-backed provider
 * later is a change in one file.
 */
export function ShortlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
