"use client";

import { Check } from "lucide-react";

type SaveSuccessNoticeProps = {
  message?: string;
  visible: boolean;
};

export function SaveSuccessNotice({ message = "Zmeny boli uložené.", visible }: SaveSuccessNoticeProps) {
  if (!visible) return null;

  return (
    <div className="autosave-success" role="status">
      <Check aria-hidden="true" size={18} />
      <span>{message}</span>
    </div>
  );
}
