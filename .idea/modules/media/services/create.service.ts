import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../../../../apps/backend/src/shared/errors/appErrors';
import fs from 'fs';
import path from 'path';

// Configuration AWS S3
const isAwsConfigured = !!(process.env.AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID);

let s3Client: S3Client | null = null;
if (isAwsConfigured) {
    s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });
}

export class CreateMediaService {
    private readonly uploadDir = 'uploads';

    constructor() {
        if (!isAwsConfigured && !fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async processAndSaveImage(file: Express.Multer.File, userId: string): Promise<{ url: string; size: number }> {
        try {
            // Transformation de l'image (Sharp)
            const optimizedBuffer = await sharp(file.buffer)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 60 })
                .toBuffer();

            if (isAwsConfigured && s3Client) {
                const fileName = `${randomUUID()}.webp`;
                const s3Key = `envdev/reports/users/${userId}/${fileName}`;

                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: s3Key,
                    Body: optimizedBuffer,
                    ContentType: 'image/webp',
                });

                await s3Client.send(command);

                // Construction de l'URL publique
                const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

                return {
                    url: publicUrl,
                    size: optimizedBuffer.length
                };
            } else {
                // Fallback Stockage Local (Dev)
                const fileName = `${randomUUID()}.webp`;
                const userDir = path.join(this.uploadDir, 'reports', 'users', userId);
                
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true });
                }

                const filePath = path.join(userDir, fileName);
                await fs.promises.writeFile(filePath, optimizedBuffer);

                // URL relative pour le client (servie par express.static dans server.ts)
                const relativeUrl = `/${filePath.replace(/\\/g, '/')}`;
                
                return {
                    url: relativeUrl,
                    size: optimizedBuffer.length
                };
            }
        } catch (error) {
            console.error('Error processing image:', error);
            throw new AppError('Erreur lors du traitement de l\'image', 500);
        }
    }
}
