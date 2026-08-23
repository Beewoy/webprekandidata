"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

type StarRatingProps = {
  defaultValue?: number;
  disabled?: boolean;
  error?: string;
  id: string;
  label: string;
  name: string;
};

const STAR_LABELS = ["1 hviezdička", "2 hviezdičky", "3 hviezdičky", "4 hviezdičky", "5 hviezd"];

export function StarRating({
  defaultValue,
  disabled = false,
  error,
  id,
  label,
  name,
}: StarRatingProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset className="star-rating" disabled={disabled}>
      <legend className="star-rating__legend">{label}</legend>
      <div
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn("star-rating__group", error && "star-rating__group--error")}
        role="radiogroup"
      >
        {STAR_LABELS.map((starLabel, index) => {
          const value = index + 1;
          const inputId = `${id}-${value}`;
          return (
            <label className="star-rating__option" htmlFor={inputId} key={value}>
              <input
                defaultChecked={defaultValue === value}
                disabled={disabled}
                id={inputId}
                name={name}
                required={!disabled}
                type="radio"
                value={value}
              />
              <Star aria-hidden="true" className="star-rating__icon" fill="transparent" size={28} strokeWidth={1.75} />
              <span className="sr-only">{starLabel}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <small className="star-rating__error" id={errorId} role="alert">
          {error}
        </small>
      ) : null}
    </fieldset>
  );
}
