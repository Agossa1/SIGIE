import { createAsyncThunk } from "@reduxjs/toolkit";
import { interventionsApi } from "./interventions.api";
import type {
  Intervention,
  CreateInterventionDTO,
  CreateInterventionReportDTO,
  FieldAssignmentStatus,
  FieldInterventionReport,
} from "./interventions.types";

export const fetchInterventionsByMission = createAsyncThunk<
  Intervention[],
  string,
  { rejectValue: string }
>(
  "interventions/fetchByMission",
  async (missionId, { rejectWithValue }) => {
    try {
      return await interventionsApi.getInterventionsByMission(missionId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Impossible de récupérer les interventions"
      );
    }
  }
);

export const fetchInterventionsByTeam = createAsyncThunk<
  Intervention[],
  void,
  { rejectValue: string }
>(
  "interventions/fetchByTeam",
  async (_, { rejectWithValue }) => {
    try {
      return await interventionsApi.getInterventionsByTeam();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Impossible de récupérer les interventions de l'équipe"
      );
    }
  }
);


export const createIntervention = createAsyncThunk<
  { id: string },
  CreateInterventionDTO,
  { rejectValue: string }
>(
  "interventions/create",
  async (data, { rejectWithValue }) => {
    try {
      return await interventionsApi.createIntervention(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Impossible de créer l'intervention"
      );
    }
  }
);

export const updateInterventionStatus = createAsyncThunk<
  void,
  { id: string; status: FieldAssignmentStatus },
  { rejectValue: string }
>(
  "interventions/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await interventionsApi.updateInterventionStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Impossible de mettre à jour le statut"
      );
    }
  }
);

export const addInterventionReport = createAsyncThunk<
  FieldInterventionReport,
  { id: string; data: CreateInterventionReportDTO },
  { rejectValue: string }
>(
  "interventions/addReport",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await interventionsApi.addInterventionReport(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Impossible d'ajouter le rapport"
      );
    }
  }
);
