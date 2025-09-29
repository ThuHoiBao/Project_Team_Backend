// src/controller/uploadPictureController.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';

const keyFilePath = path.resolve('src/config/ggcloud.json');

const storage = new Storage({
  keyFilename: keyFilePath,
});

const bucket = storage.bucket('bucket_mobileapp');

export async function uploadImageToGCS(fileBuffer: Buffer, fileName: string) {
  if (!fileBuffer || !fileName) {
    throw new Error('fileBuffer và fileName phải hợp lệ');
  }

  const file = bucket.file(`shopHCMUTE/${fileName}`);
  
  try {
    await file.save(fileBuffer, {
      resumable: false,
      contentType: 'auto',
      public: true, // để link truy cập trực tiếp
    });

    console.log(`Upload thành công: shopHCMUTE/${fileName}`);
    return `https://storage.googleapis.com/${bucket.name}/shopHCMUTE/${fileName}`;
  } catch (error) {
    console.error('Lỗi upload GCS:', error);
    throw error;
  }
}
