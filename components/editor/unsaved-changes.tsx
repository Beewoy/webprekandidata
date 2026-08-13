"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";

type UnsavedChangesContextValue = {
  isDirty: boolean;
  setDirty: (sourceId: string, dirty: boolean) => void;
  clearAllDirty: () => void;
  requestNavigation: (href: string) => Promise<boolean>;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function useUnsavedChanges() {
  const value = useContext(UnsavedChangesContext);
  if (!value) throw new Error("useUnsavedChanges musí byť v UnsavedChangesProvider.");
  return value;
}

export function useRegisterDirty(sourceId: string, dirty: boolean) {
  const { setDirty } = useUnsavedChanges();
  useEffect(() => {
    setDirty(sourceId, dirty);
    return () => setDirty(sourceId, false);
  }, [dirty, setDirty, sourceId]);
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sources, setSources] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingResolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const isDirty = useMemo(() => Object.values(sources).some(Boolean), [sources]);

  const setDirty = useCallback((sourceId: string, dirty: boolean) => {
    setSources((current) => {
      if (!dirty) {
        if (!(sourceId in current)) return current;
        const next = { ...current };
        delete next[sourceId];
        return next;
      }
      if (current[sourceId]) return current;
      return { ...current, [sourceId]: true };
    });
  }, []);

  const clearAllDirty = useCallback(() => {
    setSources({});
  }, []);

  const confirmLeave = useCallback(() => {
    if (!isDirty) return Promise.resolve(true);
    setDialogOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingResolveRef.current = resolve;
    });
  }, [isDirty]);

  const finishConfirm = useCallback((confirmed: boolean) => {
    setDialogOpen(false);
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolve?.(confirmed);
  }, []);

  const requestNavigation = useCallback(
    async (href: string) => {
      const confirmed = await confirmLeave();
      if (!confirmed) return false;
      clearAllDirty();
      router.push(href);
      return true;
    },
    [clearAllDirty, confirmLeave, router],
  );

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty]);

  useEffect(() => {
    if (!dialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishConfirm(false);
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen, finishConfirm]);

  const value = useMemo(
    () => ({ isDirty, setDirty, clearAllDirty, requestNavigation }),
    [isDirty, setDirty, clearAllDirty, requestNavigation],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      {dialogOpen && (
        <div className="admin-dialog unsaved-changes-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            className="admin-dialog__backdrop"
            type="button"
            aria-label="Zostať na stránke"
            onClick={() => finishConfirm(false)}
          />
          <div className="admin-dialog__panel panel" ref={panelRef}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Neuložené zmeny</p>
                <h2 id={titleId}>Máte neuložené zmeny</h2>
              </div>
            </div>
            <p className="admin-dialog__intro">
              Ak odídete bez uloženia, rozpracované úpravy v tejto sekcii sa stratia.
            </p>
            <div className="admin-dialog__actions">
              <button className="button button--secondary" type="button" onClick={() => finishConfirm(false)}>
                Zostať
              </button>
              <button className="button button--primary" type="button" onClick={() => finishConfirm(true)}>
                Odísť bez uloženia
              </button>
            </div>
          </div>
        </div>
      )}
    </UnsavedChangesContext.Provider>
  );
}

type GuardedLinkProps = ComponentProps<typeof Link> & {
  onNavigate?: () => void;
};

export function GuardedLink({ href, onClick, onNavigate, children, ...props }: GuardedLinkProps) {
  const { isDirty, requestNavigation } = useUnsavedChanges();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!isDirty) {
      onNavigate?.();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    void requestNavigation(hrefString).then((ok) => {
      if (ok) onNavigate?.();
    });
  }

  return (
    <Link {...props} href={href} prefetch={false} onClick={handleClick}>
      {children}
    </Link>
  );
}
