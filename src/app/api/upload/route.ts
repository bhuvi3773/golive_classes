import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const folderType = data.get('folderType') as string || 'general'; // 'video', 'thumbnail', 'user'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validation
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File size exceeds limit of 500MB' }, { status: 400 });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only JPEG, PNG, WEBP, MP4, WEBM allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result: { success: boolean, url?: string, error?: string };

    if (folderType === 'video') {
      // Phase 8: AWS S3 Storage Setup for Videos (Large Files)
      const { uploadToS3 } = await import('@/lib/s3');
      try {
        result = await uploadToS3(buffer, file.name, file.type);
      } catch (err: any) {
        result = { success: false, error: err.message };
      }
    } else {
      // Fallback: Cloudinary for Thumbnails/Images
      result = await uploadToCloudinary(buffer, file.name, folderType);
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        url: result.url // Returns the S3 or Cloudinary CDN URL
      });
    } else {
      console.error('Upload Failed:', result.error);
      return NextResponse.json({ success: false, error: result.error || 'Failed to upload' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
