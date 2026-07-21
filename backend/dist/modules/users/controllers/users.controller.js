"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
        this.getAllUsers = async (req, res) => {
            try {
                const users = await this.usersService.getAllUsers();
                res.status(200).json({ success: true, data: users });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs' });
            }
        };
        this.getMe = async (req, res) => {
            try {
                const user = req.user;
                if (!user || !user.id) {
                    res.status(401).json({ success: false, message: 'Non authentifié' });
                    return;
                }
                const profile = await this.usersService.getUserById(user.id);
                if (!profile) {
                    res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
                    return;
                }
                res.status(200).json({ success: true, data: profile });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Erreur lors de la récupération du profil' });
            }
        };
        this.updateMe = async (req, res) => {
            try {
                const user = req.user;
                if (!user || !user.id) {
                    res.status(401).json({ success: false, message: 'Non authentifié' });
                    return;
                }
                const { firstName, lastName, phone } = req.body;
                const updatedProfile = await this.usersService.updateProfile(user.id, {
                    firstName,
                    lastName,
                    phone
                });
                res.status(200).json({ success: true, data: updatedProfile });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
            }
        };
        this.assignRole = async (req, res) => {
            try {
                const userId = req.params.id;
                const { role } = req.body;
                if (!role) {
                    res.status(400).json({ success: false, message: 'Le champ "role" est requis' });
                    return;
                }
                const updatedUser = await this.usersService.assignRole(userId, role);
                res.status(200).json({ success: true, data: updatedUser });
            }
            catch (error) {
                res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message || 'Erreur lors de l\'attribution du rôle'
                });
            }
        };
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map