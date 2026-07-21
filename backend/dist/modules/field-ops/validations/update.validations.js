"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportStatusSchema = void 0;
const zod_1 = require("zod");
const field_ops_types_1 = require("../types/field-ops.types");
// ── Schéma de mise à jour du statut ──────────────────────────────────────────
exports.updateReportStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(field_ops_types_1.FieldReportStatus, {
        message: `Statut invalide. Valeurs acceptées : ${Object.values(field_ops_types_1.FieldReportStatus).join(', ')}`
    }),
});
//# sourceMappingURL=update.validations.js.map