import { baseApi } from "../../../stores/baseApi";
import type { CreateUserDTO, User, VerifyAccountDTO, LoginCredentials } from "./auth.types";

/**
 * Service API pour l'authentification utilisant RTK Query.
 */
export const authRtkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authentification d'un utilisateur.
     */
    login: builder.mutation<User, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          identifier: credentials.email,
          password: credentials.password,
        },
      }),
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data.user,
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Enregistrement d'un nouvel utilisateur.
     */
    register: builder.mutation<User, CreateUserDTO>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data.user,
    }),

    /**
     * Vérification du compte via OTP.
     */
    verifyOtp: builder.mutation<{ success: boolean; message: string }, VerifyAccountDTO>({
      query: (data) => ({
        url: '/auth/verify',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Renvoi du code OTP.
     */
    resendOtp: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/resend-code-otp',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Déconnexion.
     */
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Récupération du profil utilisateur actuel.
     */
    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      transformResponse: (response: { success: boolean; data: { user: User } }) => response.data.user,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useGetProfileQuery,
} = authRtkApi;
