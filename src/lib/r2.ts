import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 client configured for R2
function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 configuration. Check environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'dtf-files';
const UPLOAD_EXPIRES_IN = 60 * 10; // 10 minutes
const DOWNLOAD_EXPIRES_IN = 60 * 60; // 1 hour

/**
 * Generate a presigned URL for uploading a file to R2
 */
export async function generateUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: UPLOAD_EXPIRES_IN });
}

/**
 * Generate a presigned URL for downloading a file from R2
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const client = getR2Client();
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_EXPIRES_IN });
}

/**
 * Get public URL for a file (requires R2 bucket to have public access enabled)
 * Set R2_PUBLIC_URL in env to your bucket's public URL
 */
export function getPublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  
  if (!publicUrl) {
    // Fallback: return empty, caller should handle
    return '';
  }
  
  // Remove trailing slash if present
  const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
  return `${baseUrl}/${key}`;
}

/**
 * Generate a unique file key for storage
 */
export function generateFileKey(originalName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'bin';
  return `orders/${timestamp}-${randomSuffix}.${extension}`;
}
