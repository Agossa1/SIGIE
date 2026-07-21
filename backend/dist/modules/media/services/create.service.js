"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMediaService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = require("crypto");
const cloudinary_1 = require("cloudinary");
const appErrors_1 = require("../../../shared/errors/appErrors");
// Configuration Cloudinary
// Assurez-vous d'avoir CLOUDINARY_URL="cloudinary://my_key:my_secret@my_cloud_name" dans le .env
cloudinary_1.v2.config({
    secure: true,
});
class CreateMediaService {
    constructor() { }
    async processAndSaveImage(file, userId) {
        try {
            // Transformation de l'image (Sharp)
            // L'optimisation pour les réseaux lents se fait en amont de l'upload Cloudinary 
            // pour réduire le temps de traitement et d'upload
            const optimizedBuffer = await (0, sharp_1.default)(file.buffer)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 60 })
                .toBuffer();
            // Utilisation d'upload_stream car on passe un Buffer directement (depuis la mémoire multer)
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: `envdev/reports/users/${userId}`,
                    public_id: (0, crypto_1.randomUUID)(),
                    resource_type: 'image',
                    format: 'webp',
                }, (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(new appErrors_1.AppError('Echec de l\'upload vers Cloudinary', 500));
                    }
                    if (result) {
                        resolve({
                            url: result.secure_url,
                            size: result.bytes
                        });
                    }
                    else {
                        reject(new appErrors_1.AppError('No result from Cloudinary', 500));
                    }
                });
                uploadStream.end(optimizedBuffer);
            });
        }
        catch (error) {
            console.error('Error processing image:', error);
            throw new appErrors_1.AppError('Erreur lors du traitement de l\'image', 500);
        }
    }
}
exports.CreateMediaService = CreateMediaService;
//# sourceMappingURL=create.service.js.map