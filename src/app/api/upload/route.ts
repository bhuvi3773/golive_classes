import { NextResponse } from 'next/server';
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

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, file.name, folderType);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        url: result.url // Returns the Cloudinary CDN URL
      });
    } else {
      console.error('Cloudinary Upload Failed:', result.error);
      return NextResponse.json({ success: false, error: result.error || 'Failed to upload to Cloudinary' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 });
  }
}
