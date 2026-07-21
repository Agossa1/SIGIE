import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import type { Logger } from 'winston';

export interface MediaDTO {
    fileName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    type: 'image' | 'video' | 'document';
    relatedId: string;
    relatedType: string;
    uploaderId: string;
}

export class MediaRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) { }

    async saveMedia(dto: MediaDTO): Promise<string> {
        const sql = `
            INSERT INTO media (
                file_name, file_path, mime_type, file_size, type, related_id, related_type, uploader_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        try {
            const result = await this.db.query(sql, [
                dto.fileName, dto.filePath, dto.mimeType, dto.fileSize, dto.type, dto.relatedId, dto.relatedType, dto.uploaderId
            ]);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('Error saving media metadata:', error);
            throw error;
        }
    }
}