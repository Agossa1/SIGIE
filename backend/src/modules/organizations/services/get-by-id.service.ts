import { OrganizationsRepository } from '../repositories/organizations.repository';
import type { Organization } from '../types/organizations.types';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class GetOrganizationByIdService {
    constructor(private readonly repository: OrganizationsRepository) {}
    async execute(id: string): Promise<Organization> { 
        const org = await this.repository.getById(id);
        if (!org) throw new NotFoundError('Organisation introuvable');
        return org;
    }
}