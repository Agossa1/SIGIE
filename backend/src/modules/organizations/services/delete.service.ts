import { OrganizationsRepository } from '../repositories/organizations.repository';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteOrganizationService {
    constructor(private readonly repository: OrganizationsRepository) {}
    async execute(id: string): Promise<boolean> { 
        const deleted = await this.repository.softDelete(id); 
        if (!deleted) throw new NotFoundError('Organisation introuvable');
        return deleted;
    }
}