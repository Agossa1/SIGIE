import { z } from 'zod';

export const createAssignmentSchema = z.object({
    assignedTeamId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    assignmentNotes: z.string().max(1000).optional(),
}).refine(data => data.assignedTeamId || data.assignedTo, {
    message: 'Vous devez spécifier une équipe ou un utilisateur à assigner',
});

export type CreateAssignmentDTO = z.infer<typeof createAssignmentSchema>;