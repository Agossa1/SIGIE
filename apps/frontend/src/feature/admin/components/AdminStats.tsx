export interface AdminStatsData {
  activeReports: number;
  inProgressMissions: number;
  floodingReports: number;
  activeTeams: number;
  totalTeams: number;
  resolvedWaste: number;
}

interface AdminStatsProps {
  stats: AdminStatsData;
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const statsList = [
    {
      label: "Signalements Actifs",
      val: stats.activeReports.toString(),
      color: "bg-gray-50 text-gray-600",
      trend: "+0%",
      trendUp: true,
      desc: "ce mois-ci",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      label: "Missions en Cours",
      val: stats.inProgressMissions.toString(),
      color: "bg-gray-50 text-gray-600",
      trend: "+0",
      trendUp: true,
      desc: "depuis 7 jours",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
      )
    },
    {
      label: "Surveillance Crues",
      val: stats.floodingReports.toString(),
      color: "bg-gray-50 text-gray-600",
      trend: "0",
      trendUp: true,
      desc: "zones actives",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
        </svg>
      )
    },
    {
      label: "Disponibilité Flotte",
      val: `${stats.activeTeams} / ${stats.totalTeams}`,
      color: "bg-gray-50 text-gray-600",
      trend: stats.totalTeams > 0 ? `${Math.round((stats.activeTeams / stats.totalTeams) * 100)}%` : "0%",
      trendUp: true,
      desc: "équipes en service",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      label: "Salubrité Résolue",
      val: stats.resolvedWaste.toString(),
      color: "bg-gray-50 text-gray-600",
      trend: "0",
      trendUp: true,
      desc: "points nettoyés",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      {statsList.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 group hover:shadow-sm"
        >
          {/* Texte gauche */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-base font-semibold text-gray-500 block truncate">
              {stat.label}
            </span>
            <span className="text-3xl font-medium text-gray-900 block group-hover:scale-[1.02] transition-transform duration-200">
              {stat.val}
            </span>
            
            {/* Tendance */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-0.5 text-sm font-semibold px-1.5 py-0.5 rounded-md ${
                stat.trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {stat.trendUp ? "↑" : "↓"} {stat.trend}
              </span>
              <span className="text-sm font-medium text-gray-400 truncate">
                {stat.desc}
              </span>
            </div>
          </div>

          {/* Rond de Couleur Pastel droite */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ml-3 ${stat.color} group-hover:scale-105 transition-transform duration-300 border border-gray-100`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminStats
