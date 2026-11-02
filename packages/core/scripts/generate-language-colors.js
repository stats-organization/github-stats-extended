import fs from "fs";

import axios from "axios";
import * as jsYaml from "js-yaml";
import * as prettier from "prettier";

const LANGS_FILEPATH = "./src/common/languageColors.json";

// Retrieve languages from GitHub linguist repository yaml file
const response = await axios.get(
  "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml",
);

// and convert them to a JS Object
const languages = jsYaml.load(response.data);

const languageColors = {};

// Filter only language colors from the whole file
Object.keys(languages).forEach((lang) => {
  languageColors[lang] = languages[lang].color;
});

// Check for case-insensitive duplicates
const seen = new Map();
for (const name of Object.keys(languageColors)) {
  const lower = name.toLowerCase();
  if (seen.has(lower)) {
    throw new Error(
      `Case-insensitive duplicate language: "${seen.get(lower)}" vs "${name}"`,
    );
  }
  seen.set(lower, name);
}

const jsonString = JSON.stringify(languageColors);
fs.writeFileSync(
  LANGS_FILEPATH,
  await prettier.format(jsonString, { parser: "json" }),
);
