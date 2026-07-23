import PostgresDatabase from '../../infra/database/postgres';
import type { Logger } from 'winston';
import { ReportsRepository } from './repositories/reports.repository';

import { CreateReportService } from './services/create';
import { GetReportService } from './services/get';
import { UpdateReportService } from './services/update';
import { DeleteReportService } from './services/delete';
import { CommentReportService } from './services/comment';
import { AssignReportService } from './services/assign';
import { RecommendReportService } from './services/recommend';
import { ValidateByTeamService } from './services/validate-by-team';

import { CreateReportController } from './controllers/create.controller';
import { GetReportController } from './controllers/get.controller';
import { UpdateReportController } from './controllers/update.controller';
import { DeleteReportController } from './controllers/delete.controller';
import { CommentReportController } from './controllers/comment.controller';
import { AssignReportController } from './controllers/assign.controller';
import { RecommendReportController } from './controllers/recommend.controller';
import { ValidateByTeamController } from './controllers/validate-by-team.controller';

export class ReportsModule {
    public readonly controllers: {
        create: CreateReportController;
        get: GetReportController;
        update: UpdateReportController;
        delete: DeleteReportController;
        comment: CommentReportController;
        assign: AssignReportController;
        recommend: RecommendReportController;
        validateByTeam: ValidateByTeamController;
    };

    constructor(db: PostgresDatabase, logger: Logger) {
        const repository = new ReportsRepository(db, logger);

        const createService = new CreateReportService(repository, logger);
        const getService = new GetReportService(repository, logger);
        const updateService = new UpdateReportService(repository, logger);
        const deleteService = new DeleteReportService(repository, logger);
        const commentService = new CommentReportService(repository, logger);
        const assignService = new AssignReportService(repository, logger);
        const recommendService = new RecommendReportService(repository, logger);
        const validateByTeamService = new ValidateByTeamService(repository, logger);

        this.controllers = {
            create: new CreateReportController(createService),
            get: new GetReportController(getService),
            update: new UpdateReportController(updateService),
            delete: new DeleteReportController(deleteService),
            comment: new CommentReportController(commentService),
            assign: new AssignReportController(assignService),
            recommend: new RecommendReportController(recommendService),
            validateByTeam: new ValidateByTeamController(validateByTeamService),
        };
    }
}