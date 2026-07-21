"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferMemberController = void 0;
const zod_1 = require("zod");
const transferSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    old_team_id: zod_1.z.string().uuid(),
    new_team_id: zod_1.z.string().uuid(),
    reason: zod_1.z.string().optional()
});
class TransferMemberController {
    constructor(transferService) {
        this.transferService = transferService;
        this.handle = async (req, res, next) => {
            try {
                const validatedData = transferSchema.parse(req.body);
                const adminId = req.user?.id;
                await this.transferService.execute({
                    ...validatedData,
                    transferred_by: adminId,
                    created_at: new Date(),
                    id: '' // Généré par le repository
                });
                return res.json({
                    success: true,
                    message: 'Agent transféré avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TransferMemberController = TransferMemberController;
//# sourceMappingURL=transfer-member.controller.js.map