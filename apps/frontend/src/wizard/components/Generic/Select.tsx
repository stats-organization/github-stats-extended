import { clsx } from "clsx";
import type { JSX } from "react";

export interface SelectOption {
  id: number;
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Array<SelectOption>;
  selectedOption: SelectOption;

  "aria-labelledby"?: string;

  className?: string;
  disabled?: boolean;

  onOptionChange: (option: SelectOption) => void;
}

export function Select({
  options,
  selectedOption,
  onOptionChange,
  disabled,
  className,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps): JSX.Element {
  return (
    <select
      aria-labelledby={ariaLabelledBy}
      className={clsx("text-base select select-sm w-40 mt-4", className)}
      value={selectedOption.value}
      onChange={(e) => {
        onOptionChange(options[e.target.selectedIndex] as SelectOption);
      }}
      disabled={disabled}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={clsx({
            "bg-primary/20": option.value === selectedOption.value,
          })}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
