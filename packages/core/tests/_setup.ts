import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";

// jest-dom exposes its matchers as a module namespace;
// cast to the record shape `expect.extend` expects.
expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

process.env["PAT_1"] = "dummyPAT1";
process.env["PAT_2"] = "dummyPAT2";
