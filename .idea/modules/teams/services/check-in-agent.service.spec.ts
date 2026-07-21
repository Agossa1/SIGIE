import { CheckInAgentService } from './check-in-agent.service';
import { TeamRepository } from '../repositories/team.repository';
import { Logger } from 'winston';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

describe('CheckInAgentService', () => {
    let service: CheckInAgentService;
    let mockRepo: jest.Mocked<TeamRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockRepo = {
            logAttendance: jest.fn(),
        } as any;
        mockLogger = { info: jest.fn() } as any;
        service = new CheckInAgentService(mockRepo, mockLogger);
    });

    it('doit lever une erreur si les coordonnées sont hors limites (Bénin ~6°N, 2°E)', async () => {
        const data = { userId: 'u1', teamId: 't1', latitude: 100, longitude: 2.4 };
        await expect(service.execute(data)).rejects.toThrow(BadRequestError);
    });

    it('doit enregistrer le pointage pour des coordonnées valides', async () => {
        const data = {
            userId: 'u1',
            teamId: 't1',
            latitude: 6.367, // Cotonou
            longitude: 2.425
        };

        await service.execute(data);

        expect(mockRepo.logAttendance).toHaveBeenCalledWith({
            user_id: 'u1',
            team_id: 't1',
            latitude: 6.367,
            longitude: 2.425
        });
    });
});