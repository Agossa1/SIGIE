"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryController = void 0;
const create_validations_1 = require("../validations/create.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateTerritoryController {
    constructor(service) {
        this.service = service;
    }
    async handle(req, res) {
        try {
            // Validation du payload
            const data = create_validations_1.createMunicipalitySchema.parse(req.body);
            // On s'assure que l'organizationId provient du token si possible, ou on l'exige dans le body
            const organizationId = req.user?.organizationId || data.organizationId;
            if (!organizationId) {
                res.status(403).json({ error: 'Organisation non identifiée' });
                return;
            }
            const dto = { ...data, organizationId };
            const result = await this.service.execute(dto);
            res.status(201).json({
                message: 'Hiérarchie territoriale créée avec succès',
                data: result
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                res.status(400).json({ error: 'Validation échouée', details: error.errors });
                return;
            }
            if (error instanceof appErrors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur CreateTerritoryController:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}
exports.CreateTerritoryController = CreateTerritoryController;
//# sourceMappingURL=create.controller.js.map