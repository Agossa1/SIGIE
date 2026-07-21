import type { Logger } from 'winston';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError, NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { Organization, CreateOrganizationDTO, UpdateOrganizationDTO } from '../types/organization.types';

export class OrganizationRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    public async findAll(): Promise<Organization[]> {
        try {
            const sql = `
                SELECT 
                    id, code, name, organization_type as "organizationType", 
                    email, phone, address, created_at as "createdAt"
                FROM organizations 
                ORDER BY created_at DESC
            `;
            const result = await this.db.query(sql);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching organizations:', error);
            throw new BadRequestError('Impossible de récupérer la liste des organisations');
        }
    }

    public async findById(id: string): Promise<Organization> {
        try {
            const sql = `
                SELECT 
                    id, code, name, organization_type as "organizationType", 
                    email, phone, address, created_at as "createdAt"
                FROM organizations 
                WHERE id = $1
            `;
            const result = await this.db.query(sql, [id]);
            if (result.rows.length === 0) throw new NotFoundError('Organisation non trouvée');
            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Error fetching organization by ID:', error);
            throw new BadRequestError('Erreur lors de la récupération de l\'organisation');
        }
    }

    public async create(dto: CreateOrganizationDTO): Promise<string> {
        const sql = `
            INSERT INTO organizations (
                code, name, organization_type, email, phone, address
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`;
        
        const params = [
            dto.code || null,
            dto.name,
            dto.organizationType || null,
            dto.email || null,
            dto.phone || null,
            dto.address || null
        ];

        try {
            const result = await this.db.query(sql, params);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error creating organization:', error);
            throw new BadRequestError('Échec de la création de l\'organisation');
        }
    }

    public async update(id: string, dto: UpdateOrganizationDTO): Promise<void> {
        try {
            const updates: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            if (dto.code !== undefined) { updates.push(`code = $${paramIndex++}`); params.push(dto.code); }
            if (dto.name !== undefined) { updates.push(`name = $${paramIndex++}`); params.push(dto.name); }
            if (dto.organizationType !== undefined) { updates.push(`organization_type = $${paramIndex++}::organization_type_enum`); params.push(dto.organizationType); }
            if (dto.email !== undefined) { updates.push(`email = $${paramIndex++}`); params.push(dto.email); }
            if (dto.phone !== undefined) { updates.push(`phone = $${paramIndex++}`); params.push(dto.phone); }
            if (dto.address !== undefined) { updates.push(`address = $${paramIndex++}`); params.push(dto.address); }

            if (updates.length === 0) return;

            params.push(id);
            const sql = `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
            
            const result = await this.db.query(sql, params);
            if (result.rowCount === 0) throw new NotFoundError('Organisation non trouvée');
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Error updating organization:', error);
            throw new BadRequestError('Échec de la mise à jour de l\'organisation');
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const sql = `DELETE FROM organizations WHERE id = $1`;
            const result = await this.db.query(sql, [id]);
            if (result.rowCount === 0) throw new NotFoundError('Organisation non trouvée');
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Error deleting organization:', error);
            throw new BadRequestError('Échec de la suppression de l\'organisation');
        }
    }
}