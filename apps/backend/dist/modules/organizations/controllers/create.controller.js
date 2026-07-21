"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationController = void 0;
const organizations_validations_1 = require("../validations/organizations.validations");
class CreateOrganizationController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const data = organizations_validations_1.createOrganizationSchema.parse(req.body);
                const org = await this.service.execute(data);
                res.status(201).json({ success: true, data: org });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateOrganizationController = CreateOrganizationController;
//# sourceMappingURL=create.controller.js.map