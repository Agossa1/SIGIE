"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const reports_repository_1 = require("./repositories/reports.repository");
const create_1 = require("./services/create");
const get_1 = require("./services/get");
const update_1 = require("./services/update");
const delete_1 = require("./services/delete");
const comment_1 = require("./services/comment");
const assign_1 = require("./services/assign");
const create_controller_1 = require("./controllers/create.controller");
const get_controller_1 = require("./controllers/get.controller");
const update_controller_1 = require("./controllers/update.controller");
const delete_controller_1 = require("./controllers/delete.controller");
const comment_controller_1 = require("./controllers/comment.controller");
const assign_controller_1 = require("./controllers/assign.controller");
class ReportsModule {
    constructor(db, logger) {
        const repository = new reports_repository_1.ReportsRepository(db, logger);
        const createService = new create_1.CreateReportService(repository, logger);
        const getService = new get_1.GetReportService(repository, logger);
        const updateService = new update_1.UpdateReportService(repository, logger);
        const deleteService = new delete_1.DeleteReportService(repository, logger);
        const commentService = new comment_1.CommentReportService(repository, logger);
        const assignService = new assign_1.AssignReportService(repository, logger);
        this.controllers = {
            create: new create_controller_1.CreateReportController(createService),
            get: new get_controller_1.GetReportController(getService),
            update: new update_controller_1.UpdateReportController(updateService),
            delete: new delete_controller_1.DeleteReportController(deleteService),
            comment: new comment_controller_1.CommentReportController(commentService),
            assign: new assign_controller_1.AssignReportController(assignService),
        };
    }
}
exports.ReportsModule = ReportsModule;
//# sourceMappingURL=reports.module.js.map