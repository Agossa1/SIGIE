"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryController = void 0;
class TerritoryController {
    constructor(territoryService, updateTerritoryService, deleteTerritoryService) {
        this.territoryService = territoryService;
        this.updateTerritoryService = updateTerritoryService;
        this.deleteTerritoryService = deleteTerritoryService;
        this.getRegions = async (req, res, next) => {
            try {
                const regions = await this.territoryService.getRegions();
                res.status(200).json(regions);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateMunicipality = async (req, res, next) => {
            try {
                const { id } = req.params;
                const dto = req.body; // Validation Zod à ajouter ici
                await this.updateTerritoryService.updateMunicipality(id, dto);
                res.status(200).json({ message: 'Municipalité mise à jour avec succès.' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteMunicipality = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.deleteTerritoryService.execute(id);
                res.status(204).send(); // No Content
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TerritoryController = TerritoryController;
//# sourceMappingURL=territory.controller.js.map