export interface AuditLog {
    id: string;
    userId?: string;
    action: string;
    tableName?: string;
    recordId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    createdAt: string;
}

export interface AuditFilters {
    userId?: string;
    action?: string;
    tableName?: string;
    from?: string;
    to?: string;
}

export interface PaginatedAuditResponse {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}