import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AdminPlatformLayout from "../shared/AdminPlatformLayout"
import {
  ROLE_TIER_LABELS,
  
  type RoleTier,
} from "../shared/roleCatalog"
import { ROLE_PAGE_DEFINITIONS } from "../shared/rolePages.config"
import { buildRolePath } from "../shared/rolePages.config"
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles"
import type { RoleRecord } from "../../feature/roles/services/roles.types"
import { useGetRolesQuery, useUpdateRoleMutation } from "../../feature/roles/services/roles.rtk"
import RoleEditModal from "./RoleEditModal"

const tierBadgeClass: Record<RoleTier, string> = {
  platform: "bg-emerald-50 border-emerald-100 text-emerald-700",
  territorial: "bg-blue-50 border-blue-100 text-blue-700",
  field: "bg-amber-50 border-amber-100 text-amber-800",
}

const RolesPage = () => {
  const { roles } = useAuthRoles()
  const [tierFilter, setTierFilter] = useState<RoleTier | "all">("all")
  const [search, setSearch] = useState("")
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null)

  const { data: dbRoles = [], isLoading: loading } = useGetRolesQuery()
  const [updateRoleMutation] = useUpdateRoleMutation()

  const handleSaveRole = async (id: string, data: Partial<RoleRecord>) => {
    await updateRoleMutation({ id, data }).unwrap()
  }

  const filtered = useMemo(() => {
    return dbRoles.filter(entry => {
      const matchesTier = tierFilter === "all" || entry.tier === tierFilter
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        entry.name.toLowerCase().includes(q) ||
        (entry.description || "").toLowerCase().includes(q) ||
        entry.code.toLowerCase().includes(q)
      return matchesTier && matchesSearch
    })
  }, [tierFilter, search, dbRoles])

  const accessPath = buildRolePath(roles, "access")

  return (
    <AdminPlatformLayout
      title="Rôles"
      subtitle="Référentiel des rôles HSE TERRA — lecture seule (configuration système)."
      actions={
        <Link
          to={accessPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm"
        >
          Gérer les accès utilisateurs
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Vue d'ensemble en lecture seule.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              className="w-full pl-4 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-emerald-400 transition-colors"
              placeholder="Rechercher un rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-emerald-400 transition-colors"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as RoleTier | "all")}
          >
            <option value="all">Tous les niveaux</option>
            {(Object.entries(ROLE_TIER_LABELS) as [RoleTier, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Chargement des rôles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setEditingRole(entry)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tierBadgeClass[entry.tier]}`}>
                    {ROLE_TIER_LABELS[entry.tier] || entry.tier}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{entry.code}</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">{entry.name}</h4>
                {entry.description && (
                  <p className="text-sm text-gray-500 mb-3">{entry.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {entry.page_ids?.slice(0, 5).map((pid) => (
                    <span key={pid} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                      {ROLE_PAGE_DEFINITIONS[pid]?.title ?? pid}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingRole && (
        <RoleEditModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSave={handleSaveRole}
        />
      )}
    </AdminPlatformLayout>
  )
}

export default RolesPage