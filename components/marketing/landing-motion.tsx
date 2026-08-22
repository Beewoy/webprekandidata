"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function LandingMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery.matches) return;

      const media = gsap.matchMedia();

      media.add("(min-width: 720px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-proof-card]");

        cards.forEach((card) => {
          const visual = card.querySelector<HTMLElement>("[data-proof-media]");
          if (!visual) return;

          gsap.fromTo(
            visual,
            { opacity: 0.42, scale: 0.84 },
            {
              ease: "none",
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "center 52%",
                scrub: 0.8,
              },
            },
          );

          gsap.to(card, {
            ease: "none",
            opacity: 0.24,
            scrollTrigger: {
              trigger: card,
              start: "bottom 44%",
              end: "bottom 12%",
              scrub: 0.8,
            },
          });
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh, { once: true });

      return () => {
        window.removeEventListener("load", refresh);
        media.revert();
      };
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
