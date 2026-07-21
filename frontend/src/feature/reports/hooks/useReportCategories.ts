import { useState, useEffect } from 'react';
import { api } from '../../../lib/apiClient';

export interface ReportCategory {
    code: string;
    label: string;
    icon: string;
    color: string;
    description?: string;
}

const FALLBACK_CATEGORIES: ReportCategory[] = [
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

/**
 * Hook qui charge les catégories de signalement depuis l'API
 * avec fallback sur les valeurs par défaut si l'API échoue.
 */
export function useReportCategories() {
    const [categories, setCategories] = useState<ReportCategory[]>(FALLBACK_CATEGORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        api.get<{ success: boolean; data: ReportCategory[] }>('/report-categories')
            .then(res => {
                if (!cancelled && res.data?.length > 0) {
                    setCategories(res.data);
                }
            })
            .catch(() => {
                // Garder le fallback
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    return { categories, loading };
}

/**
 * Récupère les propriétés d'une catégorie par son code.
 * Fonctionne avec les catégories chargées (API) ou le fallback.
 */
export function getCategoryConfig(code: string, categories: ReportCategory[] = FALLBACK_CATEGORIES): ReportCategory {
    return categories.find(c => c.code === code) ?? { code, label: code, icon: '📋', color: '#9ca3af' };
}