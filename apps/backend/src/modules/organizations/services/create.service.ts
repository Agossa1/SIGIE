import { OrganizationsRepository } from '../repositories/organizations.repository';
import type { Organization } from '../types/organizations.types';

export class CreateOrganizationService {
    constructor(private readonly repository: OrganizationsRepository) {}
    async execute(data: { name: string; type: string; municipalityId?: string; regionId?: string }): Promise<Organization> {
        return this.repository.create(data);
    }
}