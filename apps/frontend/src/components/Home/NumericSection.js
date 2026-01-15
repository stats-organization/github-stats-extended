/* eslint-disable react/no-danger */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Section from './Section';

const NumericSection = ({
  title,
  text,
  value,
  setValue,
  min,
  max,
  step,
  disabled,
  placeholder,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Debounce setValue
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (internalValue === value) {
      return undefined;
    }
    debounceTimeout.current = setTimeout(() => {
      setValue(internalValue);
    }, 700);
    return () => clearTimeout(debounceTimeout.current);
  }, [internalValue]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <Section title={title}>
      <p dangerouslySetInnerHTML={{ __html: text }} />
      <input
        type="number"
        className="border border-gray-300 rounded px-2 py-1 mt-2 w-1/4"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
      />
    </Section>
  );
};

NumericSection.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  value: PropTypes.number,
  setValue: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

NumericSection.defaultProps = {
  value: undefined,
  min: undefined,
  max: undefined,
  step: 1,
  disabled: false,
  placeholder: '',
};

export default NumericSection;
