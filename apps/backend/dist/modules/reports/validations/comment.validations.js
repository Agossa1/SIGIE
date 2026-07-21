"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.string().min(1, 'Le commentaire ne peut pas être vide').max(2000),
    isInternal: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=comment.validations.js.map