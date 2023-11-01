import { dictionaryType } from "@/types";
import fs from "fs";

export default function getWordsFromDictionary(dictionary: dictionaryType) {
  switch (dictionary) {
    case "russian":
    case "english":
      return Object.keys(
        JSON.parse(
          fs.readFileSync(`./utils/dictionaries/${dictionary}.json`, "utf8")
        )
      );
    case "russian-big":
      return fs
        .readFileSync(`./utils/dictionaries/${dictionary}.txt`, "utf8")
        .split("\n");
  }
}
