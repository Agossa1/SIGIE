"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaUploadController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class MediaUploadController {
    constructor(createMediaService) {
        this.createMediaService = createMediaService;
    }
    async handle(req, res) {
        try {
            if (!req.file) {
                throw new appErrors_1.BadRequestError('No file provided');
            }
            const userId = req.user?.id;
            if (!userId) {
                throw new appErrors_1.BadRequestError('User not authenticated');
            }
            const result = await this.createMediaService.processAndSaveImage(req.file, userId);
            res.status(201).json({
                success: true,
                message: 'Image uploaded and optimized successfully',
                data: result
            });
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
}
exports.MediaUploadController = MediaUploadController;
//# sourceMappingURL=create.controller.js.map