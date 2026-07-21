"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTerritoryController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteTerritoryController {
    constructor(service) {
        this.service = service;
    }
    async handle(req, res) {
        try {
            const { id } = req.params;
            const organizationId = req.user?.organizationId;
            if (!id) {
                res.status(400).json({ error: 'ID de la municipalité requis' });
                return;
            }
            if (!organizationId) {
                res.status(403).json({ error: 'Organisation non identifiée' });
                return;
            }
            await this.service.execute(id, organizationId);
            res.status(200).json({ message: 'Municipalité supprimée avec succès' });
        }
        catch (error) {
            if (error instanceof appErrors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error('Erreur DeleteTerritoryController:', error);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}
exports.DeleteTerritoryController = DeleteTerritoryController;
//# sourceMappingURL=delete.controller.js.map