import { ProfilesRepository } from '../repositories/profiles.repository';
import type { UserProfile } from '../types/profiles.types';

export class UpdateProfileService {
    constructor(private readonly repository: ProfilesRepository) {}

    async execute(userId: string, data: {
        language?: string; theme?: string; notifications?: boolean; photoUrl?: string;
    }): Promise<UserProfile> {
        return this.repository.upsertProfile(userId, data);
    }
}