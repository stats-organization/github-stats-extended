import { useId } from "react";
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
  const titleId = useId();
  const { inputValue, setInputValue } = useDebouncedField({
    value,
    onValueChange,
    type: "text",
  });

  return (
    <Section title={title} titleId={titleId}>
      <p>{description}</p>
      <input
        aria-labelledby={titleId}
        type="text"
        className="input mt-2 w-3/4 min-w-48 max-w-xl"
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
