import { MediaRepository, MediaDTO } from '../repositories/media.repositories';
import { CreateMediaService } from './create.service';

export class MediaService {
    constructor(
        private readonly mediaRepository: MediaRepository,
        private readonly createMediaService: CreateMediaService
    ) { }

    async processUpload(file: Express.Multer.File, relatedId: string, relatedType: string, uploaderId: string): Promise<{ id: string, url: string }> {
        // 1. Optimisation et Upload vers le Cloud (AWS S3)
        const uploadResult = await this.createMediaService.processAndSaveImage(file, uploaderId);

        // 2. Enregistrement des métadonnées en base de données
        const mediaDto: MediaDTO = {
            fileName: file.originalname,
            filePath: uploadResult.url, // URL AWS S3
            mimeType: 'image/webp',
            fileSize: uploadResult.size,
            type: 'image',
            relatedId,
            relatedType,
            uploaderId
        };

        const id = await this.mediaRepository.saveMedia(mediaDto);
        return { id, url: uploadResult.url };
    }
}