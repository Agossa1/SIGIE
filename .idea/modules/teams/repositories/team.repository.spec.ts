import { TeamRepository } from './team.repository';
import { Logger } from 'winston';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';

describe('TeamRepository', () => {
    let repository: TeamRepository;
    let mockDb: jest.Mocked<PostgresDatabase>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockDb = {
            query: jest.fn(),
            getClient: jest.fn(),
        } as any;
        mockLogger = {
            error: jest.fn(),
            info: jest.fn(),
        } as any;
        repository = new TeamRepository(mockDb, mockLogger);
    });

    describe('createTeam', () => {
        it('should insert a new team and return the result', async () => {
            const teamData = {
                name: 'Brigade Sud',
                organizationId: 'org-123',
                municipalityId: 'muni-456'
            };

            const mockResult = { rows: [{ id: 'uuid-1', name: 'Brigade Sud' }] };
            mockDb.query.mockResolvedValue(mockResult as any);

            const result = await repository.createTeam(teamData);

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO field_teams'),
                expect.arrayContaining([teamData.name, teamData.organizationId])
            );
            expect(result).toEqual(mockResult.rows[0]);
        });

        it('should throw BadRequestError if query fails', async () => {
            mockDb.query.mockRejectedValue(new Error('DB Error'));

            await expect(repository.createTeam({ name: 'Error', organizationId: '1' }))
                .rejects.toThrow('Impossible de créer la brigade');
        });
    });

    describe('logAttendance', () => {
        it('should call ST_Point with correct coordinates', async () => {
            const log = { user_id: 'u1', team_id: 't1', latitude: 6.3, longitude: 2.4 };
            await repository.logAttendance(log);

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('ST_Point($4, $5)'),
                [expect.any(String), 'u1', 't1', 2.4, 6.3]
            );
        });
    });
});