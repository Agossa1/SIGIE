import { useMemo, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import AdminPlatformLayout from "../shared/AdminPlatformLayout"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { User_Role } from "../../feature/auth/services/auth.types"
import { getRoleLabel, ROLE_CATALOG } from "../shared/roleCatalog"
import { buildRolePath } from "../shared/rolePages.config"
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles"
import type { UserWithRoles } from "../../feature/users/services/users.api"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { fetchUsers, assignUserRole } from "../../feature/users/services/users.thunk"
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

const AccessPage = () => {
  const { roles } = useAuthRoles()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<User_Role | "all">("all")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<User_Role | "">("")

  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const isLoading = useAppSelector(selectUsersLoading)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const usersPath = buildRolePath(roles, "users")
  const rolesPath = buildRolePath(roles, "roles")

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

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId) ?? null,
    [users, selectedUserId]
  )

  const handleSelectUser = (user: UserWithRoles) => {
    setSelectedUserId(user.id)
    setPendingRole((user.roles[0] as User_Role) ?? "")
    setSuccessMsg(null)
    setError(null)
  }

  const handleAssignRole = async () => {
    if (!pendingRole || !selectedUser) return
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await dispatch(assignUserRole({ userId: selectedUser.id, role: pendingRole })).unwrap()
      setSuccessMsg(`Rôle "${getRoleLabel(pendingRole)}" attribué à ${selectedUser.firstName} ${selectedUser.lastName}.`)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'attribution du rôle.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminPlatformLayout
      title="Accès & autorisations"
      subtitle="Attribution des rôles aux comptes utilisateurs."
      actions={
        <Link
          to={usersPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Voir tous les utilisateurs
        </Link>
      }
    >
      <div className="space-y-6">

        {/* Messages */}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold text-emerald-900">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-rose-800">{error}</p>
          </div>
        )}

        {/* Barre de recherche + filtre */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, e-mail ou rôle…"
                className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as User_Role | "all")}
              className="bg-white border border-gray-100 rounded-xl py-2 px-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80 min-w-[160px]"
            >
              <option value="all">Tous les rôles</option>
              {assignableRoles.map(r => (
                <option key={r} value={r}>{getRoleLabel(r)}</option>
              ))}
            </select>
          </div>
          <Link to={rolesPath} className="text-sm font-medium text-emerald-700 hover:underline self-center shrink-0">
            Référentiel des rôles →
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Tableau des utilisateurs */}
          <div className="xl:col-span-8 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner size="lg" label="Chargement des utilisateurs…" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/40 text-gray-400 text-sm font-semibold">
                      <th className="py-4 px-4 sm:px-6 font-semibold">Utilisateur</th>
                      <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">Rôle(s)</th>
                      <th className="py-4 px-4 sm:px-6 font-semibold hidden md:table-cell">Statut</th>
                      <th className="py-4 px-4 sm:px-6 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredUsers.map(user => {
                      const primaryRole = user.roles[0]
                      const isSelected = selectedUser?.id === user.id
                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50/40 transition-colors ${isSelected ? "bg-emerald-50/30" : ""}`}
                        >
                          <td className="py-4 px-4 sm:px-6">
                            <p className="font-bold text-black">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-400 font-medium mt-0.5 text-sm">{user.email}</p>
                            <div className="mt-1 sm:hidden">
                              {user.roles[0] ? (
                                <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium border bg-emerald-50 border-emerald-100 text-emerald-700">
                                  {getRoleLabel(user.roles[0] as User_Role)}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                            {primaryRole ? (
                              <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border bg-emerald-50 border-emerald-100 text-emerald-700">
                                {getRoleLabel(primaryRole as User_Role)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm font-medium">— Aucun rôle</span>
                            )}
                          </td>
                          <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border ${statusStyle[user.status] ?? "bg-gray-50 border-gray-100 text-gray-500"}`}>
                              {statusLabel[user.status] ?? user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectUser(user)}
                              className={`font-bold hover:underline transition-colors ${isSelected ? "text-emerald-600" : "text-emerald-700"}`}
                            >
                              {isSelected ? "✓ Sélectionné" : "Modifier"}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && !isLoading && (
                  <p className="text-center text-sm font-semibold text-gray-500 py-10">Aucun utilisateur trouvé.</p>
                )}
              </div>
            )}
          </div>

          {/* Panneau d'attribution */}
          <aside className="xl:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 space-y-4 sticky top-4">
            <h3 className="text-sm font-medium text-black">Attribuer un rôle</h3>
            {selectedUser ? (
              <>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-medium text-gray-400">Compte sélectionné</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-gray-500 font-medium">{selectedUser.email}</p>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-gray-400">Nouveau rôle</span>
                  <select
                    value={pendingRole}
                    onChange={e => setPendingRole(e.target.value as User_Role)}
                    className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80"
                  >
                    <option value="" disabled>Choisir un rôle</option>
                    {assignableRoles.map(r => (
                      <option key={r} value={r}>{getRoleLabel(r)}</option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleAssignRole}
                  disabled={!pendingRole || isSaving}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Enregistrement…
                    </>
                  ) : "Enregistrer l'attribution"}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-gray-400 font-semibold">Sélectionnez un utilisateur<br/>dans le tableau pour modifier son rôle.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AdminPlatformLayout>
  )
}

export default AccessPage
