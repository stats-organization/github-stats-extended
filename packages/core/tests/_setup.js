import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);

process.env.PAT_1 = "dummyPAT1";
process.env.PAT_2 = "dummyPAT2";
