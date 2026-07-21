import type { ReactNode } from "react";
import { useAuthRoles } from "../hooks/useAuthRoles";
import { User_Role } from "../services/auth.types";
import { useAppSelector } from "../../../stores/hooks";
import { selectIsAuthenticated } from "../services/auth.selectors";

interface RoleGuardProps {
    allowedRoles: User_Role[];
    children: ReactNode;
    fallback?: ReactNode;
    /** Désactive le bypass super_admin (optionnel, défaut: false = bypass actif) */
    strict?: boolean;
}

/**
 * Composant de Sécurité (RoleGuard)
 * N'affiche ses enfants que si l'utilisateur est authentifié ET possède l'un des rôles autorisés.
 * Le super_admin a le droit absolu d'accès (bypass automatique, désactivable via strict=true).
 */
export const RoleGuard = ({ allowedRoles, children, fallback, strict = false }: RoleGuardProps) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const { roles, hasAnyRole } = useAuthRoles();
    
    // Pas authentifié → pas d'accès
    if (!isAuthenticated) {
        return <>{fallback ?? null}</>;
    }

    // Aucun rôle → pas d'accès
    if (roles.length === 0) {
        return <>{fallback ?? null}</>;
    }

    // Vérification avec bypass super_admin (sauf si strict=true)
    const isAuthorized = strict 
        ? roles.some(role => allowedRoles.includes(role))
        : hasAnyRole(allowedRoles);

    if (!isAuthorized) {
        return fallback !== undefined ? <>{fallback}</> : (
            <div className="flex items-center justify-center p-8 text-gray-400 text-sm">
                🔒 Accès réservé — vous n'avez pas les droits nécessaires.
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleGuard;
