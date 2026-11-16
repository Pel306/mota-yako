import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.STORAGE_REGION!,
  endpoint: process.env.STORAGE_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for MinIO / custom S3 endpoints
});