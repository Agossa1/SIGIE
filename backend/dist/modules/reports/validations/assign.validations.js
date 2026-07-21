"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssignmentSchema = zod_1.z.object({
    assignedTeamId: zod_1.z.string().uuid().optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
    assignmentNotes: zod_1.z.string().max(1000).optional(),
}).refine(data => data.assignedTeamId || data.assignedTo, {
    message: 'Vous devez spécifier une équipe ou un utilisateur à assigner',
});
//# sourceMappingURL=assign.validations.js.map