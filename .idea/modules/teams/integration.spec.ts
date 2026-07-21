import PostgresDatabase from '../../../apps/backend/src/infra/database/postgres';
import { TeamRepository } from './repositories/team.repository';
import { CreateNewBrigadeService } from './services/create-new-brigade.service';
import { DeleteTeamService } from './services/delete-team.service';
import { GetOrganizationTeamsService } from './services/get-organization-teams.service';
import { logger } from '../../../apps/backend/src/shared/loggers/logger';
import crypto from 'crypto';

describe('Teams Integration (Database Flow)', () => {
    let db: PostgresDatabase;
    let repository: TeamRepository;
    let service: CreateNewBrigadeService;
    let deleteService: DeleteTeamService;
    let getService: GetOrganizationTeamsService;

    // Identifiants uniques pour le test afin d'éviter les collisions
    const testOrgId = crypto.randomUUID();
    const testUserId = crypto.randomUUID();

    beforeAll(async () => {
        db = new PostgresDatabase();
        repository = new TeamRepository(db, logger);
        service = new CreateNewBrigadeService(repository, logger);
        deleteService = new DeleteTeamService(repository, logger);
        getService = new GetOrganizationTeamsService(repository, logger);

        // Nettoyage de sécurité préalable
        await db.query('DELETE FROM team_members WHERE user_id = $1', [testUserId]);
        await db.query('DELETE FROM field_teams WHERE organization_id = $1', [testOrgId]);
        
        // Insertion des pré-requis nécessaires aux contraintes de clés étrangères
        // Nous insérons directement une organisation et un utilisateur de test
        await db.query(`
            INSERT INTO organizations (id, name) 
            VALUES ($1, 'Mairie Test Integration')
            ON CONFLICT (id) DO NOTHING
        `, [testOrgId]);

        await db.query(`
            INSERT INTO users (id, first_name, last_name, email) 
            VALUES ($1, 'Chef', 'Intervention', 'chef.integration@envdev.bj')
            ON CONFLICT (id) DO NOTHING
        `, [testUserId]);
    });

    afterAll(async () => {
        // Ménage final pour laisser la base de données propre
        await db.query('DELETE FROM team_members WHERE user_id = $1', [testUserId]);
        await db.query('DELETE FROM field_teams WHERE organization_id = $1', [testOrgId]);
        await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
        await db.query('DELETE FROM organizations WHERE id = $1', [testOrgId]);
        
        // Fermeture indispensable pour que Jest puisse s'arrêter proprement
        await db.close();
    });

    it('doit créer une brigade en base et lier automatiquement le superviseur', async () => {
        const brigadeData = {
            name: 'Brigade de Salubrité - Zone A',
            orgId: testOrgId,
            supervisorId: testUserId,
            teamType: 'waste_management',
            description: 'Équipe dédiée au ramassage des dépôts sauvages'
        };

        // Exécution du flux complet
        const result = await service.execute(brigadeData);

        // 1. Validation de la réponse du service
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe(brigadeData.name);

        // 2. Vérification de la persistance réelle dans la table 'field_teams'
        const teamCheck = await db.query(
            'SELECT * FROM field_teams WHERE id = $1', 
            [result.id]
        );
        expect(teamCheck.rows).toHaveLength(1);
        expect(teamCheck.rows[0].name).toBe(brigadeData.name);
        expect(teamCheck.rows[0].status).toBe('active');
        expect(teamCheck.rows[0].organization_id).toBe(testOrgId);

        // 3. Vérification de la liaison automatique dans 'team_members'
        // Le service doit avoir appelé addMember avec le rôle 'supervisor'
        const membershipCheck = await db.query(
            'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2', 
            [result.id, testUserId]
        );
        expect(membershipCheck.rows).toHaveLength(1);
        expect(membershipCheck.rows[0].role_in_team).toBe('supervisor');
        
        //  APRÈS
        logger.info(`Integration test successful for brigade: ${result.id}`);

    });

    it('doit supprimer logiquement une brigade (status = disabled) et ne plus l\'afficher dans la liste', async () => {
        // 1. Création d'une brigade dédiée au test de suppression
        const team = await service.execute({
            name: 'Brigade Temporaire Intégration',
            orgId: testOrgId
        });

        // 2. Vérifier qu'elle est présente dans la liste de l'organisation
        const listBefore = await getService.execute(testOrgId);
        expect(listBefore.some(t => t.id === team.id)).toBe(true);

        // 3. Suppression logique via le service
        await deleteService.execute(team.id);

        // 4. Vérifier directement en base que le statut est passé à 'disabled'
        const dbCheck = await db.query('SELECT status FROM field_teams WHERE id = $1', [team.id]);
        expect(dbCheck.rows[0].status).toBe('disabled');

        // 5. Vérifier que GetOrganizationTeamsService ne la retourne plus (filtre SQL status != 'disabled')
        const listAfter = await getService.execute(testOrgId);
        expect(listAfter.some(t => t.id === team.id)).toBe(false);
    });
});