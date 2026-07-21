"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class ReportingRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    /**
     * Calcule des statistiques globales des rapports techniques filtrées par municipalité.
     * C'est ici que l'on fait le lien fort entre le module Reporting et le module Territoire.
     */
    async getTerritoryStats(municipalityId) {
        try {
            // 1. Total et résolus
            const totalSql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN r.status = 'resolved' OR r.status = 'validated' THEN 1 ELSE 0 END) as resolved
                FROM technician_reports r
                JOIN neighborhoods n ON r.neighborhood_id = n.id
                JOIN districts d ON n.district_id = d.id
                WHERE d.municipality_id = $1 AND r.deleted_at IS NULL
            `;
            const totalResult = await this.db.query(totalSql, [municipalityId]);
            // 2. Par Quartier
            const byNeighborhoodSql = `
                SELECT 
                    n.id as "neighborhoodId", 
                    n.name as "neighborhoodName", 
                    COUNT(r.id) as count
                FROM neighborhoods n
                JOIN districts d ON n.district_id = d.id
                LEFT JOIN technician_reports r ON r.neighborhood_id = n.id AND r.deleted_at IS NULL
                WHERE d.municipality_id = $1
                GROUP BY n.id, n.name
                ORDER BY count DESC
            `;
            const byNeighborhoodResult = await this.db.query(byNeighborhoodSql, [municipalityId]);
            // 3. Par Catégorie
            const byCategorySql = `
                SELECT 
                    r.issue_category as category, 
                    COUNT(r.id) as count
                FROM technician_reports r
                JOIN neighborhoods n ON r.neighborhood_id = n.id
                JOIN districts d ON n.district_id = d.id
                WHERE d.municipality_id = $1 AND r.deleted_at IS NULL
                GROUP BY r.issue_category
                ORDER BY count DESC
            `;
            const byCategoryResult = await this.db.query(byCategorySql, [municipalityId]);
            return {
                municipalityId,
                totalReports: parseInt(totalResult.rows[0].total) || 0,
                resolvedReports: parseInt(totalResult.rows[0].resolved) || 0,
                reportsByNeighborhood: byNeighborhoodResult.rows.map((row) => ({
                    neighborhoodId: row.neighborhoodId,
                    neighborhoodName: row.neighborhoodName,
                    count: parseInt(row.count) || 0
                })),
                reportsByCategory: byCategoryResult.rows.map((row) => ({
                    category: row.category,
                    count: parseInt(row.count) || 0
                }))
            };
        }
        catch (error) {
            this.logger.error('Error fetching territory stats:', error);
            throw new appErrors_1.BadRequestError('Erreur lors du calcul des statistiques territoriales');
        }
    }
    /**
     * Sauvegarde un rapport d'analyse stratégique (ex: généré mensuellement)
     */
    async saveStrategicReport(dto) {
        try {
            const sql = `
                INSERT INTO strategic_analysis_reports (
                    municipality_id, report_type, title, report_data, generated_by
                ) VALUES ($1, $2, $3, $4, $5) RETURNING id
            `;
            const result = await this.db.query(sql, [
                dto.municipalityId, dto.reportType, dto.title, dto.reportData, dto.generatedBy
            ]);
            return result.rows[0].id;
        }
        catch (error) {
            this.logger.error('Error saving strategic report:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la sauvegarde du rapport stratégique');
        }
    }
    /**
     * Récupère la liste des rapports stratégiques pour une municipalité
     */
    async getStrategicReports(municipalityId) {
        try {
            const sql = `
                SELECT 
                    id, municipality_id as "municipalityId", report_type as "reportType", 
                    title, report_data as "reportData", generated_by as "generatedBy", created_at as "createdAt"
                FROM strategic_analysis_reports
                WHERE municipality_id = $1
                ORDER BY created_at DESC
            `;
            const result = await this.db.query(sql, [municipalityId]);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error fetching strategic reports:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des rapports stratégiques');
        }
    }
}
exports.ReportingRepository = ReportingRepository;
//# sourceMappingURL=reporting.repositories.js.map