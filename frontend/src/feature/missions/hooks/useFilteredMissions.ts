import { useMemo } from 'react';
import { useAuthRoles } from '../../auth/hooks/useAuthRoles';
import { MissionType, type Mission } from '../services/missions.types';
import { User_Role } from '../../auth/services/auth.types';

export const useFilteredMissions = (missions: Mission[]) => {
    const { roles, hasAdminAccess } = useAuthRoles();

    const isSGDS = roles.includes('sgds_manager' as any) || roles.includes('agent_sgds' as any);
    const isDST = roles.includes('dst_manager' as any) || roles.includes('agent_dst' as any);

    const sgdsCategories = [
        MissionType.WASTE_COLLECTION,
        MissionType.SANITATION,
        MissionType.ECOLOGICAL_RESTORATION,
        MissionType.REFORESTATION,
        MissionType.BIODIVERSITY_SURVEY
    ];

    const filteredMissions = useMemo(() => {
        if (!missions) return [];

        return missions.filter(m => {
            // Admin and Supervisor see all missions in their territorial scope
            if (hasAdminAccess || roles.includes(User_Role.SUPERVISOR as any)) {
                return true;
            }

            // SGDS logic
            if (isSGDS) {
                return m.assignedService === 'sgds' || (!m.assignedService && sgdsCategories.includes(m.missionType));
            }

            // DST logic
            if (isDST) {
                return m.assignedService === 'dst' || (!m.assignedService && !sgdsCategories.includes(m.missionType));
            }

            // Default for other roles (like field agents who only see their team's missions anyway)
            return true;
        });
    }, [missions, isSGDS, isDST, hasAdminAccess, roles]);

    return filteredMissions;
};
