import type { JSX } from "react";

import { Select } from "../Generic/Select";
import type { SelectOption } from "../Generic/Select";

import { Section } from "./Section";

export const DEFAULT_OPTION: SelectOption = {
  id: 1,
  label: "Rank",
  value: "default",
  disabled: false,
};

const options: Array<SelectOption> = [
  DEFAULT_OPTION,
  { id: 2, label: "Percentile", value: "percentile", disabled: false },
  { id: 3, label: "GitHub", value: "github", disabled: false },
  { id: 4, label: "None", value: "default&hide_rank=true", disabled: false },
];

interface StatsRankSectionProps {
  selectedOption: SelectOption;
  onOptionChange: (option: SelectOption) => void;
}

export function StatsRankSection({
  selectedOption,
  onOptionChange,
}: StatsRankSectionProps): JSX.Element {
  return (
    <Section title="Progress Style">
      <p>Select a progress style.</p>
      <Select
        options={options}
        selectedOption={selectedOption || DEFAULT_OPTION}
        onOptionChange={onOptionChange}
      />
    </Section>
  );
}
