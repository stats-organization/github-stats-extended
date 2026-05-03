import fs from "fs";

import axios from "axios";
import { default as jsYaml } from "js-yaml";
import * as prettier from "prettier";

const LANGS_FILEPATH = "./src/common/languageColors.json";

// Retrieve languages from github linguist repository yaml file
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

// Debug Print
// console.dir(languageColors);
const jsonString = JSON.stringify(languageColors);
fs.writeFileSync(
  LANGS_FILEPATH,
  await prettier.format(jsonString, { parser: "json" }),
);
