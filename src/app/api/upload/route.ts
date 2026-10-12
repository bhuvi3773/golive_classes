import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getUserFromCookie } from '@/lib/auth';
import { uploadToS3, getPresignedUploadUrl, validateFileType, MAX_FILE_SIZES } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Access restricted to authorized administrators.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Mode 1: Presigned Direct Upload URL Request (JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { fileName, fileType, folderType = 'video' } = body;

      if (!fileName || !fileType) {
        return NextResponse.json({ success: false, error: 'fileName and fileType are required.' }, { status: 400 });
      }

      if (!validateFileType(fileType, folderType)) {
        return NextResponse.json({ 
          success: false, 
          error: `Invalid file type '${fileType}' for asset category '${folderType}'.` 
        }, { status: 400 });
      }

      const presigned = await getPresignedUploadUrl(fileName, fileType, folderType);
      return NextResponse.json(presigned, { status: 200 });
    }

    // Mode 2: Multipart Form Data Buffer Upload
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const folderType = (data.get('folderType') as string) || 'video';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Server-side Size Validation
    const maxSize = (MAX_FILE_SIZES as Record<string, number>)[folderType] || MAX_FILE_SIZES.general;
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({ success: false, error: `File size exceeds the allowable limit of ${maxMB}MB.` }, { status: 400 });
    }

    // Server-side MIME Validation
    if (!validateFileType(file.type, folderType)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid file type '${file.type}' for category '${folderType}'.` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result: { success: boolean; url?: string; key?: string; error?: string };

    try {
      // Primary: AWS S3 storage
      result = await uploadToS3(buffer, file.name, file.type, folderType);
    } catch (s3Err: any) {
      // Fallback: If S3 fails on thumbnail and Cloudinary is configured
      if (folderType === 'thumbnail' || folderType === 'user') {
        try {
          const { uploadToCloudinary } = await import('@/lib/cloudinary');
          result = await uploadToCloudinary(buffer, file.name, folderType);
        } catch {
          result = { success: false, error: s3Err.message || 'S3 upload failed' };
        }
      } else {
        result = { success: false, error: s3Err.message || 'S3 upload failed' };
      }
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        url: result.url,
        key: result.key
      });
    } else {
      console.error('Upload Failed:', result.error);
      return NextResponse.json({ success: false, error: result.error || 'Failed to complete upload.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error handling upload request:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error processing upload.' }, { status: 500 });
  }
}
