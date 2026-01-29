import type { JSX } from "react";

import { Section } from "./Section";
import { Select } from "../Generic/Select";
import type { SelectOption } from "../Generic/Select";

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
    value: "default&hide_progress=true&card_width=315",
  },
];

interface WakatimeLayoutSectionProps {
  selectedOption: SelectOption | undefined;
  onOptionChange: (option: SelectOption) => void;
}

export function WakatimeLayoutSection({
  selectedOption,
  onOptionChange,
}: WakatimeLayoutSectionProps): JSX.Element {
  return (
    <Section title="Card Layout">
      <p>Select a card layout.</p>
      <Select
        options={options}
        selectedOption={selectedOption || DEFAULT_OPTION}
        onOptionChange={onOptionChange}
      />
    </Section>
  );
}
