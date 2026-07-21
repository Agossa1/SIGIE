"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class ReportsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    /**
     * Crée un rapport principal et ses détails spécialisés dans une transaction ACID.
     */
    async createReport(dto, mediaUploadResult) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN'); // DEBUT DE TRANSACTION
            // 1. Insertion dans la table principale
            const insertReportSql = `
                WITH loc AS (SELECT ST_SetSRID(ST_MakePoint($10, $11), 4326) as geom),
                     terr AS (
                         SELECT n.id as n_id, d.id as d_id, m.id as m_id, r.id as r_id
                         FROM neighborhoods n
                         JOIN districts d ON n.district_id = d.id
                         JOIN municipalities m ON d.municipality_id = m.id
                         JOIN regions r ON m.region_id = r.id
                         CROSS JOIN loc
                         WHERE ST_Contains(n.geometry, loc.geom)
                         LIMIT 1
                     )
                INSERT INTO technician_reports (
                    title, description, issue_category, priority, risk_level, 
                    created_by, infrastructure_id, mapped_area_id,
                    location,
                    neighborhood_id, district_id, municipality_id, region_id
                ) 
                SELECT 
                    $1, $2, $3, $4, $5, 
                    $6, $7, $8, 
                    loc.geom,
                    COALESCE($9, terr.n_id), COALESCE($10, terr.d_id), COALESCE($11, terr.m_id), COALESCE($12, terr.r_id)
                FROM loc LEFT JOIN terr ON true
                RETURNING id
            `;
            const reportResult = await client.query(insertReportSql, [
                dto.title, dto.description, dto.issueCategory, dto.priority || 'medium', dto.riskLevel || 'medium',
                dto.createdBy, dto.infrastructureId, dto.mappedAreaId,
                dto.longitude, dto.latitude,
                dto.neighborhoodId || null,
                dto.districtId || null,
                dto.municipalityId || null,
                dto.regionId || null
            ]);
            const reportId = reportResult.rows[0].id;
            // 2. Insertions conditionnelles dans les tables filles (Class Table Inheritance)
            if (dto.drainageDetails) {
                const drainSql = `INSERT INTO report_details_drainage (report_id, blockage_level_pct, water_level_cm, flow_status) VALUES ($1, $2, $3, $4)`;
                await client.query(drainSql, [reportId, dto.drainageDetails.blockageLevelPct, dto.drainageDetails.waterLevelCm, dto.drainageDetails.flowStatus]);
            }
            else if (dto.roadDetails) {
                const roadSql = `INSERT INTO report_details_road (report_id, damage_surface_m2, pothole_depth_cm) VALUES ($1, $2, $3)`;
                await client.query(roadSql, [reportId, dto.roadDetails.damageSurfaceM2, dto.roadDetails.potholeDepthCm]);
            }
            else if (dto.wasteDetails) {
                const wasteSql = `INSERT INTO report_details_waste (report_id, estimated_volume_m3, waste_type) VALUES ($1, $2, $3)`;
                await client.query(wasteSql, [reportId, dto.wasteDetails.estimatedVolumeM3, dto.wasteDetails.wasteType]);
            }
            // 3. Insertion du média (Cloudinary upload)
            if (mediaUploadResult) {
                const mediaSql = `
                    INSERT INTO media (
                        file_name, file_path, mime_type, file_size, type, related_id, related_type, uploader_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id
                `;
                const mediaRes = await client.query(mediaSql, [
                    'mobile-upload.jpg', mediaUploadResult.url, 'image/webp', mediaUploadResult.size, 'image', reportId, 'technician_report', dto.createdBy
                ]);
                const mediaId = mediaRes.rows[0].id;
                const linkSql = `INSERT INTO technician_report_media (report_id, media_id) VALUES ($1, $2)`;
                await client.query(linkSql, [reportId, mediaId]);
            }
            await client.query('COMMIT'); // VALIDATION TRANSACTION
            return reportId;
        }
        catch (error) {
            await client.query('ROLLBACK'); // ANNULATION EN CAS D'ERREUR
            this.logger.error('Transaction error in createReport:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la création du rapport technique');
        }
        finally {
            client.release();
        }
    }
    /**
     * Récupère les rapports avec des JOIN vers les tables filles, filtrés par périmètre territorial.
     */
    async getReports(scope) {
        try {
            const conditions = ['tr.deleted_at IS NULL'];
            const params = [];
            if (scope && scope.level !== 'national') {
                if (scope.level === 'district' && scope.districtId) {
                    params.push(scope.districtId);
                    conditions.push(`tr.district_id = $${params.length}`);
                }
                else if (scope.level === 'municipality' && scope.municipalityId) {
                    params.push(scope.municipalityId);
                    conditions.push(`tr.municipality_id = $${params.length}`);
                }
                else if (scope.level === 'region') {
                    if (scope.regionId) {
                        params.push(scope.regionId);
                        conditions.push(`tr.region_id = $${params.length}`);
                    }
                    else if (scope.department) {
                        params.push(scope.department);
                        conditions.push(`LOWER(m.department) = LOWER($${params.length})`);
                    }
                }
            }
            const sql = `
                SELECT 
                    tr.id, tr.title, tr.description, tr.issue_category as "issueCategory", tr.status, tr.created_at as "createdAt", tr.created_by as "createdBy",
                    ST_X(tr.location) as "longitude",
                    ST_Y(tr.location) as "latitude",
                    med.file_path as "photoUrl",
                    row_to_json(d.*) as "drainageDetails",
                    row_to_json(rd.*) as "roadDetails",
                    row_to_json(w.*) as "wasteDetails",
                    json_build_object(
                        'neighborhoodId', n.id,
                        'neighborhoodName', n.name,
                        'districtId', dist.id,
                        'districtName', dist.name,
                        'municipalityId', m.id,
                        'municipalityName', m.name,
                        'regionId', r.id,
                        'regionName', r.name
                    ) as "territory"
                FROM technician_reports tr
                LEFT JOIN report_details_drainage d ON tr.id = d.report_id
                LEFT JOIN report_details_road rd ON tr.id = rd.report_id
                LEFT JOIN report_details_waste w ON tr.id = w.report_id
                LEFT JOIN technician_report_media trm ON tr.id = trm.report_id
                LEFT JOIN media med ON trm.media_id = med.id
                LEFT JOIN neighborhoods n ON tr.neighborhood_id = n.id
                LEFT JOIN districts dist ON tr.district_id = dist.id
                LEFT JOIN municipalities m ON tr.municipality_id = m.id
                LEFT JOIN regions r ON tr.region_id = r.id
                WHERE ${conditions.join(' AND ')}
                ORDER BY tr.created_at DESC
            `;
            const result = await this.db.query(sql, params);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching reports:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des rapports');
        }
    }
    /**
     * Récupère un rapport spécifique par son ID avec toutes ses dépendances.
     */
    async getReportById(id) {
        try {
            const sql = `
                SELECT 
                    tr.id, tr.title, tr.description, tr.issue_category as "issueCategory", tr.status, tr.created_at as "createdAt", tr.created_by as "createdBy",
                    ST_X(tr.location) as "longitude",
                    ST_Y(tr.location) as "latitude",
                    med.file_path as "photoUrl",
                    row_to_json(d.*) as "drainageDetails",
                    row_to_json(rd.*) as "roadDetails",
                    row_to_json(w.*) as "wasteDetails",
                    json_build_object(
                        'neighborhoodId', n.id,
                        'neighborhoodName', n.name,
                        'districtId', dist.id,
                        'districtName', dist.name,
                        'municipalityId', m.id,
                        'municipalityName', m.name,
                        'regionId', r.id,
                        'regionName', r.name
                    ) as "territory"
                FROM technician_reports tr
                LEFT JOIN report_details_drainage d ON tr.id = d.report_id
                LEFT JOIN report_details_road rd ON tr.id = rd.report_id
                LEFT JOIN report_details_waste w ON tr.id = w.report_id
                LEFT JOIN technician_report_media trm ON tr.id = trm.report_id
                LEFT JOIN media med ON trm.media_id = med.id
                LEFT JOIN neighborhoods n ON tr.neighborhood_id = n.id
                LEFT JOIN districts dist ON tr.district_id = dist.id
                LEFT JOIN municipalities m ON tr.municipality_id = m.id
                LEFT JOIN regions r ON tr.region_id = r.id
                WHERE tr.id = $1 AND tr.deleted_at IS NULL
            `;
            const result = await this.db.query(sql, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            this.logger.error('Error fetching report by id:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération du rapport détaillé');
        }
    }
    /**
     * Met à jour uniquement le statut d'un rapport technique.
     */
    async updateReportStatus(id, status) {
        try {
            const sql = `UPDATE technician_reports SET status = $1::field_report_status_enum, updated_at = NOW() WHERE id = $2`;
            await this.db.query(sql, [status, id]);
        }
        catch (error) {
            this.logger.error('Error updating report status:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la mise à jour du statut du rapport');
        }
    }
    /**
     * Supprime logiquement (Soft Delete) un rapport.
     * Utile pour la traçabilité.
     */
    async deleteReport(id) {
        try {
            const sql = `UPDATE technician_reports SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`;
            await this.db.query(sql, [id]);
        }
        catch (error) {
            this.logger.error('Error deleting report:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la suppression du rapport');
        }
    }
}
exports.ReportsRepository = ReportsRepository;
//# sourceMappingURL=reports.repositories.js.map