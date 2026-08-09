import { useEffect, useRef, useState } from "react";

type DebouncedFieldType = "text" | "number";

/** Value type handled by the hook for a given input {@link DebouncedFieldType} */
type DebouncedFieldValue<T extends DebouncedFieldType> = T extends "number"
  ? number | undefined
  : string;

interface UseDebouncedFieldResult {
  /** Controlled value for the `<input>` */
  inputValue: string;
  /** Updates the local value; the parent is notified after the debounce */
  setInputValue: (input: string) => void;
}

const DEFAULT_DELAY_MS = 700;

/** Render any supported field value as the string shown in the `<input>` */
const toInputString = (value: string | number | undefined): string =>
  value == null ? "" : String(value);

/** Parse an edited input string into a number (or `undefined` if empty/NaN) */
const toNumber = (input: string): number | undefined => {
  if (!input) {
    return undefined;
  }
  const parsed = parseInt(input, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * Local, debounced state for a controlled text input that mirrors an external value.
 * Keeps a string copy of `value`, resets that copy when `value` changes,
 * and notifies `onValueChange` once the user stops typing for `delay` milliseconds.
 * `type` decides how the edited string is parsed before it is emitted
 * (kept as a string for `"text"`, parsed to a number for `"number"`).
 */
export function useDebouncedField<T extends DebouncedFieldType>({
  value,
  onValueChange,
  type,
  delay = DEFAULT_DELAY_MS,
}: {
  value: DebouncedFieldValue<T>;
  onValueChange: (value: DebouncedFieldValue<T>) => void;
  type: T;
  delay?: number;
}): UseDebouncedFieldResult {
  const [inputValue, setInputValue] = useState(() => toInputString(value));
  const debounceTimeoutRef = useRef<number | null>(null);

  // Reset the local value when the incoming prop changes by adjusting state
  // during render — React's recommended alternative to a syncing effect:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(toInputString(value));
  }

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }
    // Nothing to emit while the input still mirrors the source value
    if (inputValue === toInputString(value)) {
      return undefined;
    }
    debounceTimeoutRef.current = window.setTimeout(() => {
      const nextValue = type === "number" ? toNumber(inputValue) : inputValue;
      // `type` guarantees `nextValue` matches the caller's value variant
      onValueChange(nextValue as DebouncedFieldValue<T>);
    }, delay);

    return () => {
      window.clearTimeout(debounceTimeoutRef.current as number);
    };
  }, [inputValue, value, onValueChange, type, delay]);

  return { inputValue, setInputValue };
}
