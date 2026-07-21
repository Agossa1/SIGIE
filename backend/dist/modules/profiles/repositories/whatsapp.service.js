"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class WhatsAppService {
    constructor(logger) {
        this.logger = logger;
        if (!process.env.META_WHATSAPP_ACCESS_TOKEN || !process.env.META_WHATSAPP_PHONE_NUMBER_ID) {
            this.logger.warn('META_WHATSAPP_ACCESS_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID not set. WhatsApp messaging will be disabled.');
            this.accessToken = '';
            this.phoneNumberId = '';
            this.apiUrl = '';
            return;
        }
        this.accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
        this.phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
        this.apiUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
    }
    async sendOTP(to, otpCode) {
        if (!this.accessToken || !this.phoneNumberId) {
            this.logger.warn(`WhatsApp messaging is disabled. OTP ${otpCode} not sent to ${to}.`);
            return;
        }
        try {
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'template',
                    template: { name: 'hello_world', language: { code: 'en_US' } } // Remplacez par votre template OTP
                })
            });
            this.logger.info(`WhatsApp OTP sent to ${to}`);
        }
        catch (error) {
            this.logger.error(`Failed to send WhatsApp OTP to ${to}: ${error.message}`, error.response?.data);
            throw new appErrors_1.AppError('Failed to send WhatsApp OTP', 500);
        }
    }
}
exports.WhatsAppService = WhatsAppService;
//# sourceMappingURL=whatsapp.service.js.map