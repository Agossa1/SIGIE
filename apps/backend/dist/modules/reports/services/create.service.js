"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
const create_service_1 = require("../../media/services/create.service");
class CreateReportService {
    constructor(repository) {
        this.repository = repository;
        this.mediaService = new create_service_1.CreateMediaService();
    }
    async execute(dto) {
        // 1. Logique métier & Validation
        if (!dto.title || !dto.issueCategory || !dto.createdBy) {
            throw new appErrors_1.BadRequestError('Données incomplètes pour la création du rapport.');
        }
        if (dto.customNeighborhoodName && !dto.neighborhoodId) {
            dto.description = `[Quartier (Manuel) : ${dto.customNeighborhoodName}] \n${dto.description || ''}`;
        }
        // --- Cloudinary Integration ---
        // Si le technicien envois une image encodée en base64 (depuis le cache offline) 
        // On la convertit et l'upload vers Cloudinary !
        let mediaUploadResult;
        if (dto.photoBase64 && dto.photoBase64.startsWith('data:image')) {
            try {
                // Remove data url prefix
                const base64Data = dto.photoBase64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                // Mocker un objet file multer
                const fileMock = {
                    buffer,
                    fieldname: 'file',
                    originalname: 'offline-upload.jpg',
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: buffer.length,
                    destination: '',
                    filename: '',
                    path: '',
                    stream: null
                };
                const result = await this.mediaService.processAndSaveImage(fileMock, dto.createdBy);
                mediaUploadResult = result;
                // On remplace le base64 ultra-lourd par la super URL compressée Cloudinary WebP
                dto.photoBase64 = result.url;
            }
            catch (err) {
                console.error("Cloudinary upload failed during sync, keeping base64 fallback:", err);
            }
        }
        // 2. Opération en Base de Données
        const reportId = await this.repository.createReport(dto, mediaUploadResult);
        // 3. Invalidation du cache Redis
        await redis_service_1.redisService.del('reports:all');
        return { id: reportId };
    }
}
exports.CreateReportService = CreateReportService;
//# sourceMappingURL=create.service.js.map