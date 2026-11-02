import { useId } from "react";
import type { JSX } from "react";

import { Select } from "../Generic/Select";
import type { SelectOption } from "../Generic/Select";

import { Section } from "./Section";

export const DEFAULT_OPTION: SelectOption = {
  id: 1,
  label: "Normal",
  disabled: false,
  value: "default",
};

const options: Array<SelectOption> = [
  DEFAULT_OPTION,
  {
    id: 2,
    label: "Compact",
    disabled: false,
    value: "compact",
  },
  {
    id: 3,
    label: "Text Only",
    disabled: false,
    value: "hide_progress",
  },
];

interface WakatimeLayoutSectionProps {
  selectedOption: SelectOption;
  onOptionChange: (option: SelectOption) => void;
}

export function WakatimeLayoutSection({
  selectedOption,
  onOptionChange,
}: WakatimeLayoutSectionProps): JSX.Element {
  const titleId = useId();

  return (
    <Section title="Card Layout" titleId={titleId}>
      <p>Select a card layout.</p>
      <Select
        aria-labelledby={titleId}
        options={options}
        selectedOption={selectedOption}
        onOptionChange={onOptionChange}
      />
    </Section>
  );
}
