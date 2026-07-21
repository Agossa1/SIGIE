import AdminPlatformLayout from "../shared/AdminPlatformLayout"
import { AdminMapLayers } from "../../feature/gis/components/AdminMapLayers"
import RoleGuard from "../../feature/auth/components/RoleGuard"
import { User_Role } from "../../feature/auth/services/auth.types"
import { Navigate } from "react-router-dom"

/**
 * Page « Couches SIG » — réservée exclusivement au SUPER_ADMIN.
 * Permet d'importer des fichiers GeoJSON et de gérer les couches
 * géospatiales disponibles sur la carte.
 */
const LayersPage = () => {
  return (
    <RoleGuard
      allowedRoles={[User_Role.SUPER_ADMIN]}
      fallback={<Navigate to="/login" replace />}
    >
      <AdminPlatformLayout
        title="Couches SIG"
        subtitle="Importez et gérez vos données géospatiales (GeoJSON / Shapefile) pour les superposer sur la carte."
      >
        <AdminMapLayers />
      </AdminPlatformLayout>
    </RoleGuard>
  )
}

export default LayersPage
