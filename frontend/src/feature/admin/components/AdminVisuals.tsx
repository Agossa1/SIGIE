import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import type { TechnicianReport } from '../../reports/services/reports.types'
import type { Mission } from '../../missions/services/missions.types'

// ── Enregistrement Chart.js ────────────────────────────────────────────────
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

// ── Types ──────────────────────────────────────────────────────────────────
export interface AdminVisualsData {
  totalReports: number
  completedMissions: number
  reportsByCategory: {
    waste: number
    drainage: number
    road: number
    other: number
  }
  reports: TechnicianReport[]
  missions: Mission[]
}

interface AdminVisualsProps {
  stats: AdminVisualsData
}

// ── Helpers ────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function aggregateReportsByMonth(reports: TechnicianReport[], categoryFilter?: string): { labels: string[]; values: number[] } {
  const now = new Date()
  const counts: Record<string, number> = {}

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    counts[key] = 0
  }

  reports.forEach((r) => {
    if (!r.createdAt) return
    if (categoryFilter && categoryFilter !== 'all') {
      if (categoryFilter === 'drainage' && r.issueCategory !== 'drainage' && r.issueCategory !== 'flooding') return
      if (categoryFilter !== 'drainage' && r.issueCategory !== categoryFilter) return
    }
    const d = new Date(r.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (counts[key] !== undefined) counts[key]++
  })

  const sortedKeys = Object.keys(counts).sort()
  return {
    labels: sortedKeys.map((k) => {
      const [, monthStr] = k.split('-')
      const month = parseInt(monthStr, 10)
      return MONTHS_SHORT[month] ?? ''
    }),
    values: sortedKeys.map((k) => counts[k]),
  }
}

// Tab colors map
const TAB_CONFIG = {
  all:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Tous',          activeClass: 'bg-emerald-500 text-white' },
  waste:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Déchets',       activeClass: 'bg-amber-500 text-white' },
  drainage: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Inondation',    activeClass: 'bg-blue-500 text-white' },
  road:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Infrastructures',activeClass: 'bg-purple-500 text-white' },
} as const

type TabKey = keyof typeof TAB_CONFIG

// ── Composant principal ────────────────────────────────────────────────────
const AdminVisuals = ({ stats }: AdminVisualsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const monthly = useMemo(() => aggregateReportsByMonth(stats.reports, activeTab), [stats.reports, activeTab])

  const { color, bg } = TAB_CONFIG[activeTab]

  // KPI metrics sous le graphique
  const kpiList = [
    { label: 'Signalements', val: stats.totalReports.toString(), trend: 'Total global', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Missions terminées', val: stats.completedMissions.toString(), trend: 'Sur le terrain', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Inondations', val: stats.reportsByCategory.drainage?.toString() || '0', trend: 'Urgence', trendUp: false, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Déchets', val: stats.reportsByCategory.waste.toString(), trend: 'Salubrité', trendUp: true, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const catData = [
    stats.reportsByCategory.waste,
    stats.reportsByCategory.drainage,
    stats.reportsByCategory.road,
    stats.reportsByCategory.other,
  ]
  const catTotal = stats.totalReports

  const catCategories = [
    { label: 'Déchets', color: '#f59e0b', value: stats.reportsByCategory.waste },
    { label: 'Inondation/Drainage', color: '#3b82f6', value: stats.reportsByCategory.drainage },
    { label: 'Infrastructures', color: '#8b5cf6', value: stats.reportsByCategory.road },
    { label: 'Autres', color: '#94a3b8', value: stats.reportsByCategory.other },
  ].filter(c => c.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ── Évolution des signalements (8/12) ── */}
      <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Évolution des signalements</h3>
            <p className="text-xs text-gray-400 mt-0.5">12 derniers mois</p>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1">
            {(Object.entries(TAB_CONFIG) as [TabKey, typeof TAB_CONFIG[TabKey]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === key
                    ? cfg.activeClass + ' shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        <div className="flex-1 min-h-[200px]">
          <Line
            data={{
              labels: monthly.labels,
              datasets: [
                {
                  label: 'Signalements',
                  data: monthly.values,
                  borderColor: color,
                  backgroundColor: bg,
                  borderWidth: 2.5,
                  pointBackgroundColor: color,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  fill: true,
                  tension: 0.4,
                }
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                tooltip: {
                  backgroundColor: '#fff',
                  titleColor: '#1e293b',
                  bodyColor: '#475569',
                  padding: 10,
                  cornerRadius: 10,
                  borderColor: '#e2e8f0',
                  borderWidth: 1,
                  boxPadding: 4,
                },
                legend: { display: false },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#94a3b8', font: { size: 12 } },
                  border: { display: false },
                },
                y: {
                  grid: { color: '#f1f5f9' },
                  ticks: {
                    color: '#94a3b8',
                    font: { size: 12 },
                    maxTicksLimit: 5,
                    stepSize: 1,
                  },
                  border: { display: false },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          {kpiList.map((kpi, i) => (
            <div key={i} className={`rounded-xl p-3 ${kpi.bg}`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.val}</p>
              <p className={`text-xs font-semibold mt-1 ${kpi.color} flex items-center gap-1`}>
                <span>{kpi.trendUp ? '↑' : '↓'}</span>
                <span>{kpi.trend}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Répartition par catégorie (4/12) ── */}
      <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-800">Répartition par catégorie</h3>
          <p className="text-xs text-gray-400 mt-0.5">{catTotal} signalement{catTotal > 1 ? 's' : ''} au total</p>
        </div>

        {/* Donut */}
        <div className="flex-1 flex items-center justify-center min-h-[180px] relative my-2">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-3xl font-bold text-gray-900">{catTotal}</span>
            <span className="text-xs text-gray-400">total</span>
          </div>
          <Doughnut
            data={{
              labels: ['Déchets', 'Inondation/Drainage', 'Infrastructures', 'Autres'],
              datasets: [
                {
                  data: catData,
                  backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#94a3b8'],
                  borderWidth: 4,
                  borderColor: '#ffffff',
                  hoverBorderWidth: 4,
                  hoverOffset: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#fff',
                  titleColor: '#1e293b',
                  bodyColor: '#475569',
                  padding: 10,
                  cornerRadius: 10,
                  borderColor: '#e2e8f0',
                  borderWidth: 1,
                },
              },
              cutout: '78%',
              layout: { padding: 8 },
            }}
          />
        </div>

        {/* Légende */}
        <div className="mt-4 space-y-2.5">
          {catCategories.map((cat) => {
            const pct = catTotal > 0 ? Math.round((cat.value / catTotal) * 100) : 0
            return (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-xs text-gray-600 font-medium truncate">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-800 w-4 text-right">{cat.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default AdminVisuals
