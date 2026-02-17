import { TextDecoder, TextEncoder } from "util";

//https://stackoverflow.com/a/68468204/1643179
Object.assign(global, { TextDecoder, TextEncoder });

process.env.PAT_1 = "dummyPAT1";
process.env.PAT_2 = "dummyPAT2";
