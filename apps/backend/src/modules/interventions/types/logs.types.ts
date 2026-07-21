export type InterventionLogType = 'status_change' | 'note' | 'blocker' | 'photo_added';

export interface InterventionLog {
    id: string;
    interventionId: string;
    authorId?: string;
    logType: InterventionLogType;
    oldStatus?: string;
    newStatus?: string;
    comment?: string;
    createdAt: string;
    authorName?: string;
    authorRole?: string;
}

export interface CreateInterventionLogDTO {
    interventionId: string;
    authorId?: string;
    logType: InterventionLogType;
    oldStatus?: string;
    newStatus?: string;
    comment?: string;
}
