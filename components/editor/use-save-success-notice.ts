"use client";

import { useEffect, useRef, useState } from "react";

export type EditorSaveState = "saved" | "dirty" | "saving" | "error";

const DEFAULT_MESSAGE = "Zmeny boli uložené.";
const NOTICE_DURATION_MS = 4000;

export function useSaveSuccessNotice(saveState: EditorSaveState, message = DEFAULT_MESSAGE) {
  const [noticeVisible, setNoticeVisible] = useState(false);
  const previousStateRef = useRef<EditorSaveState>(saveState);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const previousState = previousStateRef.current;
    previousStateRef.current = saveState;

    if (saveState !== "saved" || previousState === "saved") return;

    setNoticeVisible(true);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setNoticeVisible(false);
      timeoutRef.current = null;
    }, NOTICE_DURATION_MS);
  }, [saveState]);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  return { noticeVisible, noticeMessage: message };
}
