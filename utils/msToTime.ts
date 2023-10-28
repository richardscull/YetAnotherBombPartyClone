export default function millisecondsToString(ms: number): string {
  const date = new Date(ms);
  let hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  if (hours === "00") {
    hours = "";
  } else {
    hours += ":";
  }
  return `${hours}${minutes}:${seconds}`;
}
