import { TextDecoder, TextEncoder } from "util";

import axios from "axios";
import nock from "nock";
import { afterEach } from "vitest";

//https://stackoverflow.com/a/68468204/1643179
Object.assign(global, { TextDecoder, TextEncoder });

process.env.PAT_1 = "dummyPAT1";
process.env.PAT_2 = "dummyPAT2";

// jsdom provides XMLHttpRequest, so axios would pick its XHR adapter, which nock cannot intercept.
axios.defaults.adapter = "http";
// disable all real network connections except for localhost
nock.disableNetConnect();
// supertest talks to the app under test via a local socket.
nock.enableNetConnect(/^(127\.0\.0\.1|localhost)(:\d+)?$/);

afterEach(() => {
  nock.cleanAll();
});
