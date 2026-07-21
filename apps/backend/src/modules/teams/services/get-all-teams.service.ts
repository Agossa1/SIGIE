import { TeamsRepository } from '../repositories/teams.repository';
import type { FieldTeam } from '../repositories/teams.repository';

export class GetAllTeamsService {
    constructor(private readonly repository: TeamsRepository) {}
    async execute(): Promise<FieldTeam[]> {
        return this.repository.getAllTeams();
    }
}