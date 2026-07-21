"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWastePointController = void 0;
const sanitation_validations_1 = require("../validations/sanitation.validations");
class CreateWastePointController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const data = sanitation_validations_1.createWastePointSchema.parse(req.body);
                const point = await this.service.execute(data);
                res.status(201).json({ success: true, data: point });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateWastePointController = CreateWastePointController;
//# sourceMappingURL=create-waste-point.controller.js.map