import { createAsyncThunk } from "@reduxjs/toolkit";
import { missionsApi } from "./missions.api";
import type { CreateMissionDTO, UpdateMissionDTO, AssignMissionDTO, CreateMissionReportDTO, MissionStatus, Mission, MissionDetails, MissionReport, MissionChecklist } from "./missions.types";

export const fetchMissions = createAsyncThunk<
  Mission[],
  void,
  { rejectValue: string }
>(
  "missions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await missionsApi.getAllMissions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch missions");
    }
  }
);

export const createMission = createAsyncThunk<
  { id: string },
  CreateMissionDTO,
  { rejectValue: string }
>(
  "missions/create",
  async (data, { rejectWithValue }) => {
    try {
      return await missionsApi.createMission(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create mission");
    }
  }
);

export const updateMissionStatus = createAsyncThunk<
  void,
  { id: string; status: MissionStatus; forceCompleteInterventions?: boolean },
  { rejectValue: any }
>(
  "missions/updateStatus",
  async ({ id, status, forceCompleteInterventions }, { rejectWithValue }) => {
    try {
      return await missionsApi.updateMissionStatus(id, status, forceCompleteInterventions);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "Failed to update mission status" });
    }
  }
);

export const fetchMissionById = createAsyncThunk<
  MissionDetails,
  string,
  { rejectValue: string }
>(
  "missions/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await missionsApi.getMissionById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch mission details");
    }
  }
);

export const updateMission = createAsyncThunk<
  void,
  { id: string; data: UpdateMissionDTO },
  { rejectValue: string }
>(
  "missions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await missionsApi.updateMission(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update mission");
    }
  }
);

export const assignMission = createAsyncThunk<
  void,
  { id: string; data: AssignMissionDTO },
  { rejectValue: string }
>(
  "missions/assign",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await missionsApi.assignMission(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign mission");
    }
  }
);

export const addMissionReport = createAsyncThunk<
  MissionReport,
  { id: string; data: CreateMissionReportDTO },
  { rejectValue: string }
>(
  "missions/addReport",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await missionsApi.addMissionReport(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add mission report");
    }
  }
);

export const fetchChecklist = createAsyncThunk<
  MissionChecklist[],
  string,
  { rejectValue: string }
>(
  "missions/fetchChecklist",
  async (id, { rejectWithValue }) => {
    try {
      return await missionsApi.getChecklist(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch checklist");
    }
  }
);

export const addChecklistItem = createAsyncThunk<
  MissionChecklist,
  { id: string; label: string; order: number },
  { rejectValue: string }
>(
  "missions/addChecklistItem",
  async ({ id, label, order }, { rejectWithValue }) => {
    try {
      return await missionsApi.addChecklistItem(id, label, order);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add checklist item");
    }
  }
);

export const toggleChecklistItem = createAsyncThunk<
  MissionChecklist,
  { id: string; itemId: string },
  { rejectValue: string }
>(
  "missions/toggleChecklistItem",
  async ({ id, itemId }, { rejectWithValue }) => {
    try {
      return await missionsApi.toggleChecklistItem(id, itemId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle checklist item");
    }
  }
);

export const deleteChecklistItem = createAsyncThunk<
  string,
  { id: string; itemId: string },
  { rejectValue: string }
>(
  "missions/deleteChecklistItem",
  async ({ id, itemId }, { rejectWithValue }) => {
    try {
      await missionsApi.deleteChecklistItem(id, itemId);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete checklist item");
    }
  }
);
