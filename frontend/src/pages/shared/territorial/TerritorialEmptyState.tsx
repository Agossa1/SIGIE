import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { buildRolePath } from "../rolePages.config"
import type { RolePageId } from "../rolePages.config"
import { useAuthRoles } from "../../../feature/auth/hooks/useAuthRoles"

interface TerritorialEmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  actionPageId?: RolePageId
}

const TerritorialEmptyState = ({
  title,
  description,
  icon,
  actionLabel = "Voir les opérations terrain",
  actionPageId = "fieldOps",
}: TerritorialEmptyStateProps) => {
  const { roles } = useAuthRoles()

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
      {icon && <div className="flex justify-center mb-3 text-gray-300">{icon}</div>}
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>
      <Link
        to={buildRolePath(roles, actionPageId)}
        className="inline-flex mt-4 text-sm font-medium text-emerald-700 hover:underline"
      >
        {actionLabel} →
      </Link>
    </div>
  )
}

export default TerritorialEmptyState
