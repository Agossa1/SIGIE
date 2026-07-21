import { OrganizationRepository } from '../repositories/organization.repository';
import { UpdateOrganizationDTO } from '../types/organization.types';

export class UpdateOrganizationService {
    constructor(private readonly repository: OrganizationRepository) {}

    async execute(id: string, dto: UpdateOrganizationDTO): Promise<void> {
        await this.repository.update(id, dto);
    }
}
