export interface ReportCategory {
    code: string;
    label: string;
    icon: string;
    color: string;
    description?: string;
}

export const DEFAULT_CATEGORIES: ReportCategory[] = [
    { code: 'drainage', label: 'Drainage', icon: '💧', color: '#059669' },
    { code: 'waste', label: 'Déchets', icon: '🗑️', color: '#6b7280' },
    { code: 'road', label: 'Voirie', icon: '🛣️', color: '#059669' },
    { code: 'lighting', label: 'Éclairage', icon: '💡', color: '#6b7280' },
    { code: 'flooding', label: 'Inondation', icon: '🌊', color: '#059669' },
    { code: 'biodiversity', label: 'Biodiversité', icon: '🌿', color: '#047857' },
    { code: 'air_quality', label: 'Qualité Air', icon: '🌬️', color: '#6b7280' },
    { code: 'water_quality', label: 'Qualité Eau', icon: '🧪', color: '#059669' },
    { code: 'other', label: 'Autre', icon: '📋', color: '#9ca3af' },
];