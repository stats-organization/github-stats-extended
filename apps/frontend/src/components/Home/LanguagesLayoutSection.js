import React from 'react';
import PropTypes from 'prop-types';

import Section from './Section';
import { Input } from '../Generic';

export const DEFAULT_OPTION = {
  id: 1,
  label: 'Normal',
  disabled: false,
  value: 'normal',
};

const LanguagesLayoutSection = ({ selectedOption, setSelectedOption }) => {
  const options = [
    DEFAULT_OPTION,
    { id: 2, label: 'Compact', disabled: false, value: 'compact' },
    { id: 3, label: 'Donut', disabled: false, value: 'donut' },
    {
      id: 4,
      label: 'Vertical Donut',
      disabled: false,
      value: 'donut-vertical',
    },
    { id: 5, label: 'Pie', disabled: false, value: 'pie' },
    {
      id: 6,
      label: 'Only Languages',
      disabled: false,
      value: 'compact&hide_progress=true',
    },
  ];

  return (
    <Section title="Card Layout">
      <p>Select a card layout.</p>
      <Input
        options={options}
        selectedOption={selectedOption || DEFAULT_OPTION}
        setSelectedOption={setSelectedOption}
      />
    </Section>
  );
};

LanguagesLayoutSection.propTypes = {
  selectedOption: PropTypes.object.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};

export default LanguagesLayoutSection;
