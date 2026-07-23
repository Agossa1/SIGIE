export interface ReportFilters {
    status?: string;
    categoryId?: string;
    municipalityId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export enum IssueCategory {
    DRAINAGE = 'drainage',
    WASTE = 'waste',
    ROAD = 'road',
    LIGHTING = 'lighting',
    FLOODING = 'flooding',
    BIODIVERSITY = 'biodiversity',
    AIR_QUALITY = 'air_quality',
    WATER_QUALITY = 'water_quality',
    OTHER = 'other',
}

export enum FieldReportStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    VALIDATED_BY_TEAM = 'validated_by_team',
    NEEDS_REVISION = 'needs_revision',
    PENDING_DST = 'pending_dst',
    PENDING_SGDS = 'pending_sgds',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    VALIDATED = 'validated',
    REJECTED = 'rejected',
}

export enum PriorityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
    EMERGENCY = 'emergency',
}

export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum WaterFlowStatus {
    NORMAL = 'normal',
    REDUCED = 'reduced',
    BLOCKED = 'blocked',
    OVERFLOWING = 'overflowing',
}

export enum FieldAssignmentStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

// ── Extension details (1:1) ─────────────────────────────────────────────────

export interface DrainageDetails {
    blockageLevelPct: number;
    waterLevelCm: number;
    flowStatus: WaterFlowStatus;
}

export interface RoadDetails {
    damageSurfaceM2: number;
    potholeDepthCm: number;
}

export interface WasteDetails {
    estimatedVolumeM3: number;
    wasteType: string;
}

export interface BiodiversityDetails {
    speciesName: string;
    observationType: string;
    count?: number;
}

export interface EnvironmentDetails {
    sensorId?: string;
    measuredValue: number;
    unit: string;
}

// ── Entités principales ─────────────────────────────────────────────────────

export interface ReportCreator {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    roleCode?: string;
}

export interface ReportComment {
    id: string;
    reportId: string;
    authorId: string;
    authorFirstName: string;
    authorLastName: string;
    body: string;
    isInternal: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface TechnicianReport {
    id: string;
    title: string;
    description?: string;
    issueCategory: IssueCategory;
    priority: PriorityLevel;
    riskLevel: RiskLevel;
    status: FieldReportStatus;
    // Territoire (obligatoire)
    regionId: string;
    municipalityId: string;
    districtId: string;
    neighborhoodId: string;
    regionName?: string;
    municipalityName?: string;
    districtName?: string;
    neighborhoodName?: string;
    // Références optionnelles
    infrastructureId?: string;
    mappedAreaId?: string;
    // Géolocalisation
    latitude: number;
    longitude: number;
    // Traçabilité
    createdBy: string;
    creator?: ReportCreator;
    reportedAt: string;
    // Assignation & SLA
    assignedTo?: string;
    resolvedAt?: string;
    slaHours: number;
    // Recommandation superviseur
    supervisorRecommendation?: string;
    suggestedMissionType?: string;
    suggestedPriority?: string;
    estimatedBudget?: number;
    regroupedReportIds?: string[];
    urgentFlag?: boolean;
    // Extensions 1:1 typées
    drainageDetails?: DrainageDetails;
    roadDetails?: RoadDetails;
    wasteDetails?: WasteDetails;
    biodiversityDetails?: BiodiversityDetails;
    environmentDetails?: EnvironmentDetails;
    // Médias
    photoUrl?: string;
    photoBase64?: string;
    // Commentaires
    comments?: ReportComment[];
    // Timestamps
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateReportDTO {
    title: string;
    description?: string;
    issueCategory: IssueCategory;
    priority?: PriorityLevel;
    riskLevel?: RiskLevel;
    // Territoire obligatoire (back-end)
    regionId: string;
    municipalityId: string;
    districtId: string;
    neighborhoodId: string;
    // Références optionnelles
    infrastructureId?: string;
    mappedAreaId?: string;
    // Géolocalisation
    latitude: number;
    longitude: number;
    // Extensions 1:1
    drainageDetails?: DrainageDetails;
    roadDetails?: RoadDetails;
    wasteDetails?: WasteDetails;
    biodiversityDetails?: BiodiversityDetails;
    environmentDetails?: EnvironmentDetails;
    // Photo
    photoBase64?: string;
    // Custom neighborhood name (optional, for manual entry)
    customNeighborhoodName?: string;
}

export interface UpdateReportDTO {
    title?: string;
    description?: string;
    issueCategory?: IssueCategory;
    priority?: PriorityLevel;
    riskLevel?: RiskLevel;
    status?: FieldReportStatus;
    assignedTo?: string;
    resolvedAt?: string;
    slaHours?: number;
}

export interface CreateCommentDTO {
    body: string;
    isInternal?: boolean;
}

export interface CreateAssignmentDTO {
    assignedTeamId?: string;
    assignedTo?: string;
    assignmentNotes?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}