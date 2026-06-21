import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(request: Request) {
  try {
    configureCloudinary();

    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Multipart logo file required." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Logo file missing." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed." }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Logo must be under 2 MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "mechanic/invoice-logos",
      resource_type: "image",
      overwrite: true,
    });

    return NextResponse.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch (error) {
    const details = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
    const message =
      (typeof details.message === "string" && details.message) ||
      (typeof details.error === "string" && details.error) ||
      String(error || "Logo upload failed.");
    const status = typeof details.http_code === "number" ? details.http_code : 500;
    return NextResponse.json(
      { error: message, code: details.http_code || details.name || null },
      { status: status >= 400 && status < 500 ? status : 500 },
    );
  }
}
