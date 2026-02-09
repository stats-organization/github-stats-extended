import type { JSX } from "react";

import { Checkbox } from "../Generic/Checkbox";

import { Section } from "./Section";

interface CheckboxSectionProps {
  title: string;
  question: string;
  checked: boolean;

  text?: string;
  disabled?: boolean;

  onCheckedChange: (check: boolean) => void;
}

export function CheckboxSection({
  title,
  text,
  question,
  checked,
  onCheckedChange,
  disabled = false,
}: CheckboxSectionProps): JSX.Element {
  return (
    <Section title={title}>
      {text && <p>{text}</p>}
      <Checkbox
        question={question}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </Section>
  );
}
