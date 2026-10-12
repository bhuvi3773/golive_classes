import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ALLOWED_MIME_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
  thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf'],
};

export const MAX_FILE_SIZES = {
  video: 500 * 1024 * 1024,      // 500 MB
  thumbnail: 10 * 1024 * 1024,   // 10 MB
  document: 25 * 1024 * 1024,    // 25 MB
  general: 50 * 1024 * 1024,     // 50 MB
};

export function getS3Client(): S3Client {
  const region = process.env.AWS_REGION || "ap-south-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not configured in environment variables.");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function validateFileType(mimeType: string, folderType: string = 'general'): boolean {
  if (folderType === 'video') {
    return ALLOWED_MIME_TYPES.video.includes(mimeType);
  }
  if (folderType === 'thumbnail' || folderType === 'user' || folderType === 'avatar') {
    return ALLOWED_MIME_TYPES.thumbnail.includes(mimeType);
  }
  if (folderType === 'document' || folderType === 'attachment') {
    return ALLOWED_MIME_TYPES.document.includes(mimeType);
  }
  return (
    ALLOWED_MIME_TYPES.video.includes(mimeType) ||
    ALLOWED_MIME_TYPES.thumbnail.includes(mimeType) ||
    ALLOWED_MIME_TYPES.document.includes(mimeType)
  );
}

export function sanitizeFileName(fileName: string): string {
  const baseName = fileName.replace(/^.*[\\/]/, '');
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function generateS3Key(fileName: string, folderType: string = 'videos'): string {
  const safeName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const cleanFolder = folderType.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
  return `course-media/${cleanFolder}/${timestamp}-${randomSuffix}-${safeName}`;
}

export function isS3Url(urlOrKey: string): boolean {
  if (!urlOrKey || typeof urlOrKey !== 'string') return false;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
  if (urlOrKey.startsWith('course-media/') || urlOrKey.startsWith('courses/')) return true;
  if (bucketName && urlOrKey.includes(bucketName)) return true;
  if (urlOrKey.includes('.s3.') && urlOrKey.includes('.amazonaws.com/')) return true;
  if (urlOrKey.includes('s3.amazonaws.com/')) return true;
  return false;
}

export function extractS3Key(urlOrKey: string): string {
  if (!urlOrKey || typeof urlOrKey !== 'string') return '';
  if (urlOrKey.startsWith('course-media/') || urlOrKey.startsWith('courses/')) return urlOrKey;

  try {
    const parsedUrl = new URL(urlOrKey);
    let path = parsedUrl.pathname;
    if (path.startsWith('/')) path = path.slice(1);

    // If path-style URL (https://s3.<region>.amazonaws.com/<bucket>/<key>), strip bucket name prefix
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName && path.startsWith(`${bucketName}/`)) {
      path = path.slice(bucketName.length + 1);
    }

    return decodeURIComponent(path);
  } catch {
    const mediaIdx = urlOrKey.indexOf('course-media/');
    if (mediaIdx !== -1) return urlOrKey.substring(mediaIdx);
    const coursesIdx = urlOrKey.indexOf('courses/');
    if (coursesIdx !== -1) return urlOrKey.substring(coursesIdx);
    return urlOrKey;
  }
}

export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folderType: string = 'video'
) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  if (!validateFileType(contentType, folderType)) {
    throw new Error(`Invalid file type (${contentType}) for folder '${folderType}'.`);
  }

  const key = generateS3Key(fileName, folderType);
  const s3 = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3.send(command);

  return {
    success: true,
    key,
    url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
  };
}

export async function getPresignedDownloadUrl(
  keyOrUrl: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!keyOrUrl) return keyOrUrl;

  // External non-S3 URLs (YouTube, Vimeo, Cloudinary) should be passed through as-is
  if ((keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) && !isS3Url(keyOrUrl)) {
    return keyOrUrl;
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  const key = extractS3Key(keyOrUrl);
  if (!key) {
    return keyOrUrl;
  }

  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folderType: string = 'video',
  expiresInSeconds: number = 900 // 15 minutes
) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-south-1";

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in environment variables.");
  }

  if (!validateFileType(contentType, folderType)) {
    throw new Error(`Invalid file type (${contentType}) for folder '${folderType}'.`);
  }

  const key = generateS3Key(fileName, folderType);
  const s3 = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });

  return {
    success: true,
    uploadUrl,
    key,
    fileUrl: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
  };
}

export async function deleteFromS3(keyOrUrl: string) {
  if (!isS3Url(keyOrUrl)) return { success: false, error: 'Not an S3 URL' };

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME is not configured.");

  const key = extractS3Key(keyOrUrl);
  const s3 = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3.send(command);
  return { success: true };
}
