import { SanitationRepository } from '../repositories/sanitation.repository';
import type { WastePoint } from '../types/sanitation.types';

export class CreateWastePointService {
    constructor(private readonly repository: SanitationRepository) {}
    async execute(data: {
        name: string; municipalityId?: string; latitude?: number; longitude?: number; wasteType?: string;
    }): Promise<WastePoint> {
        return this.repository.createWastePoint(data);
    }
}