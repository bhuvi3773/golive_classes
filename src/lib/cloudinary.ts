import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string,
  folderType: string
) => {
  return new Promise<{ success: boolean; url?: string; error?: any }>((resolve, reject) => {
    // Determine the resource type based on the folderType or file extension
    const isVideo = folderType === 'video' || fileName.match(/\.(mp4|webm|mov|avi)$/i);
    
    // Set up the folder structure in Cloudinary
    let targetFolder = 'golive_platform/general';
    if (folderType === 'video') {
      targetFolder = 'golive_platform/videos';
    } else if (folderType === 'thumbnail') {
      targetFolder = 'golive_platform/thumbnails';
    } else if (folderType === 'user' || folderType === 'avatar') {
      targetFolder = 'golive_platform/users';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        resource_type: isVideo ? 'video' : 'auto',
        // Optional: you can add specific tags or formatting rules here
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          resolve({ success: false, error: error.message });
        } else if (result) {
          // Auto Compress System: Inject Cloudinary transformations for automatic quality optimization and format selection
          // This massively reduces file size without restricting visual quality
          let finalUrl = result.secure_url;
          if (finalUrl) {
            finalUrl = finalUrl.replace('/upload/', '/upload/q_auto,f_auto/');
          }
          resolve({ success: true, url: finalUrl });
        }
      }
    );

    // End the stream by passing the buffer
    uploadStream.end(fileBuffer);
  });
};
