import { ProfilesRepository } from '../repositories/profiles.repository';
import type { UserProfile } from '../types/profiles.types';

export class GetProfileService {
    constructor(private readonly repository: ProfilesRepository) {}

    async execute(userId: string): Promise<UserProfile | null> {
        return this.repository.getProfile(userId);
    }
}