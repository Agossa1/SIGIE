import type { Logger } from 'winston';

/**
 * Stub du service WhatsApp — Prêt pour l'intégration Meta WhatsApp Business API.
 * 
 * En production, ce service enverra de vrais messages WhatsApp via l'API Meta.
 * Pour le développement, il log uniquement le message.
 */
export class WhatsAppService {
    constructor(private readonly logger: Logger) {}

    /**
     * Envoie un code OTP via WhatsApp.
     * @param phone Numéro de téléphone au format international (+229...)
     * @param code Code OTP à 6 chiffres
     */
    async sendOTP(phone: string, code: string): Promise<boolean> {
        try {
            this.logger.info(`[WhatsApp] OTP ${code} envoyé à ${phone} (simulation)`);
            return true;
        } catch (error) {
            this.logger.error(`[WhatsApp] Échec d'envoi OTP à ${phone}:`, error);
            return false;
        }
    }

    /**
     * Envoie un message personnalisé via WhatsApp.
     */
    async sendMessage(phone: string, message: string): Promise<boolean> {
        try {
            this.logger.info(`[WhatsApp] Message envoyé à ${phone}: ${message.substring(0, 50)}...`);
            return true;
        } catch (error) {
            this.logger.error(`[WhatsApp] Échec d'envoi message à ${phone}:`, error);
            return false;
        }
    }
}