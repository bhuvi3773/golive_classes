import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToS3(buffer: Buffer, fileName: string, contentType: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `course-media/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    success: true,
    url: `s3://${key}`
  };
}

export async function getSignedS3Url(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || "",
    Key: key,
  });
  
  // URL expires in 12 hours (43200 seconds)
  return getSignedUrl(s3Client, command, { expiresIn: 43200 });
}
