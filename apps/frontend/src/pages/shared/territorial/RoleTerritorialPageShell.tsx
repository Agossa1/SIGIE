import type { ReactNode } from "react"
import { getRoleFolderByFolder } from "../rolePages.config"
import { ROLE_PAGE_DEFINITIONS, type RolePageId } from "../rolePages.config"
import RoleTerritorialLayout from "./RoleTerritorialLayout"

interface RoleTerritorialPageShellProps {
  folder: string
  pageId: RolePageId
  children?: ReactNode
  placeholderMessage?: string
}

const RoleTerritorialPageShell = ({
  folder,
  pageId,
  children,
  placeholderMessage,
}: RoleTerritorialPageShellProps) => {
  const config = getRoleFolderByFolder(folder)
  if (!config) {
    return null
  }

  const meta = ROLE_PAGE_DEFINITIONS[pageId]
  const title = pageId === "dashboard" ? (config.dashboardTitle ?? meta.title) : meta.title
  const subtitle = `${config.label} — ${meta.subtitle}`

  return (
    <RoleTerritorialLayout config={config} title={title} subtitle={subtitle}>
      {children ?? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-semibold text-gray-500">
            {placeholderMessage ?? "Contenu en cours de déploiement pour ce périmètre."}
          </p>
        </div>
      )}
    </RoleTerritorialLayout>
  )
}

export default RoleTerritorialPageShell
