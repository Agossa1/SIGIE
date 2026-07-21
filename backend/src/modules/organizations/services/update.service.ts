import { OrganizationsRepository } from '../repositories/organizations.repository';
import type { Organization } from '../types/organizations.types';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class UpdateOrganizationService {
    constructor(private readonly repository: OrganizationsRepository) {}
    async execute(id: string, data: { name?: string; type?: string }): Promise<Organization> {
        const org = await this.repository.update(id, data);
        if (!org) throw new NotFoundError('Organisation introuvable');
        return org;
    }
}