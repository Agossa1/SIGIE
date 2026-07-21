import type { TokenPayload } from '../../modules/auth/types/auth.types';

/**
 * Applique un filtrage territorial automatique sur les requêtes selon le rôle de l'utilisateur.
 * Centralise la logique qui était dupliquée dans reports/services/get.ts.
 * 
 * @param user - Le payload JWT de l'utilisateur connecté
 * @returns Un objet partiel de filtres territoriaux à fusionner avec les filtres existants
 * 
 * Règles :
 * - super_admin, platform_admin, ministry → aucun filtre (voient tout)
 * - technician → limité à ses propres créations (createdBy)
 * - team_leader, supervisor → commune ou région
 * - mayor, dst_manager → commune uniquement
 * - prefecture_director, sgds_manager → région uniquement
 * - viewer → commune ou région
 * - Autre → aucun filtre (comportement par défaut)
 */
export function applyTerritorialFilter(user: TokenPayload): {
    createdBy?: string;
    municipalityId?: string;
    regionId?: string;
} {
    const filters: { createdBy?: string; municipalityId?: string; regionId?: string } = {};
    const roles = (user.roles || []).map(r => String(r));

    const isAdmin = roles.includes('super_admin') || roles.includes('platform_admin');
    const isNational = roles.includes('ministry');

    if (isAdmin || isNational) {
        // Pas de filtre — voit tout le territoire
        return filters;
    }

    // Technicien : ne voit que ses propres données
    if (roles.includes('technician')) {
        filters.createdBy = user.id;
        return filters;
    }

    // Rôles avec périmètre commune
    if (roles.includes('mayor') || roles.includes('dst_manager')) {
        if (user.municipalityId) {
            filters.municipalityId = user.municipalityId;
        }
        return filters;
    }

    // Rôles avec périmètre région (prioritaire) ou commune (fallback)
    if (roles.includes('prefecture_director') || roles.includes('sgds_manager')) {
        if (user.regionId) {
            filters.regionId = user.regionId;
        }
        return filters;
    }

    // Rôles avec périmètre commune → région (fallback)
    // team_leader, supervisor, viewer
    if (user.municipalityId) {
        filters.municipalityId = user.municipalityId;
    } else if (user.regionId) {
        filters.regionId = user.regionId;
    }

    return filters;
}