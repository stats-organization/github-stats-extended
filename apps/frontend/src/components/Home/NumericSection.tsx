import { useEffect, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";

import { Section } from "./Section";

interface NumericSectionProps {
  title: string;
  description: ReactNode;
  value?: number | undefined;
  onValueChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function NumericSection({
  title,
  description,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
  placeholder,
}: NumericSectionProps): JSX.Element {
  const [internalValue, setInternalValue] = useState(() => value?.toString());
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Debounce onValueChange
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (internalValue === value) {
      return undefined;
    }

    debounceTimeout.current = window.setTimeout(() => {
      const maybeNumber = internalValue && parseInt(internalValue, 10);
      if (typeof maybeNumber !== "number" || Number.isNaN(maybeNumber)) {
        onValueChange(undefined);
      } else {
        onValueChange(maybeNumber);
      }
    }, 700);

    return () => {
      clearTimeout(debounceTimeout.current as number);
    };
  }, [internalValue, onValueChange, value]);

  useEffect(() => {
    setInternalValue(value?.toString());
  }, [value]);

  return (
    <Section title={title}>
      <p>{description}</p>
      <input
        type="number"
        className="border border-gray-300 rounded px-2 py-1 mt-2 w-1/4"
        value={internalValue ?? ""}
        onChange={(e) => {
          setInternalValue(e.target.value);
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
      />
    </Section>
  );
}
