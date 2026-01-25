import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";

import { Section } from "./Section";

interface NumericSectionProps {
  title: string;
  text: string;
  value?: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function NumericSection({
  title,
  text,
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
    // Debounce setValue
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (internalValue === value) {
      return undefined;
    }

    const maybeNumber = internalValue && parseInt(internalValue, 10);
    if (typeof maybeNumber !== "number" || Number.isNaN(maybeNumber)) {
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      onValueChange(maybeNumber);
    }, 700);

    return () => {
      clearTimeout(debounceTimeout.current as number);
    };
  }, [internalValue]);

  useEffect(() => {
    setInternalValue(value?.toString());
  }, [value]);

  return (
    <Section title={title}>
      <p>{text}</p>
      <input
        type="number"
        className="border border-gray-300 rounded px-2 py-1 mt-2 w-1/4"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
      />
    </Section>
  );
}
