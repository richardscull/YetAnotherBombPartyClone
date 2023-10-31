import fs from "fs";
import { getLobby } from "../lobbyUtils";

export default async function generatePrompt(lobbyId: string) {
  const lobby = await getLobby(lobbyId);
  if (!lobby) return console.log("Lobby not found");

  const words = Object.keys(
    JSON.parse(
      fs.readFileSync(`./utils/dictionaries/${lobby.dictionary}.json`, "utf8")
    )
  );

  if (!words) return console.error("Dictionary not found");

  const word = words[Math.floor(Math.random() * words.length)];
  const chanceForThreeLetters = lobby.dictionary === "english" ? 0.7 : 0.85;

  let prompt = getRandomLetters(word, chanceForThreeLetters);
  while (prompt.includes("-")) {
    prompt = getRandomLetters(word, chanceForThreeLetters);
  }

  return prompt;
}

function getRandomLetters(word: string, chanceForThreeLetters: number) {
  const letters = word.split("");

  if (letters.length >= 3 && Math.random() > chanceForThreeLetters) {
    return getRandomThreeLetters(letters).toLowerCase();
  } else if (letters.length >= 2) {
    return getRandomTwoLetters(letters).toLowerCase();
  } else {
    return letters[Math.floor(Math.random() * letters.length)].toLowerCase();
  }
}

function getRandomTwoLetters(letters: string[]) {
  const randomLetterIndex = Math.floor(Math.random() * letters.length);
  if (!letters[randomLetterIndex + 1]) return getRandomTwoLetters(letters);
  return letters[randomLetterIndex] + letters[randomLetterIndex + 1];
}

function getRandomThreeLetters(letters: string[]) {
  const randomLetterIndex = Math.floor(Math.random() * letters.length);
  if (!letters[randomLetterIndex + 2]) return getRandomThreeLetters(letters);
  return (
    letters[randomLetterIndex] +
    letters[randomLetterIndex + 1] +
    letters[randomLetterIndex + 2]
  );
}
