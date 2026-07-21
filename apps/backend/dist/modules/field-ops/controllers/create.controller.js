"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportController = void 0;
const zod_1 = require("zod");
const create_validations_1 = require("../validations/create.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
const createReportController = (createService) => {
    return async (req, res, next) => {
        try {
            // 1. Validation Zod des données entrantes
            const validated = create_validations_1.createReportSchema.parse(req.body);
            // 2. L'ID de l'utilisateur provient du token JWT validé par authMiddleware
            const createdBy = req.user?.id;
            const dto = {
                ...validated,
                createdBy,
            };
            // 3. Appel au service métier
            const result = await createService.execute(dto);
            res.status(201).json({
                success: true,
                message: 'Rapport technique créé avec succès.',
                data: result,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Données de rapport invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.createReportController = createReportController;
//# sourceMappingURL=create.controller.js.map