import type { ReactNode } from "react"

interface RolePageShellProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

const RolePageShell = ({ title, subtitle, children }: RolePageShellProps) => (
  <div className="space-y-4">
    <div className="border-b border-gray-200 pb-4">
      <h2 className="text-xl sm:text-2xl font-medium text-black">{title}</h2>
      {subtitle && (
        <p className="text-sm font-semibold text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
    {children ?? (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-gray-500">Contenu en cours de déploiement pour ce périmètre.</p>
      </div>
    )}
  </div>
)

export default RolePageShell
