export interface FieldTeam {
    id: string;
    name: string;
    status: string;
    municipalityId?: string;
    municipalityName?: string;
    regionId?: string;
    regionName?: string;
    membersCount: number;
    createdAt: string;
}

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    joinedAt: string;
}