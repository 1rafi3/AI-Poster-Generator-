import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export interface StorageUploadResult {
  url: string;
  publicId?: string;
  filename: string;
  storageType: 's3' | 'digitalocean' | 'cloudinary' | 'local';
}

class StorageService {
  private s3Client: S3Client | null = null;
  private s3Bucket = '';
  private s3Endpoint = '';
  private s3Region = 'us-east-1';
  private s3CdnUrl = '';
  private isDigitalOcean = false;
  private s3Enabled = false;

  private cloudinaryEnabled = false;

  constructor() {
    this.initS3();
    this.initCloudinary();
  }

  private initS3(): void {
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT; // e.g. https://sgp1.digitaloceanspaces.com or https://nyc3.digitaloceanspaces.com
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
    const cdnUrl = process.env.S3_CDN_URL;

    if (bucket && accessKeyId && secretAccessKey) {
      this.s3Bucket = bucket;
      this.s3Endpoint = endpoint || '';
      this.s3Region = region;
      this.s3CdnUrl = cdnUrl || '';
      this.isDigitalOcean = Boolean(endpoint && endpoint.includes('digitaloceanspaces.com'));

      this.s3Client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: false,
      });

      this.s3Enabled = true;
      if (this.isDigitalOcean) {
        console.log(`🌊 [Storage] DigitalOcean Spaces initialized: Bucket "${bucket}" at ${endpoint}`);
      } else {
        console.log(`☁️ [Storage] AWS S3 initialized: Bucket "${bucket}" in ${region}`);
      }
    }
  }

  private initCloudinary(): void {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
      cloudinary.config();
      this.cloudinaryEnabled = true;
      console.log('☁️ [Storage] Cloudinary initialized via CLOUDINARY_URL');
    } else if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.cloudinaryEnabled = true;
      console.log(`☁️ [Storage] Cloudinary initialized with cloud_name: "${cloudName}"`);
    } else if (!this.s3Enabled) {
      console.log('📁 [Storage] No cloud storage credentials detected. Operating with Local Disk Storage (/uploads).');
    }
  }

  public getStorageType(): 's3' | 'digitalocean' | 'cloudinary' | 'local' {
    if (this.s3Enabled) return this.isDigitalOcean ? 'digitalocean' : 's3';
    if (this.cloudinaryEnabled) return 'cloudinary';
    return 'local';
  }

  public async uploadPhoto(file: Express.Multer.File): Promise<StorageUploadResult> {
    const folder = process.env.UPLOAD_FOLDER || 'political-posters';

    // 1. Try S3 or DigitalOcean Spaces if configured
    if (this.s3Enabled && this.s3Client) {
      try {
        const fileContent = fs.readFileSync(file.path);
        const key = `${folder}/${file.filename}`;

        const uploadParams: any = {
          Bucket: this.s3Bucket,
          Key: key,
          Body: fileContent,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        await this.s3Client.send(new PutObjectCommand(uploadParams));

        // Generate public URL
        let publicUrl = '';
        if (this.s3CdnUrl) {
          publicUrl = `${this.s3CdnUrl.replace(/\/$/, '')}/${key}`;
        } else if (this.isDigitalOcean) {
          // e.g. https://bucket.sgp1.digitaloceanspaces.com/key
          const endpointHost = this.s3Endpoint.replace(/^https?:\/\//, '');
          publicUrl = `https://${this.s3Bucket}.${endpointHost}/${key}`;
        } else {
          // e.g. https://bucket.s3.region.amazonaws.com/key
          publicUrl = `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}`;
        }

        // Clean up local temp file
        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, () => {});
        }

        return {
          url: publicUrl,
          publicId: key,
          filename: file.filename,
          storageType: this.isDigitalOcean ? 'digitalocean' : 's3',
        };
      } catch (error: any) {
        console.error('❌ [Storage] S3/DigitalOcean upload failed:', error.message);
        // Fallback to local if error occurs
        return {
          url: `/uploads/${file.filename}`,
          filename: file.filename,
          storageType: 'local',
        };
      }
    }

    // 2. Try Cloudinary if configured
    if (this.cloudinaryEnabled) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        });

        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, () => {});
        }

        return {
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.filename,
          storageType: 'cloudinary',
        };
      } catch (error: any) {
        console.error('❌ [Storage] Cloudinary upload failed:', error.message);
        return {
          url: `/uploads/${file.filename}`,
          filename: file.filename,
          storageType: 'local',
        };
      }
    }

    // 3. Fallback to Local Disk Storage
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      storageType: 'local',
    };
  }

  public async deletePhoto(identifier: string, isPublicId = false): Promise<boolean> {
    // S3 delete
    if (this.s3Enabled && this.s3Client && (isPublicId || identifier.includes(this.s3Bucket) || identifier.startsWith('political-posters/'))) {
      try {
        const key = identifier.replace(/^https?:\/\/[^/]+\//, '');
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.s3Bucket,
            Key: key,
          })
        );
        return true;
      } catch (err: any) {
        console.warn('❌ [Storage] Failed to delete from S3/DigitalOcean:', err.message);
        return false;
      }
    }

    // Cloudinary delete
    if (this.cloudinaryEnabled && (isPublicId || identifier.startsWith('political-posters/'))) {
      try {
        const res = await cloudinary.uploader.destroy(identifier);
        return res.result === 'ok';
      } catch (err: any) {
        console.warn('❌ [Storage] Failed to delete from Cloudinary:', err.message);
        return false;
      }
    }

    // Local delete
    try {
      const filename = path.basename(identifier);
      const localPath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return true;
      }
    } catch (err: any) {
      console.warn('❌ [Storage] Failed to delete local file:', err.message);
    }
    return false;
  }
}

export const storageService = new StorageService();
