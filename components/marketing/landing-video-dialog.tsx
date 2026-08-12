"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const focusableSelector =
  'button:not([disabled]), a[href], video[controls], [tabindex]:not([tabindex="-1"])';

export function LandingVideoDialog() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const closeDialog = useCallback(() => {
    videoRef.current?.pause();
    setOpen(false);
  }, []);

  useEffect(() => {
    function handleExpandClick(event: MouseEvent) {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-video-expand]") : null;
      if (!target) return;

      event.preventDefault();
      triggerRef.current = target;
      document.querySelector<HTMLVideoElement>(".video-demo-player video")?.pause();
      setOpen(true);
    }

    document.addEventListener("click", handleExpandClick);
    return () => document.removeEventListener("click", handleExpandClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>(".video-demo-modal__close")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [closeDialog, open]);

  if (!open) return null;

  return (
    <div
      aria-labelledby="video-demo-dialog-title"
      aria-modal="true"
      className="video-demo-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      role="dialog"
    >
      <div className="video-demo-modal__dialog" ref={dialogRef}>
        <h2 className="video-demo-visually-hidden" id="video-demo-dialog-title">
          Zväčšená ukážka administrácie
        </h2>
        <button
          aria-label="Zavrieť video"
          className="video-demo-modal__close"
          onClick={closeDialog}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
        <video
          aria-label="Zväčšená ukážka jednoduchej administrácie WebPreKandidata.sk"
          controls
          playsInline
          poster="/images/cms-demo-poster.webp"
          preload="metadata"
          ref={videoRef}
          tabIndex={0}
        >
          <source src="/videos/cms-demo.mp4" type="video/mp4" />
          Váš prehliadač nepodporuje prehrávanie videa.
        </video>
      </div>
    </div>
  );
}
