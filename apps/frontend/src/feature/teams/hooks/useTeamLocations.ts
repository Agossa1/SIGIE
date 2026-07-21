import { useState, useEffect, useCallback, useRef } from 'react';
import { teamsApi } from '../services/teams.api';
import type { TeamLocation } from '../services/teams.api';

// Use the backend port directly for WebSocket (bypasses Vite proxy)
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';

// Max reconnect attempts before giving up silently
const MAX_RETRIES = 3;

export function useTeamLocations(userId?: string) {
    const [locations, setLocations] = useState<TeamLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const retryCount = useRef(0);
    const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch initial snapshot
    const fetchInitialLocations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await teamsApi.getLocations();
            setLocations(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des positions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialLocations();
    }, [fetchInitialLocations]);

    // Setup WebSocket for live updates with exponential backoff
    useEffect(() => {
        if (!userId) return;

        let ws: WebSocket | null = null;
        let destroyed = false;

        const connect = () => {
            if (destroyed || retryCount.current >= MAX_RETRIES) return;

            ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                if (destroyed) {
                    ws!.close();
                    return;
                }
                retryCount.current = 0; // reset on success
                ws!.send(JSON.stringify({ type: 'AUTH', userId }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'TEAM_LOCATION_UPDATE') {
                        const update = message.data;
                        setLocations(prev => {
                            const existingIdx = prev.findIndex(loc => loc.team_id === update.teamId);
                            const newLoc: TeamLocation = {
                                team_id: update.teamId,
                                team_name: update.teamName,
                                team_status: 'active',
                                user_id: update.userId,
                                latitude: update.latitude,
                                longitude: update.longitude,
                                check_in_time: update.timestamp,
                            };
                            if (existingIdx >= 0) {
                                const newArray = [...prev];
                                newArray[existingIdx] = newLoc;
                                return newArray;
                            } else {
                                return [...prev, newLoc];
                            }
                        });
                    }
                } catch (err) {
                    // Ignore parse errors silently
                }
            };

            ws.onerror = () => {
                // Silent — no console spam
            };

            ws.onclose = () => {
                if (destroyed) return;
                retryCount.current += 1;
                if (retryCount.current < MAX_RETRIES) {
                    // Exponential backoff: 2s, 4s, 8s
                    const delay = Math.pow(2, retryCount.current) * 1000;
                    retryTimeout.current = setTimeout(connect, delay);
                }
                // After MAX_RETRIES, give up silently
            };
        };

        connect();

        return () => {
            destroyed = true;
            if (retryTimeout.current) clearTimeout(retryTimeout.current);
            // Only close if already OPEN — closing a CONNECTING socket triggers
            // a browser warning ("closed before established"), especially visible
            // in React StrictMode's double-mount cycle.
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [userId]);

    return { locations, loading, error, refresh: fetchInitialLocations };
}
