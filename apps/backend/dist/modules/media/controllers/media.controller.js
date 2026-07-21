"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
        this.uploadImage = async (req, res, next) => {
            try {
                if (!req.file) {
                    throw new appErrors_1.BadRequestError('Aucun fichier téléchargé');
                }
                const { relatedId, relatedType } = req.body;
                if (!relatedId || !relatedType) {
                    throw new appErrors_1.BadRequestError('relatedId et relatedType sont requis');
                }
                const uploaderId = req.user.id;
                const result = await this.mediaService.processUpload(req.file, relatedId, relatedType, uploaderId);
                res.status(201).json({ id: result.id, message: 'Image téléchargée avec succès', url: result.url });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MediaController = MediaController;
//# sourceMappingURL=media.controller.js.map