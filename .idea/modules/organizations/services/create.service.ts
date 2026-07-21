import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDTO } from '../types/organization.types';

export class CreateOrganizationService {
    constructor(private readonly repository: OrganizationRepository) {}

    async execute(dto: CreateOrganizationDTO): Promise<string> {
        return this.repository.create(dto);
    }
}
