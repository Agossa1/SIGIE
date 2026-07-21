"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCollectionController = void 0;
const sanitation_validations_1 = require("../validations/sanitation.validations");
class CreateCollectionController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const data = sanitation_validations_1.createCollectionSchema.parse(req.body);
                const collection = await this.service.execute(data);
                res.status(201).json({ success: true, data: collection });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateCollectionController = CreateCollectionController;
//# sourceMappingURL=create-collection.controller.js.map