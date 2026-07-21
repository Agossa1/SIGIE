export interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: string;
    joinedAt: string;
    user?: { firstName: string; lastName: string; email: string };
}

export interface Team {
    id: string;
    name: string;
    organizationId?: string;
    municipalityId?: string;
    teamType?: string;
    description?: string;
    status: 'pending' | 'active' | 'suspended' | 'disabled';
    createdAt?: string;
    updatedAt?: string;
    membersCount?: number;
}

export interface CreateTeamDTO {
    name: string;
    teamType?: string;
    description?: string;
    municipalityId?: string;
    supervisorId?: string;
    memberIds?: string[];
}
