import { useState } from "react"
import AdminPlatformLayout from "../shared/AdminPlatformLayout"

const DUMMY_ORGS = [
  { id: 1, name: "Mairie de Cotonou", type: "Commune", departement: "Littoral", status: "Actif" },
  { id: 2, name: "Préfecture de l'Atlantique", type: "Préfecture", departement: "Atlantique", status: "Actif" },
  { id: 3, name: "Mairie d'Abomey-Calavi", type: "Commune", departement: "Atlantique", status: "Actif" },
  { id: 4, name: "Ministère du Cadre de Vie", type: "Ministère", departement: "National", status: "Actif" },
]

const PlatformOrganizationsPage = () => {
  const [search, setSearch] = useState("")

  return (
    <AdminPlatformLayout
      title="Organisations & communes"
      subtitle="Administration plateforme — Structures territoriales et rattachements institutionnels."
      actions={
        <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm">
          + Ajouter une structure
        </button>
      }
    >
      <div className="space-y-6">
        {/* Encart "Bientôt disponible" ou Info */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-emerald-900">Module en cours de développement</h4>
            <p className="text-sm font-semibold text-emerald-700/80 mt-0.5">La gestion complète de l'arborescence territoriale et des entités arrivera dans la prochaine version.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher une organisation…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80"
              />
            </div>
            <select className="bg-gray-50/50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-emerald-500/80">
              <option value="">Tous les types</option>
              <option value="Commune">Commune</option>
              <option value="Préfecture">Préfecture</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/40 text-gray-400 text-sm font-semibold border-b border-gray-50">
                  <th className="py-3 px-4 sm:px-6">Nom de la structure</th>
                  <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Type</th>
                  <th className="py-3 px-4 sm:px-6 hidden md:table-cell">Département</th>
                  <th className="py-3 px-4 sm:px-6">Statut</th>
                  <th className="py-3 px-4 sm:px-6 text-right hidden sm:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {DUMMY_ORGS.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <p className="font-medium text-black">{org.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5 sm:hidden">{org.type}</p>
                    </td>
                    <td className="py-3 px-4 sm:px-6 hidden sm:table-cell">
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600">
                        {org.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-medium text-gray-600 hidden md:table-cell">{org.departement}</td>
                    <td className="py-3 px-4 sm:px-6">
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border border-emerald-100 bg-emerald-50 text-emerald-700">
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right hidden sm:table-cell">
                      <button className="text-gray-400 hover:text-emerald-600 font-medium transition-colors">
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPlatformLayout>
  )
}

export default PlatformOrganizationsPage
