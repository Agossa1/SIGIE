"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfCheckInController = void 0;
const zod_1 = require("zod");
const checkInSchema = zod_1.z.object({
    teamId: zod_1.z.string().uuid(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number()
});
class SelfCheckInController {
    constructor(checkInService) {
        this.checkInService = checkInService;
        this.handle = async (req, res, next) => {
            try {
                const validatedData = checkInSchema.parse(req.body);
                const userId = req.user?.id;
                await this.checkInService.execute({
                    ...validatedData,
                    userId: userId
                });
                return res.json({
                    success: true,
                    message: 'Pointage GPS réussi'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.SelfCheckInController = SelfCheckInController;
//# sourceMappingURL=self-check-in.controller.js.map