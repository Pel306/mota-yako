import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  S3Client,
} from "@aws-sdk/client-s3";

config({ path: ".env.local" });

const required = [
  "STORAGE_ENDPOINT",
  "STORAGE_REGION",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_BUCKET_NAME",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing storage settings in .env.local: ${missing.join(", ")}`);
}

const compose = spawnSync(
  "docker",
  ["compose", "--env-file", ".env.local", "up", "-d", "minio"],
  { stdio: "inherit" },
);
if (compose.error) throw compose.error;
if (compose.status !== 0) {
  throw new Error(`Docker Compose exited with status ${compose.status ?? "unknown"}.`);
}

const client = new S3Client({
  region: process.env.STORAGE_REGION,
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});
const bucket = process.env.STORAGE_BUCKET_NAME;
let ready = false;

try {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      ready = true;
      break;
    } catch (error) {
      const code = error?.Code ?? error?.code;
      const status = error?.$metadata?.httpStatusCode;
      if (code === "NotFound" || code === "NoSuchBucket" || status === 404) {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        ready = true;
        break;
      }

      const transient =
        ["ECONNREFUSED", "ECONNRESET", "EPIPE", "TimeoutError"].includes(code) ||
        status === 503;
      if (!transient || attempt === 39) {
        throw new Error(`Could not access the MinIO bucket (${code ?? "unknown error"}).`, { cause: error });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (!ready) throw new Error("MinIO did not become ready in time.");

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };
  await client.send(new PutBucketPolicyCommand({
    Bucket: bucket,
    Policy: JSON.stringify(policy),
  }));
  console.log(`MinIO is ready; bucket "${bucket}" allows public image reads only.`);
} finally {
  client.destroy();
}
