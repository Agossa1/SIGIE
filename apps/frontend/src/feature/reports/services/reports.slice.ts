import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
    fetchReports, fetchReportById,
    createReport, updateReport, deleteReport,
    addReportComment, assignReport,
} from './reports.thunk';
import type { TechnicianReport, ReportComment } from './reports.types';

interface ReportsState {
    reports: TechnicianReport[];
    selectedReport: TechnicianReport | null;
    isLoading: boolean;
    isDetailLoading: boolean;
    error: string | null;
}

const initialState: ReportsState = {
    reports: [],
    selectedReport: null,
    isLoading: false,
    isDetailLoading: false,
    error: null,
};

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        clearSelectedReport: (state) => { state.selectedReport = null; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchReports
            .addCase(fetchReports.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchReports.fulfilled, (state, action: PayloadAction<TechnicianReport[]>) => { state.isLoading = false; state.reports = action.payload; })
            .addCase(fetchReports.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

            // fetchReportById
            .addCase(fetchReportById.pending, (state) => { state.isDetailLoading = true; state.error = null; })
            .addCase(fetchReportById.fulfilled, (state, action: PayloadAction<TechnicianReport>) => { state.isDetailLoading = false; state.selectedReport = action.payload; })
            .addCase(fetchReportById.rejected, (state, action) => { state.isDetailLoading = false; state.error = action.payload as string; })

            // createReport
            .addCase(createReport.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(createReport.fulfilled, (state, action: PayloadAction<TechnicianReport>) => { state.isLoading = false; state.reports.unshift(action.payload); })
            .addCase(createReport.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; })

            // updateReport
            .addCase(updateReport.fulfilled, (state, action: PayloadAction<TechnicianReport>) => {
                const idx = state.reports.findIndex(r => r.id === action.payload.id);
                if (idx !== -1) state.reports[idx] = action.payload;
                if (state.selectedReport?.id === action.payload.id) state.selectedReport = action.payload;
            })

            // deleteReport
            .addCase(deleteReport.fulfilled, (state, action: PayloadAction<string>) => {
                state.reports = state.reports.filter(r => r.id !== action.payload);
                if (state.selectedReport?.id === action.payload) state.selectedReport = null;
            })

            // addReportComment
            .addCase(addReportComment.fulfilled, (state, action: PayloadAction<ReportComment>) => {
                const report = state.reports.find(r => r.id === action.payload.reportId) ?? state.selectedReport;
                if (report && report.id === action.payload.reportId) {
                    if (!report.comments) report.comments = [];
                    report.comments.push(action.payload);
                }
            })

            // assignReport
            .addCase(assignReport.fulfilled, (state, action: PayloadAction<TechnicianReport>) => {
                const idx = state.reports.findIndex(r => r.id === action.payload.id);
                if (idx !== -1) state.reports[idx] = action.payload;
                if (state.selectedReport?.id === action.payload.id) state.selectedReport = action.payload;
            });
    },
});

export const { clearSelectedReport, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
