export interface Team {
    id: string;
    name: string;
    organization_id?: string;
    municipality_id?: string;
    team_type?: string;
    description?: string;
    status: 'pending' | 'active' | 'suspended' | 'disabled';
    created_at: Date;
    updated_at?: Date;
    members_count?: number;
}

export interface TeamDTO {
    id: string;
    name: string;
    organizationId?: string;
    municipalityId?: string;
    teamType?: string;
    description?: string;
    status: 'pending' | 'active' | 'suspended' | 'disabled';
    createdAt: string;
    updatedAt?: string;
    membersCount?: number;
}

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role_in_team?: string;
    joined_at: Date;
    left_at?: Date;
}

export interface TeamWithMembers extends Team {
    members: TeamMember[];
}

export interface StaffPromotion {
    id: string;
    user_id: string;
    old_role_id: string;
    new_role_id: string;
    promoted_by: string;
    reason?: string;
    created_at: Date;
}

export interface StaffTransfer {
    id: string;
    user_id: string;
    old_team_id?: string;
    new_team_id?: string;
    transferred_by: string;
    reason?: string;
    created_at: Date;
}

/**
 * Représente un point géographique (Point, 4326)
 */
export interface GeoPoint {
    x: number; // Longitude
    y: number; // Latitude
}

export interface AttendanceLog {
    id: string;
    user_id: string;
    team_id: string;
    check_in_time?: Date;
    check_out_time?: Date;
    /**
     * Stocké sous forme de Point géométrique en DB
     */
    location?: GeoPoint | string; 
    created_at: Date;
}
