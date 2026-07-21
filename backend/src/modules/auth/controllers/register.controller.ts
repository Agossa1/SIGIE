import { Request, Response, NextFunction } from "express";
import { RegisterService } from "../services/register";
import { registerSchema } from "../validations/register.validations";
import crypto from 'crypto';
import { AccountType, UserStatus } from "../types/auth.types";

export class RegisterController {
    constructor(private readonly registerService: RegisterService) { }

    /**
     * Gère l'inscription d'un nouvel utilisateur.
     */
    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Validation des données d'entrée
            const validatedData = registerSchema.parse(req.body);

            // 2. Génération des IDs et préparation des objets
            const userId = crypto.randomUUID();

            const userDto: any = {
                id: userId,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                phone: validatedData.phone,
                type: validatedData.type || AccountType.USER,
                status: UserStatus.PENDING,
                organizationId: validatedData.organizationId,
                municipalityId: validatedData.municipalityId,
                regionId: validatedData.regionId,
                districtId: validatedData.districtId,
                neighborhoodId: validatedData.neighborhoodId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const isPasswordCreationFlow = !validatedData.password;
            const passwordToHash = validatedData.password || crypto.randomBytes(32).toString('hex');

            const credentials = {
                id: crypto.randomUUID(),
                userId: userId,
                passwordHash: passwordToHash,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // 3. Appel du service métier
            // Note: Le rôle est extrait des données validées
            const newUser = await this.registerService.registerUser(userDto, credentials,isPasswordCreationFlow, validatedData.role);

            // 4. Réponse au client
            return res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé.',
                data: {
                    user: {
                        id: newUser.id,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        email: newUser.email,
                        phone: newUser.phone,
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}