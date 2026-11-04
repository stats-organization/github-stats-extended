import "@testing-library/jest-dom/vitest";
import axios from "axios";
import nock from "nock";
import { afterEach } from "vitest";

process.env["PAT_1"] = "dummyPAT1";
process.env["PAT_2"] = "dummyPAT2";

// jsdom provides XMLHttpRequest, so axios would pick its XHR adapter, which nock cannot intercept.
axios.defaults.adapter = "http";
nock.disableNetConnect();

afterEach(() => {
  nock.cleanAll();
});
