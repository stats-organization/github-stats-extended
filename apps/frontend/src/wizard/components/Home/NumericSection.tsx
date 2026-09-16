import { useId } from "react";
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
  const titleId = useId();
  const { inputValue, setInputValue } = useDebouncedField({
    value,
    onValueChange,
    type: "number",
  });

  return (
    <Section title={title} titleId={titleId}>
      <p>{description}</p>
      <input
        aria-labelledby={titleId}
        type="number"
        className="input validator mt-2 w-1/4"
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
      {/*
       * Hidden until the field is `:user-invalid`, then shown in the error color.
       * The hint reserves its box either way and adds a gap no other `Section` has.
       * Take that back out of `Section`'s `pb-12` with `h-0`.
       */}
      <p className="validator-hint h-0">
        Enter a number between {min} and {max}.
      </p>
    </Section>
  );
}
