import { Building2, MapPin, Users } from "lucide-react"

interface TerritorialOverviewProps {
  scopeLabel: string
  perimeterTag?: string
  description?: string
  quartiers?: number
  equipes?: number
  signalements?: number
}

const TerritorialOverview = ({
  scopeLabel,
  perimeterTag = "Périmètre territorial",
  description = "Supervision des signalements, ouvrages et équipes sur votre territoire.",
  quartiers = 12,
  equipes = 8,
  signalements = 0,
}: TerritorialOverviewProps) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-emerald-700">{perimeterTag}</p>
        <h3 className="text-base font-medium text-gray-900 mt-0.5">{scopeLabel}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { icon: MapPin, label: "Zones", value: quartiers },
          { icon: Users, label: "Équipes", value: equipes },
          { icon: Building2, label: "Signalements", value: signalements },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
          >
            <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default TerritorialOverview
