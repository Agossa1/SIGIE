import { api } from "../../../lib/apiClient";


export interface UserWithRoles {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    type: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

export const usersApi = {
    getAllUsers: async (): Promise<UserWithRoles[]> => {
        const response = await api.get<{ success: boolean; data: UserWithRoles[] }>("/users");
        return response.data || [];
    },

    assignRole: async (userId: string, role: string): Promise<UserWithRoles> => {
        const response = await api.patch<{ success: boolean; data: UserWithRoles }>(
            `/users/${userId}/roles`,
            { role }
        );
        return response.data;
    },
};
