import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';

export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.usersService.getAllUsers();
            res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs' });
        }
    };

    getMe = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
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
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Erreur lors de la récupération du profil' });
        }
    };

    updateMe = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
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
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil' });
        }
    };

    assignRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id as string;
            const { role } = req.body;

            if (!role) {
                res.status(400).json({ success: false, message: 'Le champ "role" est requis' });
                return;
            }

            const updatedUser = await this.usersService.assignRole(userId, role);
            res.status(200).json({ success: true, data: updatedUser });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'attribution du rôle'
            });
        }
    };
}
