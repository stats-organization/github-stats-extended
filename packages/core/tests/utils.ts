import { vi } from "vitest";

import type * as loggerModule from "../src/common/log.js";

/**
 * Creates an asymmetric matcher for approximate numeric equality.
 *
 * This helper is intended for use in test frameworks (e.g., Jest) where
 * values need to be compared within a configurable decimal precision
 * instead of strict equality.
 *
 * The comparison succeeds when:
 *
 *   |actual - expected| < 10^(-precision)
 *
 * For example, with `precision = 3`, values must be within `0.001`.
 *
 * @param expected The expected numeric value to compare against.
 *
 * @param
 *   The number of decimal places of tolerance. Higher values mean stricter
 *   comparison. Internally converted to epsilon = 10^-precision.
 *
 * @returns An object implementing Jest-style asymmetric matcher methods.
 *
 */
export function approxNumber(
  expected: number,
  precision = 10,
): {
  asymmetricMatch(actual: unknown): boolean;
  toAsymmetricMatcher(): string;
} {
  return {
    asymmetricMatch(actual) {
      if (typeof actual !== "number" || typeof expected !== "number") {
        return false;
      }
      const epsilon = Math.pow(10, -precision);
      return Math.abs(actual - expected) < epsilon;
    },
    toAsymmetricMatcher() {
      return `≈ ${expected} (precision ${precision})`;
    },
  };
}

/**
 * Helper to create logger module mocks to use in unit tests.
 * If you need to perform assertions on logger use `vi.mocked`.
 *
 * @example
 * ```ts
 * import { logger } from "../src/common/log.js";
 *
 * vi.mock(import("../src/common/log.js"), async () => {
 *  const { createLoggerMock } = await import("./utils.js");
 *  return createLoggerMock();
 * });
 *
 * const logSpy = vi.mocked(logger.log);
 * ```
 *
 * @returns mocked logger module
 */
export function createLoggerMock(): typeof loggerModule {
  return {
    logger: {
      log: vi.fn(),
      error: vi.fn(),
    },
  };
}
