import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const saltLength = 16;
const keyLength = 64;

export function hashAdminPassword(password: string) {
  const salt = randomBytes(saltLength);
  const derivedKey = scryptSync(password, salt, keyLength);
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, saltHex, keyHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !saltHex || !keyHex || !/^[\da-f]+$/i.test(saltHex) || !/^[\da-f]+$/i.test(keyHex)) {
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  if (salt.length !== saltLength || expected.length !== keyLength) return false;
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
