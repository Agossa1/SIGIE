import { baseApi } from "../../../stores/baseApi";

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    body: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    read: boolean;
    created_at: string;
}

export interface NotificationsResponse {
    data: NotificationItem[];
    unread: number;
    total: number;
}

export const notificationsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationsResponse, { limit?: number; offset?: number } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.limit) searchParams.set('limit', String(params.limit));
                if (params?.offset) searchParams.set('offset', String(params.offset));
                const qs = searchParams.toString();
                return `/notifications${qs ? `?${qs}` : ''}`;
            },
            keepUnusedDataFor: 30,
        }),

        markNotificationRead: builder.mutation<void, string>({
            query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
        }),

        markAllNotificationsRead: builder.mutation<void, void>({
            query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
} = notificationsRtkApi;