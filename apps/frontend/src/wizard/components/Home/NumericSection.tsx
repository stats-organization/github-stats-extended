import type { JSX, ReactNode } from "react";

import { useDebouncedField } from "../../hooks/useDebouncedField";

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
  const { inputValue, setInputValue } = useDebouncedField({
    value,
    onValueChange,
    type: "number",
  });

  return (
    <Section title={title}>
      <p>{description}</p>
      <input
        type="number"
        className="border border-base-content/20 rounded px-2 py-1 mt-2 w-1/4 bg-base-100"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
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
