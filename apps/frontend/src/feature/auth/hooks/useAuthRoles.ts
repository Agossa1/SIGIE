import { useAppSelector } from "../../../stores/hooks";
import { selectCurrentUser } from "../services/auth.selectors";
import { User_Role } from "../services/auth.types";

/**
 * Hook de Gestion Centralisée des Rôles (useAuthRoles)
 * Fournit des utilitaires d'autorisation robustes pour le frontend.
 * Gère automatiquement le bypass total du rôle SUPER_ADMIN pour toutes les vérifications.
 */
export const useAuthRoles = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  const roles: User_Role[] = currentUser?.roles || [];

  const isSuperAdmin = roles.includes(User_Role.SUPER_ADMIN);
  const isPlatformAdmin = roles.includes(User_Role.PLATFORM_ADMIN);
  const hasAdminAccess = isSuperAdmin || isPlatformAdmin;

  /**
   * Vérifie si l'utilisateur possède un rôle spécifique (ou est super_admin).
   */
  const hasRole = (role: User_Role): boolean => {
    return isSuperAdmin || roles.includes(role);
  };

  /**
   * Vérifie si l'utilisateur possède l'un des rôles spécifiés (ou est super_admin).
   */
  const hasAnyRole = (allowedRoles: User_Role[]): boolean => {
    return isSuperAdmin || roles.some(role => allowedRoles.includes(role));
  };

  return {
    roles,
    isSuperAdmin,
    isPlatformAdmin,
    hasAdminAccess,
    hasRole,
    hasAnyRole,
    user: currentUser,
  };
};
