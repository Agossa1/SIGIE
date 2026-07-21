import type { RootState } from "../../../stores/store";

/** Sélectionne l'intégralité de l'état d'authentification */
export const selectAuth = (state: RootState) => state.auth;

/** Sélectionne l'utilisateur connecté */
export const selectCurrentUser = (state: RootState) => state.auth.user;

/** Indique si l'utilisateur est authentifié */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/** Indique si une requête d'auth est en cours */
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

/** Sélectionne le message d'erreur d'authentification */
export const selectAuthError = (state: RootState) => state.auth.error;

/** Sélectionne les rôles de l'utilisateur connecté */
export const selectCurrentUserRoles = (state: RootState) => state.auth.user?.roles ?? null;

/** Sélectionne le type de compte de l'utilisateur connecté */
export const selectCurrentUserType = (state: RootState) => state.auth.user?.type ?? null;

/** Sélectionne le premier rôle de l'utilisateur (pour compatibilité) */
export const selectPrimaryRole = (state: RootState) => state.auth.user?.roles?.[0] ?? null;
