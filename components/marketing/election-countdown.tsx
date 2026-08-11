"use client";

import { useEffect, useState } from "react";
import styles from "./campaign-page.module.css";

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function calculateCountdown(targetDate: string): CountdownValue {
  const difference = Math.max(0, new Date(targetDate).getTime() - Date.now());

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    finished: difference === 0,
  };
}

export function ElectionCountdown({ targetDate }: { targetDate: string }) {
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const update = () => setCountdown(calculateCountdown(targetDate));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  if (!countdown) {
    return (
      <p className={styles.countdownLoading} aria-live="polite">
        Voľby sa konajú 24. októbra 2026.
      </p>
    );
  }

  if (countdown.finished) {
    return (
      <p className={styles.countdownLoading} aria-live="polite">
        Volebný deň je tu.
      </p>
    );
  }

  const units = [
    { value: countdown.days, label: "dní" },
    { value: countdown.hours, label: "hodín" },
    { value: countdown.minutes, label: "minút" },
    { value: countdown.seconds, label: "sekúnd" },
  ];

  return (
    <div
      className={styles.countdown}
      role="timer"
      aria-label={`${countdown.days} dní, ${countdown.hours} hodín a ${countdown.minutes} minút do volieb`}
    >
      {units.map((unit) => (
        <span className={styles.countdownUnit} key={unit.label} aria-hidden="true">
          <strong>{String(unit.value).padStart(2, "0")}</strong>
          <small>{unit.label}</small>
        </span>
      ))}
    </div>
  );
}
