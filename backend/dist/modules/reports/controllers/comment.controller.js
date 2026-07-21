"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentReportController = void 0;
const comment_validations_1 = require("../validations/comment.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
class CommentReportController {
    constructor(service) {
        this.service = service;
        this.addComment = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                const dto = comment_validations_1.createCommentSchema.parse(req.body);
                const comment = await this.service.execute(req.params.id, user.id, dto);
                return res.status(201).json({ success: true, data: comment });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CommentReportController = CommentReportController;
//# sourceMappingURL=comment.controller.js.map