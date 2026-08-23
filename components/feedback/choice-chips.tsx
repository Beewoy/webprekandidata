"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

type ChoiceChipOption = {
  id: string;
  label: string;
};

type ChoiceChipsProps = {
  disabled?: boolean;
  error?: string;
  legend: string;
  maxSelected?: number;
  name: string;
  options: ReadonlyArray<ChoiceChipOption>;
};

export function ChoiceChips({
  disabled = false,
  error,
  legend,
  maxSelected = 4,
  name,
  options,
}: ChoiceChipsProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<string[]>([]);
  const errorId = error ? `${groupId}-error` : undefined;
  const limitReached = selected.length >= maxSelected;

  return (
    <fieldset className="choice-chips" disabled={disabled}>
      <legend className="choice-chips__legend">{legend}</legend>
      <small className="choice-chips__hint">Voliteľné · najviac {maxSelected}</small>
      <div
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn("choice-chips__group", error && "choice-chips__group--error")}
      >
        {options.map((option) => {
          const inputId = `${groupId}-${option.id}`;
          const checked = selected.includes(option.id);
          const isDisabled = disabled || (!checked && limitReached);
          return (
            <label
              className={cn("choice-chips__chip", checked && "choice-chips__chip--selected")}
              htmlFor={inputId}
              key={option.id}
            >
              <input
                checked={checked}
                disabled={isDisabled}
                id={inputId}
                name={name}
                onChange={(event) => {
                  setSelected((current) => {
                    if (event.target.checked) {
                      return current.length >= maxSelected ? current : [...current, option.id];
                    }
                    return current.filter((value) => value !== option.id);
                  });
                }}
                type="checkbox"
                value={option.id}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <small className="choice-chips__error" id={errorId} role="alert">
          {error}
        </small>
      ) : null}
    </fieldset>
  );
}
