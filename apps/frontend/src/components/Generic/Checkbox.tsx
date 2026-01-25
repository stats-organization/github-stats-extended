import type { JSX, ReactNode } from "react";

interface CheckboxProps {
  question: ReactNode;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  const { question, checked, onCheckedChange, disabled = false } = props;

  return (
    <label className="flex inline-row mt-4">
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        className="checkbox mr-2"
        onChange={() => {
          onCheckedChange(!checked);
        }}
      />
      {question}
    </label>
  );
}
