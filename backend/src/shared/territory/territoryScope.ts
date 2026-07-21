export type TerritoryScopeLevel = 'national' | 'region' | 'municipality' | 'district';

export interface TerritoryScope {
    level: TerritoryScopeLevel;
    regionId?: string;
    municipalityId?: string;
    districtId?: string;
    /** Legacy fallback when region_id is not set (prefecture_director seeds). */
    department?: string;
}

const NATIONAL_ROLES = new Set(['super_admin', 'platform_admin', 'ministry']);

/** Roles that must be scoped to a single municipality when territory ids are set. */
const COMMUNE_SCOPED_ROLES = new Set([
    'mayor',
    'technician',
    'supervisor',
    'team_leader',
    'dst_manager',
    'sgds_manager',
]);

/** Roles scoped to a region (directeur départemental / préfecture). */
const REGION_SCOPED_ROLES = new Set(['prefecture_director']);

export interface TerritoryScopeInput {
    roles?: string[];
    municipalityId?: string | null;
    regionId?: string | null;
    districtId?: string | null;
    department?: string | null;
}

/**
 * Resolves the effective data scope for a user.
 * Null territory ids on non-national roles degrade to national (see-all) for backward compatibility.
 */
export function resolveTerritoryScope(input: TerritoryScopeInput): TerritoryScope {
    const roles = (input.roles ?? []).filter(Boolean);

    if (roles.some((r) => NATIONAL_ROLES.has(r))) {
        return { level: 'national' };
    }

    if (input.districtId) {
        return { level: 'district', districtId: input.districtId };
    }

    const wantsCommune =
        roles.length === 0 || roles.some((r) => COMMUNE_SCOPED_ROLES.has(r));
    if (wantsCommune && input.municipalityId) {
        return { level: 'municipality', municipalityId: input.municipalityId };
    }

    const wantsRegion = roles.some((r) => REGION_SCOPED_ROLES.has(r));
    if (wantsRegion && input.regionId) {
        return { level: 'region', regionId: input.regionId };
    }

    if (input.regionId) {
        return { level: 'region', regionId: input.regionId };
    }

    if (input.municipalityId) {
        return { level: 'municipality', municipalityId: input.municipalityId };
    }

    if (input.department) {
        return { level: 'region', department: input.department };
    }

    return { level: 'national' };
}

export function territoryScopeCacheKey(scope: TerritoryScope): string {
    switch (scope.level) {
        case 'district':
            return `district:${scope.districtId}`;
        case 'municipality':
            return `municipality:${scope.municipalityId}`;
        case 'region':
            return scope.regionId
                ? `region:${scope.regionId}`
                : `department:${(scope.department ?? '').toLowerCase()}`;
        default:
            return 'national';
    }
}
