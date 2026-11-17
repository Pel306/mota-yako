import { createHmac } from "node:crypto";

export function hashVerificationCode(phone: string, code: string) {
  const secret = process.env.AUTH_CODE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_CODE_SECRET must contain at least 32 characters.");
  }
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}
