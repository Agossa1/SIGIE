import { useState } from "react"
import AdminPlatformLayout from "../shared/AdminPlatformLayout"

const DUMMY_LOGS = [
  { id: "L1", user: "Aye Managossa", action: "Modification rôle", target: "Jean Directeur", date: "Il y a 5 min", status: "success" },
  { id: "L2", user: "Super Admin", action: "Création compte", target: "Marc Chef", date: "Il y a 1 heure", status: "success" },
  { id: "L3", user: "Super Admin", action: "Suppression organisation", target: "Test Commune", date: "Hier", status: "danger" },
  { id: "L4", user: "Système", action: "Export base de données", target: "All", date: "Hier", status: "warning" },
]

const PlatformAuditLogPage = () => {
  const [search, setSearch] = useState("")

  return (
    <AdminPlatformLayout
      title="Journaux d'audit"
      subtitle="Administration plateforme — Traçabilité des actions sensibles sur la plateforme."
      actions={
        <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter (CSV)
        </button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Consultation uniquement</h4>
            <p className="text-sm font-semibold text-blue-700/80 mt-0.5">Cet affichage est une maquette. Le vrai journal de sécurité arrivera très prochainement.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Filtrer par action ou utilisateur…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-500/80"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/40 text-gray-400 text-sm font-semibold border-b border-gray-50">
                  <th className="py-3 px-4 sm:px-6 hidden sm:table-cell">Date</th>
                  <th className="py-3 px-4 sm:px-6">Utilisateur</th>
                  <th className="py-3 px-4 sm:px-6">Action</th>
                  <th className="py-3 px-4 sm:px-6 hidden md:table-cell">Cible</th>
                  <th className="py-3 px-4 sm:px-6">Criticité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {DUMMY_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-medium text-gray-500 hidden sm:table-cell">{log.date}</td>
                    <td className="py-3 px-4 sm:px-6">
                      <p className="font-medium text-black">{log.user}</p>
                      <p className="text-gray-400 text-xs mt-0.5 sm:hidden">{log.date}</p>
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-semibold text-gray-700">{log.action}</td>
                    <td className="py-3 px-4 sm:px-6 text-gray-600 hidden md:table-cell">{log.target}</td>
                    <td className="py-3 px-4 sm:px-6">
                      {log.status === "success" && (
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border border-emerald-100 bg-emerald-50 text-emerald-700">Normal</span>
                      )}
                      {log.status === "warning" && (
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border border-amber-100 bg-amber-50 text-amber-700">Sensible</span>
                      )}
                      {log.status === "danger" && (
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-sm font-medium border border-rose-100 bg-rose-50 text-rose-700">Critique</span>
                      )}
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

export default PlatformAuditLogPage
