import { clsx } from "clsx";
import type { ClipboardEventHandler, JSX, ReactNode } from "react";

import { useDebouncedField } from "../../hooks/useDebouncedField";

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
  const { inputValue, setInputValue } = useDebouncedField({
    value,
    onValueChange,
    type: "text",
  });

  return (
    <Section title={title}>
      <p>{description}</p>
      <input
        type="text"
        className={clsx(
          "border border-base-content/20 rounded px-2 py-1 mt-2 w-3/4 min-w-48 max-w-xl",
          disabled ? "cursor-not-allowed bg-base-200" : "bg-base-100",
        )}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        disabled={disabled}
        placeholder={placeholder}
        onPaste={onPaste}
      />
    </Section>
  );
}
