import { Request, Response, NextFunction } from 'express';
import { TeamRepository } from '../repositories/team.repository';
import { z } from 'zod';
import crypto from 'crypto';

const addMemberSchema = z.object({
    userId: z.string().uuid('userId doit être un UUID valide'),
    role: z.enum(['member', 'leader']).optional().default('member'),
});

/**
 * GET /teams/:id/members  — Liste les membres actuels de la brigade
 */
export class GetTeamMembersController {
    constructor(private readonly teamRepository: TeamRepository) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const members = await this.teamRepository.getTeamMembers(id);
            return res.json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    };
}

/**
 * POST /teams/:id/members  — Ajoute un utilisateur à la brigade
 */
export class AddTeamMemberController {
    constructor(private readonly teamRepository: TeamRepository) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { userId, role } = addMemberSchema.parse(req.body);
            await this.teamRepository.addMember(id, userId, role);
            return res.json({ success: true, message: 'Membre ajouté à la brigade' });
        } catch (error) {
            next(error);
        }
    };
}

/**
 * DELETE /teams/:id/members/:userId  — Retire un utilisateur de la brigade
 */
export class RemoveTeamMemberController {
    constructor(private readonly teamRepository: TeamRepository) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const userId = req.params.userId as string;
            await this.teamRepository.removeMember(id, userId);
            return res.json({ success: true, message: 'Membre retiré de la brigade' });
        } catch (error) {
            next(error);
        }
    };
}
