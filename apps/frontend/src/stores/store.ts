import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import authReducer from '../feature/auth/services/auth.slice';
import reportsReducer from '../feature/reports/services/reports.slice';
import passwordReducer from '../feature/password/services/password.slice';
import { missionsReducer } from '../feature/missions/services/missions.slice';
import { interventionsReducer } from '../feature/interventions/services/interventions.slice';
import { teamsReducer } from '../feature/teams/services/teams.slice';
import { territoryReducer } from '../feature/territory/services/territory.slice';
import { rolesReducer } from '../feature/roles/services/roles.slice';
import { usersReducer } from '../feature/users/services/users.slice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    reports: reportsReducer,
    password: passwordReducer,
    missions: missionsReducer,
    interventions: interventionsReducer,
    teams: teamsReducer,
    territory: territoryReducer,
    roles: rolesReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

// Types pour l'ensemble de l'application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

