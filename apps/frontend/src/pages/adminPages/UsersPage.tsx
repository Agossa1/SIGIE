import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import AdminPlatformLayout from "../shared/AdminPlatformLayout"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { User_Role } from "../../feature/auth/services/auth.types"
import { getRoleLabel, ROLE_CATALOG } from "../shared/roleCatalog"
import { buildRolePath } from "../shared/rolePages.config"
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { fetchUsers } from "../../feature/users/services/users.thunk"
import { selectAllUsers, selectUsersLoading } from "../../feature/users/services/users.selectors"

const statusLabel: Record<string, string> = {
  active: "Actif",
  ACTIVE: "Actif",
  pending: "En attente",
  PENDING: "En attente",
  suspended: "Suspendu",
  SUSPENDED: "Suspendu",
  deleted: "Supprimé",
  DELETED: "Supprimé",
}

const statusStyle: Record<string, string> = {
  active: "bg-emerald-50 border-emerald-100 text-emerald-700",
  ACTIVE: "bg-emerald-50 border-emerald-100 text-emerald-700",
  pending: "bg-amber-50 border-amber-100 text-amber-700",
  PENDING: "bg-amber-50 border-amber-100 text-amber-700",
  suspended: "bg-rose-50 border-rose-100 text-rose-700",
  SUSPENDED: "bg-rose-50 border-rose-100 text-rose-700",
  deleted: "bg-gray-50 border-gray-100 text-gray-500",
  DELETED: "bg-gray-50 border-gray-100 text-gray-500",
}

const assignableRoles = ROLE_CATALOG.map(e => e.role)

const PlatformUsersPage = () => {
  const { roles } = useAuthRoles()
  const accessPath = buildRolePath(roles, "access")
  
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<User_Role | "all">("all")
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const isLoading = useAppSelector(selectUsersLoading)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      const primaryRole = u.roles[0] ?? ""
      const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter)
      const matchesSearch =
        !q ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        primaryRole.toLowerCase().includes(q)
      return matchesRole && matchesSearch
    })
  }, [search, roleFilter, users])

  return (
    <AdminPlatformLayout
      title="Utilisateurs"
      subtitle="Annuaire des comptes et accréditations de la plateforme."
      actions={
        <Link
          to={accessPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm"
        >
          Gérer les accès
        </Link>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-rose-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, e-mail ou rôle…"
              className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as User_Role | "all")}
            className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80 min-w-[200px]"
          >
            <option value="all">Tous les rôles</option>
            {assignableRoles.map(r => (
              <option key={r} value={r}>{getRoleLabel(r)}</option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner size="lg" label="Chargement de l'annuaire…" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/40 text-gray-400 text-sm font-semibold">
                    <th className="py-4 px-4 sm:px-6 font-semibold">Utilisateur</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold hidden md:table-cell">Contact</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold">Rôle(s)</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">Statut</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold text-right hidden lg:table-cell">Dernière activité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredUsers.map(user => {
                    const primaryRole = user.roles[0]
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                              {user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-black">{user.firstName} {user.lastName}</p>
                              <p className="text-gray-400 font-medium text-sm mt-0.5 md:hidden">{user.email}</p>
                              <p className="text-gray-400 font-medium text-sm mt-0.5 hidden md:block">ID: {user.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                          <p className="text-gray-600 font-semibold">{user.email}</p>
                          {user.phone && <p className="text-gray-400 mt-0.5">{user.phone}</p>}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          {primaryRole ? (
                            <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border bg-emerald-50 border-emerald-100 text-emerald-700 whitespace-nowrap">
                              {getRoleLabel(primaryRole as User_Role)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm font-medium">— Aucun rôle</span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border ${statusStyle[user.status] ?? "bg-gray-50 border-gray-100 text-gray-500"}`}>
                            {statusLabel[user.status] ?? user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right text-gray-400 font-medium hidden lg:table-cell">
                          —
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-500">Aucun utilisateur trouvé.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminPlatformLayout>
  )
}

export default PlatformUsersPage
