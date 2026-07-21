import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analytics.api';
import type { AnalyticsSummary } from '../services/analytics.api';

export const useAnalytics = () => {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = async () => {
        try {
            setLoading(true);
            const summary = await analyticsApi.getSummary();
            setData(summary);
        } catch (err) {
            setError('Impossible de charger les analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
        // Rafraîchissement auto toutes les 5 minutes
        const interval = setInterval(fetch, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return { data, loading, error, refresh: fetch };
};
