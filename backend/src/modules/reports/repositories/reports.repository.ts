import type { Logger } from 'winston';
import PostgresDatabase from '../../../infra/database/postgres';
import {
    TechnicianReport, CreateReportDTO, UpdateReportDTO,
    ReportFilters, PaginatedResponse, ReportComment, CreateCommentDTO,
    CreateAssignmentDTO, ReportCreator,
    IssueCategory, FieldReportStatus, PriorityLevel, RiskLevel,
} from '../types/reports.types';

export class ReportsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    // ── CREATE ──────────────────────────────────────────────────────────────

    async createReport(dto: CreateReportDTO, userId: string): Promise<TechnicianReport> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const now = new Date();

            // 1. Insert main report
            const sql = `
                INSERT INTO technician_reports (
                    id, title, description, issue_category, priority, risk_level, status,
                    region_id, municipality_id, district_id, neighborhood_id,
                    infrastructure_id, mapped_area_id,
                    location, created_by, reported_at, sla_hours,
                    created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), $1, $2, $3, $4, $5, 'submitted',
                    $6, $7, $8, $9,
                    $10, $11,
                    ST_SetSRID(ST_MakePoint($12, $13), 4326),
                    $14, $15, 48,
                    $16, $16
                ) RETURNING *`;
            const params = [
                dto.title, dto.description || null,
                dto.issueCategory, dto.priority || 'medium', dto.riskLevel || 'medium',
                dto.regionId, dto.municipalityId, dto.districtId, dto.neighborhoodId,
                dto.infrastructureId || null, dto.mappedAreaId || null,
                dto.longitude, dto.latitude,
                userId, now.toISOString(),
                now.toISOString(),
            ];
            const result = await client.query(sql, params);
            const report = result.rows[0];

            // 2. Insert extension details (1:1)
            await this.insertExtension(client, report.id, dto);

            await client.query('COMMIT');
            return this.mapReport(report);

        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error creating report:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    private async insertExtension(client: any, reportId: string, dto: CreateReportDTO): Promise<void> {
        const ext = dto.issueCategory;
        if (ext === IssueCategory.DRAINAGE && dto.drainageDetails) {
            await client.query(
                `INSERT INTO report_details_drainage (report_id, blockage_level_pct, water_level_cm, flow_status)
                 VALUES ($1, $2, $3, $4)`,
                [reportId, dto.drainageDetails.blockageLevelPct, dto.drainageDetails.waterLevelCm, dto.drainageDetails.flowStatus]
            );
        } else if (ext === IssueCategory.ROAD && dto.roadDetails) {
            await client.query(
                `INSERT INTO report_details_road (report_id, damage_surface_m2, pothole_depth_cm)
                 VALUES ($1, $2, $3)`,
                [reportId, dto.roadDetails.damageSurfaceM2, dto.roadDetails.potholeDepthCm]
            );
        } else if (ext === IssueCategory.WASTE && dto.wasteDetails) {
            await client.query(
                `INSERT INTO report_details_waste (report_id, estimated_volume_m3, waste_type)
                 VALUES ($1, $2, $3)`,
                [reportId, dto.wasteDetails.estimatedVolumeM3, dto.wasteDetails.wasteType]
            );
        } else if (ext === IssueCategory.BIODIVERSITY && dto.biodiversityDetails) {
            await client.query(
                `INSERT INTO report_details_biodiversity (report_id, species_name, observation_type, count)
                 VALUES ($1, $2, $3, $4)`,
                [reportId, dto.biodiversityDetails.speciesName, dto.biodiversityDetails.observationType, dto.biodiversityDetails.count || 1]
            );
        } else if ((ext === IssueCategory.AIR_QUALITY || ext === IssueCategory.WATER_QUALITY) && dto.environmentDetails) {
            await client.query(
                `INSERT INTO report_details_environment (report_id, sensor_id, measured_value, unit)
                 VALUES ($1, $2, $3, $4)`,
                [reportId, dto.environmentDetails.sensorId || null, dto.environmentDetails.measuredValue, dto.environmentDetails.unit]
            );
        }
    }

    // ── READ ────────────────────────────────────────────────────────────────

    async getReports(filters: ReportFilters): Promise<PaginatedResponse<TechnicianReport>> {
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = filters;
        const offset = (page - 1) * limit;
        const allowedSortColumns = ['created_at', 'updated_at', 'priority', 'risk_level', 'status', 'title'];
        const sortCol = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

        const conditions: string[] = ['tr.deleted_at IS NULL'];
        const params: any[] = [];
        let paramIdx = 1;

        const addFilter = (col: string, value: any) => {
            if (value !== undefined && value !== null && value !== '') {
                conditions.push(`${col} = $${paramIdx++}`);
                params.push(value);
            }
        };

        addFilter('tr.status', filters.status);
        addFilter('tr.issue_category', filters.issueCategory);
        addFilter('tr.priority', filters.priority);
        addFilter('tr.risk_level', filters.riskLevel);
        addFilter('tr.region_id', filters.regionId);
        addFilter('tr.municipality_id', filters.municipalityId);
        addFilter('tr.district_id', filters.districtId);
        addFilter('tr.neighborhood_id', filters.neighborhoodId);
        addFilter('tr.created_by', filters.createdBy);
        addFilter('tr.assigned_to', filters.assignedTo);

        if (filters.search) {
            conditions.push(`(tr.title ILIKE $${paramIdx} OR tr.description ILIKE $${paramIdx})`);
            params.push(`%${filters.search}%`);
            paramIdx++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count
        const countSql = `SELECT count(*) FROM technician_reports tr ${whereClause}`;
        const countResult = await this.db.query(countSql, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Query
        const sql = `
            SELECT 
                tr.*,
                ST_X(tr.location) as longitude, ST_Y(tr.location) as latitude,
                u.first_name as "creatorFirstName", u.last_name as "creatorLastName", u.email as "creatorEmail",
                ru.role_id,
                r.code as "creatorRoleCode",
                reg.name as "regionName",
                mun.name as "municipalityName",
                dist.name as "districtName",
                neigh.name as "neighborhoodName",
                -- Extensions
                dd.blockage_level_pct as "drainageBlockage", dd.water_level_cm as "drainageWaterLevel", dd.flow_status as "drainageFlow",
                dr.damage_surface_m2 as "roadDamageSurface", dr.pothole_depth_cm as "roadPotholeDepth",
                dw.estimated_volume_m3 as "wasteVolume", dw.waste_type as "wasteTypeDetail",
                db.species_name as "bioSpecies", db.observation_type as "bioObsType", db.count as "bioCount",
                de.sensor_id as "envSensorId", de.measured_value as "envValue", de.unit as "envUnit"
            FROM technician_reports tr
            LEFT JOIN users u ON tr.created_by = u.id
            LEFT JOIN role_user ru ON u.id = ru.user_id
            LEFT JOIN roles r ON ru.role_id = r.id
            LEFT JOIN regions reg ON tr.region_id = reg.id
            LEFT JOIN municipalities mun ON tr.municipality_id = mun.id
            LEFT JOIN districts dist ON tr.district_id = dist.id
            LEFT JOIN neighborhoods neigh ON tr.neighborhood_id = neigh.id
            LEFT JOIN report_details_drainage dd ON tr.id = dd.report_id
            LEFT JOIN report_details_road dr ON tr.id = dr.report_id
            LEFT JOIN report_details_waste dw ON tr.id = dw.report_id
            LEFT JOIN report_details_biodiversity db ON tr.id = db.report_id
            LEFT JOIN report_details_environment de ON tr.id = de.report_id
            ${whereClause}
            ORDER BY tr.${sortCol} ${sortDir}
            LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;
        params.push(limit, offset);

        const result = await this.db.query(sql, params);
        const data = result.rows.map((row: any) => this.mapReport(row));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getReportById(id: string): Promise<TechnicianReport | null> {
        const sql = `
            SELECT 
                tr.*,
                ST_X(tr.location) as longitude, ST_Y(tr.location) as latitude,
                u.first_name as "creatorFirstName", u.last_name as "creatorLastName", u.email as "creatorEmail",
                r.code as "creatorRoleCode",
                reg.name as "regionName",
                mun.name as "municipalityName",
                dist.name as "districtName",
                neigh.name as "neighborhoodName",
                dd.blockage_level_pct as "drainageBlockage", dd.water_level_cm as "drainageWaterLevel", dd.flow_status as "drainageFlow",
                dr.damage_surface_m2 as "roadDamageSurface", dr.pothole_depth_cm as "roadPotholeDepth",
                dw.estimated_volume_m3 as "wasteVolume", dw.waste_type as "wasteTypeDetail",
                db.species_name as "bioSpecies", db.observation_type as "bioObsType", db.count as "bioCount",
                de.sensor_id as "envSensorId", de.measured_value as "envValue", de.unit as "envUnit"
            FROM technician_reports tr
            LEFT JOIN users u ON tr.created_by = u.id
            LEFT JOIN role_user ru ON u.id = ru.user_id
            LEFT JOIN roles r ON ru.role_id = r.id
            LEFT JOIN regions reg ON tr.region_id = reg.id
            LEFT JOIN municipalities mun ON tr.municipality_id = mun.id
            LEFT JOIN districts dist ON tr.district_id = dist.id
            LEFT JOIN neighborhoods neigh ON tr.neighborhood_id = neigh.id
            LEFT JOIN report_details_drainage dd ON tr.id = dd.report_id
            LEFT JOIN report_details_road dr ON tr.id = dr.report_id
            LEFT JOIN report_details_waste dw ON tr.id = dw.report_id
            LEFT JOIN report_details_biodiversity db ON tr.id = db.report_id
            LEFT JOIN report_details_environment de ON tr.id = de.report_id
            WHERE tr.id = $1 AND tr.deleted_at IS NULL
        `;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? this.mapReport(result.rows[0]) : null;
    }

    // ── UPDATE ──────────────────────────────────────────────────────────────

    async updateReport(id: string, dto: UpdateReportDTO): Promise<TechnicianReport | null> {
        const fields: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (dto.title !== undefined) { fields.push(`title = $${idx++}`); params.push(dto.title); }
        if (dto.description !== undefined) { fields.push(`description = $${idx++}`); params.push(dto.description); }
        if (dto.issueCategory !== undefined) { fields.push(`issue_category = $${idx++}`); params.push(dto.issueCategory); }
        if (dto.priority !== undefined) { fields.push(`priority = $${idx++}`); params.push(dto.priority); }
        if (dto.riskLevel !== undefined) { fields.push(`risk_level = $${idx++}`); params.push(dto.riskLevel); }
        if (dto.status !== undefined) { fields.push(`status = $${idx++}`); params.push(dto.status); }
        if (dto.assignedTo !== undefined) { fields.push(`assigned_to = $${idx++}`); params.push(dto.assignedTo); }
        if (dto.resolvedAt !== undefined) { fields.push(`resolved_at = $${idx++}`); params.push(dto.resolvedAt); }
        if (dto.slaHours !== undefined) { fields.push(`sla_hours = $${idx++}`); params.push(dto.slaHours); }

        if (fields.length === 0) return this.getReportById(id);

        fields.push(`updated_at = $${idx++}`);
        params.push(new Date().toISOString());
        params.push(id);

        const sql = `UPDATE technician_reports SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
        const result = await this.db.query(sql, params);
        return result.rows.length > 0 ? this.getReportById(id) : null;
    }

    // ── DELETE (soft) ───────────────────────────────────────────────────────

    async deleteReport(id: string): Promise<boolean> {
        const sql = `UPDATE technician_reports SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`;
        const result = await this.db.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    // ── COMMENTS ────────────────────────────────────────────────────────────

    async addComment(reportId: string, authorId: string, dto: CreateCommentDTO): Promise<ReportComment> {
        const sql = `
            INSERT INTO report_comments (id, report_id, author_id, body, is_internal, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
            RETURNING *`;
        const result = await this.db.query(sql, [reportId, authorId, dto.body, dto.isInternal ?? true]);
        const row = result.rows[0];

        // Récupérer le nom de l'auteur
        const userResult = await this.db.query(
            `SELECT first_name, last_name FROM users WHERE id = $1`, [authorId]
        );
        const author = userResult.rows[0] || { first_name: '', last_name: '' };

        return {
            id: row.id,
            reportId: row.report_id,
            authorId: row.author_id,
            authorFirstName: author.first_name,
            authorLastName: author.last_name,
            body: row.body,
            isInternal: row.is_internal,
            createdAt: row.created_at,
        };
    }

    async getComments(reportId: string): Promise<ReportComment[]> {
        const sql = `
            SELECT rc.*, u.first_name as "authorFirstName", u.last_name as "authorLastName"
            FROM report_comments rc
            JOIN users u ON rc.author_id = u.id
            WHERE rc.report_id = $1
            ORDER BY rc.created_at ASC`;
        const result = await this.db.query(sql, [reportId]);
        return result.rows.map((row: any) => ({
            id: row.id,
            reportId: row.report_id,
            authorId: row.author_id,
            authorFirstName: row.authorFirstName,
            authorLastName: row.authorLastName,
            body: row.body,
            isInternal: row.is_internal,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }

    // ── ASSIGNMENTS ─────────────────────────────────────────────────────────

    async assignReport(reportId: string, assignedBy: string, dto: CreateAssignmentDTO): Promise<void> {
        const sql = `
            INSERT INTO technician_report_assignments (id, report_id, assigned_team_id, assigned_to, assigned_by, assignment_status, assignment_notes, assigned_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', $5, NOW())`;
        await this.db.query(sql, [
            reportId,
            dto.assignedTeamId || null,
            dto.assignedTo || null,
            assignedBy,
            dto.assignmentNotes || null,
        ]);

        if (dto.assignedTo) {
            await this.db.query(
                `UPDATE technician_reports SET assigned_to = $1, status = 'assigned', updated_at = NOW() WHERE id = $2`,
                [dto.assignedTo, reportId]
            );
        }
    }

    // ── MAPPING ─────────────────────────────────────────────────────────────

    private mapReport(row: any): TechnicianReport {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            issueCategory: row.issue_category,
            priority: row.priority,
            riskLevel: row.risk_level,
            status: row.status,
            regionId: row.region_id,
            municipalityId: row.municipality_id,
            districtId: row.district_id,
            neighborhoodId: row.neighborhood_id,
            regionName: row.regionName,
            municipalityName: row.municipalityName,
            districtName: row.districtName,
            neighborhoodName: row.neighborhoodName,
            infrastructureId: row.infrastructure_id,
            mappedAreaId: row.mapped_area_id,
            latitude: row.latitude || 0,
            longitude: row.longitude || 0,
            createdBy: row.created_by,
            creator: row.creatorFirstName ? {
                id: row.created_by,
                firstName: row.creatorFirstName,
                lastName: row.creatorLastName || '',
                email: row.creatorEmail,
                roleCode: row.creatorRoleCode,
            } : undefined,
            reportedAt: row.reported_at,
            assignedTo: row.assigned_to,
            resolvedAt: row.resolved_at,
            slaHours: row.sla_hours || 48,
            // Extensions
            drainageDetails: row.drainageBlockage !== null ? {
                blockageLevelPct: row.drainageBlockage,
                waterLevelCm: row.drainageWaterLevel,
                flowStatus: row.drainageFlow,
            } : undefined,
            roadDetails: row.roadDamageSurface !== null ? {
                damageSurfaceM2: row.roadDamageSurface,
                potholeDepthCm: row.roadPotholeDepth,
            } : undefined,
            wasteDetails: row.wasteVolume !== null ? {
                estimatedVolumeM3: row.wasteVolume,
                wasteType: row.wasteTypeDetail,
            } : undefined,
            biodiversityDetails: row.bioSpecies ? {
                speciesName: row.bioSpecies,
                observationType: row.bioObsType,
                count: row.bioCount,
            } : undefined,
            environmentDetails: row.envValue !== null ? {
                sensorId: row.envSensorId,
                measuredValue: row.envValue,
                unit: row.envUnit,
            } : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
        };
    }
}