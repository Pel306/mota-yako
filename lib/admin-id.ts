import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getEncryptionKey() {
  const configured = process.env.ADMIN_ID_ENCRYPTION_KEY ?? "";
  if (!/^[\da-f]{64}$/i.test(configured)) {
    throw new Error("ADMIN_ID_ENCRYPTION_KEY must be a 32-byte hexadecimal key.");
  }
  return Buffer.from(configured, "hex");
}

export function encryptAdminIdNumber(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function getAdminIdLastFour(value: string | null) {
  if (!value) return null;
  const [version, iv, tag, encrypted] = value.split(":");
  if (version !== "v1" || !iv || !tag || !encrypted) {
    throw new Error("Stored admin ID number has an unsupported encrypted format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  return decrypted.slice(-4);
}
