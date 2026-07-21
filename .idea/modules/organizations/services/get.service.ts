import { OrganizationRepository } from '../repositories/organization.repository';
import { Organization } from '../types/organization.types';

export class GetOrganizationsService {
    constructor(private readonly repository: OrganizationRepository) {}

    async executeAll(): Promise<Organization[]> {
        return this.repository.findAll();
    }

    async executeById(id: string): Promise<Organization> {
        return this.repository.findById(id);
    }
}
