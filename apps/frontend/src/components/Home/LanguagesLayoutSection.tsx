import type { JSX } from "react";

import { Section } from "./Section";
import { Select } from "../Generic/Select";
import type { SelectOption } from "../Generic/Select";

export const DEFAULT_OPTION: SelectOption = {
  id: 1,
  label: "Normal",
  disabled: false,
  value: "normal",
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
    label: "Donut",
    disabled: false,
    value: "donut",
  },
  {
    id: 4,
    label: "Vertical Donut",
    disabled: false,
    value: "donut-vertical",
  },
  {
    id: 5,
    label: "Pie",
    disabled: false,
    value: "pie",
  },
  {
    id: 6,
    label: "Only Languages",
    disabled: false,
    value: "compact&hide_progress=true",
  },
];

interface LanguagesLayoutSectionProps {
  selectedLanguageLayoutOption: SelectOption;
  onLanguageLayoutOptionChange: (option: SelectOption) => void;
}

export function LanguagesLayoutSection({
  selectedLanguageLayoutOption,
  onLanguageLayoutOptionChange,
}: LanguagesLayoutSectionProps): JSX.Element {
  return (
    <Section title="Card Layout">
      <p>Select a card layout.</p>
      <Select
        options={options}
        selectedOption={selectedLanguageLayoutOption || DEFAULT_OPTION}
        onOptionChange={onLanguageLayoutOptionChange}
      />
    </Section>
  );
}
