import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import type { ClipboardEventHandler, JSX, ReactNode } from "react";

import { Section } from "./Section";

interface TextSectionProps {
  title: string;
  description: ReactNode;
  value: string;
  onValueChange: (value: string) => void;

  disabled?: boolean;
  placeholder?: string;

  onPaste?: ClipboardEventHandler<HTMLInputElement>;
}

export function TextSection({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  onPaste,
}: TextSectionProps): JSX.Element {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    // Debounce onValueChange
    if (debounceTimeout.current) {
      window.clearTimeout(debounceTimeout.current);
    }
    if (internalValue === value) {
      return undefined;
    }
    debounceTimeout.current = window.setTimeout(() => {
      onValueChange(internalValue);
    }, 700);
    // return cleanup function:
    return () => {
      window.clearTimeout(debounceTimeout.current as number);
    };
  }, [internalValue, onValueChange, value]);

  return (
    <Section title={title}>
      <p>{description}</p>
      <input
        type="text"
        className={clsx(
          "border border-gray-300 rounded px-2 py-1 mt-2 w-3/4 min-w-48 max-w-xl",
          { "cursor-not-allowed": disabled },
        )}
        value={internalValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
        }}
        disabled={disabled}
        placeholder={placeholder}
        onPaste={onPaste}
      />
    </Section>
  );
}
