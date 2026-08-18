"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const STAGE_WIDTH = 840;

export function ScaledTemplatePreview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const update = () => {
      const width = frame.clientWidth;
      setScale(width > 0 ? width / STAGE_WIDTH : 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="template-showcase__preview" ref={frameRef}>
      <div aria-hidden="true" className="template-showcase__sizer" />
      <div
        className="template-showcase__stage"
        style={{
          transform: scale > 0 ? `scale(${scale})` : undefined,
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
