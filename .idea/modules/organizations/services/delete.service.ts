import { OrganizationRepository } from '../repositories/organization.repository';

export class DeleteOrganizationService {
    constructor(private readonly repository: OrganizationRepository) {}

    async execute(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
