import { fetchWithTimeout } from "./fetchWithTimeout"

// Utilisation du Proxy Vite pour contrer les restrictions SameSite
const BASE_URL = '/api';

export interface CustomRequestInit extends RequestInit {
    timeout?: number;
}

interface ApiError extends Error {
    data?: unknown;
    status?: number;
}

async function apiClient<T>(
    endpoint: string,
    { body, timeout = 30000, ...customConfig }: CustomRequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const config: RequestInit = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        credentials: 'include', // INDISPENSABLE pour envoyer/recevoir les cookies HttpOnly
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    let response: Response
    try {
        response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, config, timeout);
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Délai dépassé — le serveur met trop de temps à répondre.', { cause: err });
        }
        if (err instanceof Error) {
            throw new Error(
                navigator.onLine ? 'Échec de la requête réseau' : "Pas de connexion internet. Le signalement sera sauvegardé localement.",
                { cause: err }
            );
        }
        throw new Error('Échec de la requête réseau');
    }

    if (response.status === 401) {
        // Tentative de refresh token automatique (une seule fois)
        const headers = customConfig.headers as Record<string, string> | undefined;
        if (!headers?.['x-retry'] && typeof window !== 'undefined') {
            try {
                const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                if (refreshResponse.ok) {
                    // Retenter la requête originale avec un flag anti-boucle
                    return apiClient<T>(endpoint, {
                        ...customConfig,
                        headers: { ...headers, 'x-retry': '1' },
                        body,
                        timeout,
                    });
                }
            } catch {
                // Refresh échoué → laisser le flux normal gérer l'erreur
            }
        }
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path !== '/login' && path !== '/register' && !path.startsWith('/onboarding') && !path.startsWith('/invitations')) {
            // Redirection vers login après échec d'auth
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    }

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
        return data;
    } else {
        const error = new Error(data?.message || data?.error || 'API Error') as ApiError;
        error.data = data;
        error.status = response.status;
        return Promise.reject(error);
    }
}

export const api = {
    get: <T>(endpoint: string, config?: CustomRequestInit) => apiClient<T>(endpoint, { ...config, method: 'GET' }),
    post: <T>(endpoint: string, body?: any, config?: CustomRequestInit) => apiClient<T>(endpoint, { ...config, method: 'POST', body }),
    patch: <T>(endpoint: string, body?: any, config?: CustomRequestInit) => apiClient<T>(endpoint, { ...config, method: 'PATCH', body }),
    put: <T>(endpoint: string, body?: any, config?: CustomRequestInit) => apiClient<T>(endpoint, { ...config, method: 'PUT', body }),
    delete: <T>(endpoint: string, config?: CustomRequestInit) => apiClient<T>(endpoint, { ...config, method: 'DELETE' }),
};
