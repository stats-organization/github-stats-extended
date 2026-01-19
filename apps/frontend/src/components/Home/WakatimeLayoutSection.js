import React from 'react';
import PropTypes from 'prop-types';

import Section from './Section';
import { Input } from '../Generic';

export const DEFAULT_OPTION = {
  id: 1,
  label: 'Normal',
  disabled: false,
  value: 'default',
};

const WakatimeLayoutSection = ({ selectedOption, setSelectedOption }) => {
  const options = [
    DEFAULT_OPTION,
    { id: 2, label: 'Compact', disabled: false, value: 'compact' },
    {
      id: 3,
      label: 'Text Only',
      disabled: false,
      value: 'default&hide_progress=true&card_width=315',
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

WakatimeLayoutSection.propTypes = {
  selectedOption: PropTypes.object.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
};

export default WakatimeLayoutSection;
