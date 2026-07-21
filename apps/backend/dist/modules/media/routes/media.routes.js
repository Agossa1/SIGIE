"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRouter = void 0;
const express_1 = require("express");
const upload_middleware_1 = require("../../../shared/middlewares/upload.middleware");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const media_controller_1 = require("../controllers/media.controller");
const media_service_1 = require("../services/media.service");
const create_service_1 = require("../services/create.service");
const media_repositories_1 = require("../repositories/media.repositories");
const logger_1 = require("../../../shared/loggers/logger");
const mediaRouter = (db) => {
    const router = (0, express_1.Router)();
    const repository = new media_repositories_1.MediaRepository(db, logger_1.logger);
    const createMediaService = new create_service_1.CreateMediaService();
    const service = new media_service_1.MediaService(repository, createMediaService);
    const controller = new media_controller_1.MediaController(service);
    router.post('/upload', auth_middleware_1.authMiddleware, upload_middleware_1.uploadMiddleware.single('image'), controller.uploadImage);
    return router;
};
exports.mediaRouter = mediaRouter;
//# sourceMappingURL=media.routes.js.map