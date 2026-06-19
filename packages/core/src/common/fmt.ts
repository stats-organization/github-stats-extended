import { encodeHTML } from "./html.js";
import { splitWrappedText } from "./render.js";

/**
 * Retrieves num with suffix k(thousands) precise to given decimal places.
 *
 * @param num The number to format.
 * @param precision The number of decimal places to include.
 * @returns The formatted number.
 */
const kFormatter = (num: number, precision?: number): string | number => {
  const abs = Math.abs(num);
  const sign = Math.sign(num);

  if (typeof precision === "number" && !isNaN(precision)) {
    return (sign * (abs / 1000)).toFixed(precision) + "k";
  }

  if (abs < 1000) {
    return sign * abs;
  }

  return `${sign * parseFloat((abs / 1000).toFixed(1))}k`;
};

/**
 * Convert bytes to a human-readable string representation.
 *
 * @param bytes The number of bytes to convert.
 * @returns The human-readable representation of bytes.
 * @throws {Error} If bytes is negative or too large.
 */
const formatBytes = (bytes: number): string => {
  if (bytes < 0) {
    throw new Error("Bytes must be a non-negative number");
  }

  if (bytes === 0) {
    return "0 B";
  }

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
  const base = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(base));

  const unit = sizes[i];
  if (unit === undefined) {
    throw new Error("Bytes is too large to convert to a human-readable string");
  }

  return `${(bytes / Math.pow(base, i)).toFixed(1)} ${unit}`;
};

/**
 * Split text over multiple lines based on the card width.
 *
 * @param text Text to split.
 * @param width Available wrap width in px.
 * @param fontSize Font size in px.
 * @param maxLines Maximum number of lines.
 * @returns Array of lines.
 */
const wrapTextMultiline = (
  text: string,
  width: number,
  fontSize: number,
  maxLines = 3,
): Array<string> => {
  const wrapped = splitWrappedText(text, fontSize, width);
  const lines = wrapped
    .map((line) => encodeHTML(line.trim()))
    .slice(0, maxLines); // Only consider maxLines lines

  // Add "..." to the last line if the text exceeds maxLines
  if (wrapped.length > maxLines) {
    const lastIndex = maxLines - 1;
    const lastLine = lines[lastIndex];
    if (lastLine !== undefined) {
      lines[lastIndex] = `${lastLine}...`;
    }
  }

  // Remove empty lines if text fits in less than maxLines lines
  const multiLineText = lines.filter(Boolean);
  return multiLineText;
};

export { kFormatter, formatBytes, wrapTextMultiline };
