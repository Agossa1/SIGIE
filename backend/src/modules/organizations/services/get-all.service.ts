import { OrganizationsRepository } from '../repositories/organizations.repository';
import type { Organization } from '../types/organizations.types';

export class GetAllOrganizationsService {
    constructor(private readonly repository: OrganizationsRepository) {}
    async execute(): Promise<Organization[]> { return this.repository.getAll(); }
}