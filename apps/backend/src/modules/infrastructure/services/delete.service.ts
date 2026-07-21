import { InfrastructureRepository } from '../repositories/infrastructure.repository';

export class DeleteInfrastructureService {
    constructor(private readonly repository: InfrastructureRepository) {}
    async execute(id: string): Promise<void> {
        return this.repository.softDelete(id);
    }
}