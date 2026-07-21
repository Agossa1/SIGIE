import type { IncidentPin } from './UnifiedMap'
import type { TechnicianReport } from '../../feature/reports/services/reports.types'

/**
 * Convertit un tableau de TechnicianReport en IncidentPin pour la carte.
 * Évite la duplication dans AdminMap, SignalementsMapPage, SharedGisMapPage.
 */
export function reportsToIncidentPins(reports: TechnicianReport[]): IncidentPin[] {
    return reports
        .filter(r => r.latitude != null && r.longitude != null)
        .map(r => ({
            id: r.id,
            title: r.title || 'Signalement',
            category: r.issueCategory,
            priority: r.riskLevel || r.priority || 'medium',
            lat: r.latitude!,
            lng: r.longitude!,
            municipalityId: r.municipalityId,
            district: [r.regionName, r.municipalityName, r.districtName, r.neighborhoodName].filter(Boolean).join(', ') || r.districtId || 'Non spécifié',
            regionName: r.regionName,
            municipalityName: r.municipalityName,
            districtName: r.districtName,
            neighborhoodName: r.neighborhoodName,
            reporter: r.creator
                ? `${r.creator.firstName ?? ''} ${r.creator.lastName ?? ''}`.trim() || (r.creator.email ?? r.createdBy ?? 'Agent')
                : (r.createdBy || 'Agent'),
            reporterRole: (r as any ).creatorRoleCode ,
            reporterRoleCode: (r as any ).creatorRoleCode,
            details: r.description || 'Aucune description',
            date: r.reportedAt || (r as any).createdAt,
        }))
}

export interface TerritoryInfo {
    type?: string
    name?: string
    municipalityName?: string
}

/**
 * Génère un sous-titre lisible pour la carte à partir des infos du territoire.
 */
export function getTerritorySubtitle(info: TerritoryInfo | null, fallback = 'Périmètre territorial'): string {
    if (!info?.type) return fallback
    switch (info.type) {
        case 'national': return 'Territoire National (Bénin)'
        case 'department': return `Département de l'${info.name}`
        case 'municipality': return `Commune de ${info.name}`
        case 'district': return `Arrondissement : ${info.name}${info.municipalityName ? ` (${info.municipalityName})` : ''}`
        case 'region': return `Région : ${info.name}`
        default: return info.name || fallback
    }
}

export const MAP_CATEGORY_FILTERS = [
    { key: 'flooding', label: 'Inondations', color: '#f43f5e' },
    { key: 'drainage', label: 'Drainage', color: '#f59e0b' },
    { key: 'road', label: 'Réseau routier', color: '#3b82f6' },
    { key: 'waste', label: 'Insalubrité', color: '#8b5cf6' },
    { key: 'biodiversity', label: 'Biodiversité', color: '#10b981' },
    { key: 'lighting', label: 'Éclairage', color: '#eab308' },
]