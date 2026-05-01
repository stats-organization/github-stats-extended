// @ts-check

import { queryByTestId } from "@testing-library/dom";
import { describe, expect, it } from "vitest";

import {
  countWrappedLines,
  renderError,
  splitWrappedText,
} from "../src/common/render.js";

describe("Test splitWrappedText", () => {
  it("should return an empty array for empty text", () => {
    expect(splitWrappedText("", 10, 200)).toEqual([]);
  });

  it("should split a two-word string across lines", () => {
    expect(splitWrappedText("hello world", 10, 25)).toEqual([
      "hello",
      "world",
    ]);
  });

  it("should split a word wider than maxWidth", () => {
    expect(splitWrappedText("aaaa", 10, 15)).toEqual(["aa", "aa"]);
  });

  it("should handle mix of short and long words", () => {
    expect(splitWrappedText("short looooong", 10, 40)).toEqual([
      "short",
      "looooon",
      "g",
    ]);
  });

  it("should handle complex whitespace characters", () => {
    expect(splitWrappedText("One         two three", 10, 25)).toEqual([
      "One",
      "     ",
      "  ",
      "two",
      "three",
    ]);
  });

  it("trailing spaces should not cause line breaks", () => {
    expect(splitWrappedText("hi hi ", 10, 8)).toEqual(["hi", "hi"]);
  });
});

describe("Test countWrappedLines", () => {
  it("should return 1 for empty text", () => {
    expect(countWrappedLines("", 10, 200, 10)).toBe(1);
  });

  it("should return 1 when all text fits on a single line", () => {
    expect(countWrappedLines("hi", 10, 200, 10)).toBe(1);
  });

  it("should return 2 when a two-word string wraps", () => {
    expect(countWrappedLines("hello world", 10, 25, 10)).toBe(2);
  });

  it("should split a word wider than maxWidth (overflow-wrap: anywhere)", () => {
    expect(countWrappedLines("aaaa", 10, 15, 10)).toBe(2);
  });

  it("should cap the result at maxLines", () => {
    expect(countWrappedLines("word ".repeat(10), 10, 25, 3)).toBe(3);
  });

  it("should handle complex whitespace characters", () => {
    expect(countWrappedLines("One         two three", 10, 25, 10)).toBe(5);
  });

  it("trailing spaces should not cause line breaks", () => {
    expect(countWrappedLines("hi hi ", 10, 8, 10)).toBe(2);
  });

});

describe("Test renderError", () => {
  it("should contain error messages", () => {
    document.body.innerHTML = renderError({ message: "Something went wrong" });
    expect(
      queryByTestId(document.body, "message")?.children[0],
    ).toHaveTextContent(/Something went wrong/gim);
    expect(
      queryByTestId(document.body, "message")?.children[1],
    ).toBeEmptyDOMElement();

    // Secondary message
    document.body.innerHTML = renderError({
      message: "Something went wrong",
      secondaryMessage: "Secondary Message",
    });
    expect(
      queryByTestId(document.body, "message")?.children[1],
    ).toHaveTextContent(/Secondary Message/gim);
  });
});
