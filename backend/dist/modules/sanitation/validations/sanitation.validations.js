"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollectionSchema = exports.createWastePointSchema = void 0;
const zod_1 = require("zod");
exports.createWastePointSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    municipalityId: zod_1.z.string().uuid().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    wasteType: zod_1.z.string().optional(),
});
exports.createCollectionSchema = zod_1.z.object({
    municipalityId: zod_1.z.string().uuid().optional(),
    collectionDate: zod_1.z.string(),
    volumeCollected: zod_1.z.number().optional(),
    teamId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=sanitation.validations.js.map