export async function sendVerificationCode(phone: string, code: string, purpose: string) {
  const provider = process.env.SMS_PROVIDER ?? (process.env.NODE_ENV === "development" ? "console" : "");

  if (provider === "console" && process.env.NODE_ENV === "development") {
    console.info("Development %s verification code: %s", purpose, code);
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (provider !== "twilio" || !accountSid || !authToken || !fromNumber) {
    throw new Error("SMS is not configured. Set SMS_PROVIDER=twilio and the Twilio credentials.");
  }

  const body = new URLSearchParams({
    To: phone,
    From: fromNumber,
    Body: `Your Mota Yako ${purpose} code is ${code}. It expires in 10 minutes.`,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    console.error("Twilio rejected seller verification SMS", { status: response.status });
    throw new Error("We could not send a verification code. Check the SMS provider configuration.");
  }
}
