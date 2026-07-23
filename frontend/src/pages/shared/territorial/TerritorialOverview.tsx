import type { ReactNode } from "react"

interface TerritorialOverviewProps {
  scopeLabel: string
  perimeterTag?: string
  description?: string
  children?: ReactNode
}

const TerritorialOverview = ({
  scopeLabel,
  perimeterTag = "Périmètre territorial",
  description = "Supervision des signalements, ouvrages et équipes sur votre territoire.",
  children,
}: TerritorialOverviewProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-emerald-700">{perimeterTag}</p>
        <h3 className="text-base font-medium text-gray-900 mt-0.5">{scopeLabel}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  </div>
)

export default TerritorialOverview
