import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { Section } from "./Section";
import { classnames } from "../../utils";

const TextSection = ({
  title,
  description,
  value,
  setValue,
  disabled,
  placeholder,
  onPaste,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

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
    // return cleanup function:
    return () => clearTimeout(debounceTimeout.current);
  }, [internalValue]);

  return (
    <Section title={title}>
      <p>{description}</p>
      <input
        type="text"
        className={classnames(
          "border border-gray-300 rounded px-2 py-1 mt-2 w-3/4 min-w-48 max-w-xl",
          disabled ? "cursor-not-allowed" : "",
        )}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        onPaste={onPaste}
      />
    </Section>
  );
};

TextSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  onPaste: PropTypes.func,
};

TextSection.defaultProps = {
  disabled: false,
  placeholder: "",
  onPaste: undefined,
};

export { TextSection };
