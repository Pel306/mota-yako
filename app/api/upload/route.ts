import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSellerSession } from "@/lib/auth";
import { s3Client } from "@/lib/storage";

const maxImageBytes = 10 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": { extension: "jpg", signature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", signature: (bytes: Uint8Array) => bytes.subarray(0, 8).join(",") === "137,80,78,71,13,10,26,10" },
  "image/webp": { extension: "webp", signature: (bytes: Uint8Array) => String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP" },
} as const;

export async function POST(request: Request) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Sign in before uploading vehicle photos." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload must use multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1 || file.size > maxImageBytes) {
    return NextResponse.json({ error: "Choose an image file no larger than 10 MB." }, { status: 400 });
  }
  const type = imageTypes[file.type as keyof typeof imageTypes];
  if (!type) {
    return NextResponse.json({ error: "Only JPG, PNG and WebP images are supported." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.signature(bytes)) {
    return NextResponse.json({ error: "The selected file does not match its image format." }, { status: 415 });
  }

  const bucket = process.env.STORAGE_BUCKET_NAME;
  const publicUrl = process.env.STORAGE_PUBLIC_URL?.replace(/\/$/, "");
  if (!bucket || !publicUrl) {
    return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  }

  const key = `vehicles/${seller.id}/${randomUUID()}.${type.extension}`;
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentLength: bytes.byteLength,
      ContentType: file.type,
    }));
    return NextResponse.json({ publicUrl: `${publicUrl}/${key}` });
  } catch (error) {
    console.error("Could not store vehicle photo", error);
    return NextResponse.json({ error: "Image storage is unavailable. Check the MinIO/S3 service and settings." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Sign in before managing vehicle photos." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("urls" in payload) ||
    !Array.isArray(payload.urls) ||
    payload.urls.length > 8 ||
    payload.urls.some((url) => typeof url !== "string")
  ) {
    return NextResponse.json({ error: "Provide up to eight image URLs to remove." }, { status: 400 });
  }

  const bucket = process.env.STORAGE_BUCKET_NAME;
  const publicUrl = process.env.STORAGE_PUBLIC_URL?.replace(/\/$/, "");
  if (!bucket || !publicUrl) return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });

  const keys: string[] = [];
  for (const url of payload.urls) {
    try {
      const base = new URL(publicUrl);
      const image = new URL(url);
      const basePath = base.pathname.replace(/\/$/, "");
      if (image.origin !== base.origin || !image.pathname.startsWith(`${basePath}/vehicles/${seller.id}/`)) {
        return NextResponse.json({ error: "You can only remove photos from your own account." }, { status: 403 });
      }
      keys.push(decodeURIComponent(image.pathname.slice(basePath.length + 1)));
    } catch {
      return NextResponse.json({ error: "One or more image URLs are invalid." }, { status: 400 });
    }
  }

  try {
    await Promise.all(keys.map((Key) => s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key }))));
    return NextResponse.json({ removed: keys.length });
  } catch (error) {
    console.error("Could not remove unsubmitted vehicle photos", error);
    return NextResponse.json({ error: "Could not remove unsubmitted photos from storage." }, { status: 503 });
  }
}
