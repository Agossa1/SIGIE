"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationController = void 0;
const organizations_validations_1 = require("../validations/organizations.validations");
class UpdateOrganizationController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const data = organizations_validations_1.updateOrganizationSchema.parse(req.body);
                const org = await this.service.execute(String(req.params.id), data);
                res.json({ success: true, data: org });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.UpdateOrganizationController = UpdateOrganizationController;
//# sourceMappingURL=update.controller.js.map