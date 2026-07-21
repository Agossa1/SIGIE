"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const register_validations_1 = require("../validations/register.validations");
const crypto_1 = __importDefault(require("crypto"));
const auth_types_1 = require("../types/auth.types");
class RegisterController {
    constructor(registerService) {
        this.registerService = registerService;
        /**
         * Gère l'inscription d'un nouvel utilisateur.
         */
        this.register = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée
                const validatedData = register_validations_1.registerSchema.parse(req.body);
                // 2. Génération des IDs et préparation des objets
                const userId = crypto_1.default.randomUUID();
                const userDto = {
                    id: userId,
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                    email: validatedData.email,
                    phone: validatedData.phone,
                    type: validatedData.type || auth_types_1.AccountType.USER,
                    status: auth_types_1.UserStatus.PENDING,
                    organizationId: validatedData.organizationId,
                    municipalityId: validatedData.municipalityId,
                    regionId: validatedData.regionId,
                    districtId: validatedData.districtId,
                    neighborhoodId: validatedData.neighborhoodId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const isPasswordCreationFlow = !validatedData.password;
                const passwordToHash = validatedData.password || crypto_1.default.randomBytes(32).toString('hex');
                const credentials = {
                    id: crypto_1.default.randomUUID(),
                    userId: userId,
                    passwordHash: passwordToHash,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                // 3. Appel du service métier
                // Note: Le rôle est extrait des données validées
                const newUser = await this.registerService.registerUser(userDto, credentials, isPasswordCreationFlow, validatedData.role);
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
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.RegisterController = RegisterController;
//# sourceMappingURL=register.controller.js.map