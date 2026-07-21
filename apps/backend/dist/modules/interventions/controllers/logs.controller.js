"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionLogsController = void 0;
class InterventionLogsController {
    constructor(service) {
        this.service = service;
        /**
         * GET /api/interventions/:id/logs
         */
        this.getLogs = async (req, res, next) => {
            try {
                const interventionId = req.params.id;
                const logs = await this.service.getLogs(interventionId);
                res.json({ success: true, data: logs });
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * POST /api/interventions/:id/logs
         */
        this.createLog = async (req, res, next) => {
            try {
                const interventionId = req.params.id;
                const user = req.user;
                const dto = {
                    interventionId,
                    authorId: user?.id,
                    logType: req.body.logType,
                    oldStatus: req.body.oldStatus,
                    newStatus: req.body.newStatus,
                    comment: req.body.comment,
                };
                await this.service.log(dto);
                res.status(201).json({ success: true, message: 'Log enregistré' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.InterventionLogsController = InterventionLogsController;
//# sourceMappingURL=logs.controller.js.map