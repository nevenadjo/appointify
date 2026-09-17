import { randomBytes } from "crypto";

const alphabet =
  "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateBusinessPublicId(length = 8) {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => {
    return alphabet[byte % alphabet.length];
  }).join("");
}