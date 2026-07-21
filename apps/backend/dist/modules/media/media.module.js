"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMediaModule = void 0;
const express_1 = require("express");
const create_controller_1 = require("./controllers/create.controller");
const create_service_1 = require("./services/create.service");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const setupMediaModule = () => {
    const router = (0, express_1.Router)();
    // Multer configuration: Store in memory to process with Sharp before writing to disk
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit before compression
        }
    });
    const createMediaService = new create_service_1.CreateMediaService();
    const mediaUploadController = new create_controller_1.MediaUploadController(createMediaService);
    // Apply JWT auth
    router.use(auth_middleware_1.authMiddleware);
    // Upload an image, specifically targeted for field ops with high compression
    router.post('/upload', (0, auth_middleware_1.requireRole)(['technician', 'field_agent', 'super_admin', 'platform_admin']), upload.single('file'), // Expecting form-data with key 'file'
    (req, res) => mediaUploadController.handle(req, res));
    return router;
};
exports.setupMediaModule = setupMediaModule;
//# sourceMappingURL=media.module.js.map