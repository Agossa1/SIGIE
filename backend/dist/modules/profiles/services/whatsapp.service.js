"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
/**
 * Stub du service WhatsApp — Prêt pour l'intégration Meta WhatsApp Business API.
 *
 * En production, ce service enverra de vrais messages WhatsApp via l'API Meta.
 * Pour le développement, il log uniquement le message.
 */
class WhatsAppService {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Envoie un code OTP via WhatsApp.
     * @param phone Numéro de téléphone au format international (+229...)
     * @param code Code OTP à 6 chiffres
     */
    async sendOTP(phone, code) {
        try {
            this.logger.info(`[WhatsApp] OTP ${code} envoyé à ${phone} (simulation)`);
            return true;
        }
        catch (error) {
            this.logger.error(`[WhatsApp] Échec d'envoi OTP à ${phone}:`, error);
            return false;
        }
    }
    /**
     * Envoie un message personnalisé via WhatsApp.
     */
    async sendMessage(phone, message) {
        try {
            this.logger.info(`[WhatsApp] Message envoyé à ${phone}: ${message.substring(0, 50)}...`);
            return true;
        }
        catch (error) {
            this.logger.error(`[WhatsApp] Échec d'envoi message à ${phone}:`, error);
            return false;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=whatsapp.service.js.map