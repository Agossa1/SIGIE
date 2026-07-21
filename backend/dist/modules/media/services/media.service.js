"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
class MediaService {
    constructor(mediaRepository, createMediaService) {
        this.mediaRepository = mediaRepository;
        this.createMediaService = createMediaService;
    }
    async processUpload(file, relatedId, relatedType, uploaderId) {
        // 1. Optimisation et Upload vers le Cloud (Cloudinary)
        const uploadResult = await this.createMediaService.processAndSaveImage(file, uploaderId);
        // 2. Enregistrement des métadonnées en base de données
        const mediaDto = {
            fileName: file.originalname,
            filePath: uploadResult.url, // URL Cloudinary
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
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map