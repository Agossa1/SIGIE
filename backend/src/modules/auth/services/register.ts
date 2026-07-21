import { AuthRepository } from "../repositories/auth.repositories";
import { AuthUser, Credentials, User, Role } from "../types/auth.types";
import type { Logger } from 'winston';
import { AuthMailer } from '../../../utils/mailer/authMailer';
import { ConflictError, AppError } from "../../../shared/errors/appErrors";
import { PasswordService } from "../../../config/passwords/passwordServices";
import { WhatsAppService } from '../../profiles/services/whatsapp.service';
import crypto from 'crypto'; // Importé pour générer un token sécurisé pour le lien

export class RegisterService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly logger: Logger,
        private readonly authMailer: AuthMailer,
        private readonly hash: PasswordService,
        private readonly whatsappService: WhatsAppService
    ) { }

    /**
     * Enregistre un nouvel utilisateur dans le système.
     * Gère l'activation classique par code OTP OU le flux de création de mot de passe par lien + code.
     */
    public async registerUser(dto: User, credentials: Credentials, isPasswordCreateRole: boolean, role: Role): Promise<AuthUser> {
        try {
            // 0. Normalisation des données
            const normalizedEmail = dto.email.toLowerCase().trim();
            const normalizedPhone = dto.phone?.replace(/\s+/g, '').trim();

            // 1. Vérification de l'unicité
            const existingEmail = await this.authRepository.getUserByEmail(normalizedEmail);
            if (existingEmail) throw new ConflictError('Email already in use');

            if (normalizedPhone) {
                const existingPhone = await this.authRepository.getUserWithCredentialsByIdentifier(normalizedPhone);
                if (existingPhone) throw new ConflictError('Phone number already in use');
            }

            // 2. Hachage du mot de passe (seulement si un mot de passe est fourni, sinon chaîne vide)
            const passwordToHash = credentials.passwordHash || '';
            const hashedPassword = passwordToHash ? await this.hash.hashPassword(passwordToHash) : '';

            // 3. Préparation des objets avec données normalisées
            const finalDto = {
                ...dto,
                email: normalizedEmail,
                phone: normalizedPhone
            };

            const linkedCredentials = {
                ...credentials,
                userId: dto.id,
                passwordHash: hashedPassword
            };

            // 4. Création en base de données
            const newUser = await this.authRepository.createUser(finalDto, linkedCredentials, role);

            // 5. Génération des codes et gestion des flux d'envoi
            try {
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

                const frontendUrl = process.env.FRONTEND_URL;
                if (!frontendUrl) {
                    throw new Error("FRONTEND_URL is not defined in environment variables");
                }
                const setupToken = crypto.randomBytes(32).toString('hex');
                const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

                // Construction du lien
                const setupLink = `${frontendUrl}/auth/setup-password?token=${setupToken}&email=${normalizedEmail}`;

                // Sécurité prénom
                const nameToUse = newUser.firstName || dto.firstName || 'Collaborateur';

                // TOUJOURS envoyer le code + le lien de vérification et configuration MDP
                await this.authRepository.saveOtpCode(newUser.id, otpCode, 'account_setup_otp', expiresAt);
                await this.authRepository.saveOtpCode(newUser.id, setupToken, 'password_setup_token', tokenExpiresAt);

                // On garde le bel email du template (otpTemplate gère le setupLink)
                await this.authMailer.sendVerificationCode(newUser.email, nameToUse, otpCode, setupLink);

                // Envoi via WhatsApp/SMS si le téléphone est renseigné (Prêt pour l'intégration Meta)
                if (newUser.phone) {
                    await this.whatsappService.sendOTP(newUser.phone, otpCode);
                }
            } catch (mailError) {
                this.logger.error(`Failed to handle verification/setup communication for ${newUser.email}:`, mailError);
            }

            return newUser;

        } catch (error) {
            if (error instanceof AppError) throw error;
            this.logger.error('Unexpected error during user registration:', error);
            throw new AppError('An unexpected error occurred during registration', 500);
        }
    }
}
