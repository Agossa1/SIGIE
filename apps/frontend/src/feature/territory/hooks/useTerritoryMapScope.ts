import { useMemo } from 'react'
import { useAuthRoles } from '../../auth/hooks/useAuthRoles'
import { User_Role } from '../../auth/services/auth.types'
import {
  type TerritoryScope,
  territoryIdsFromUser,
  resolveTerritoryScope,
} from '../services/territoryScope'

export function useTerritoryMapScope(): TerritoryScope {
  const { roles, user } = useAuthRoles()
  const ids = territoryIdsFromUser(user ?? undefined)

  return useMemo(
    () =>
      resolveTerritoryScope({
        roles: roles as User_Role[],
        municipalityId: ids.municipalityId ?? null,
        regionId: ids.regionId ?? null,
        districtId: ids.districtId ?? null,
        department: ids.department ?? null,
      }),
    [roles, ids.municipalityId, ids.regionId, ids.districtId, ids.department]
  )
}
