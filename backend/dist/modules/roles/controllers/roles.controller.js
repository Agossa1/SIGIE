"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesController = void 0;
class RolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
        this.getAllRoles = async (req, res) => {
            try {
                const roles = await this.rolesService.getAllRoles();
                res.status(200).json({ success: true, data: roles });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Erreur lors de la récupération des rôles' });
            }
        };
        this.updateRole = async (req, res) => {
            try {
                const id = req.params.id;
                const data = req.body;
                const updatedRole = await this.rolesService.updateRole(id, data);
                if (!updatedRole) {
                    res.status(404).json({ success: false, message: 'Rôle non trouvé ou aucune modification apportée' });
                    return;
                }
                res.status(200).json({ success: true, data: updatedRole });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du rôle' });
            }
        };
    }
}
exports.RolesController = RolesController;
//# sourceMappingURL=roles.controller.js.map