const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join('/Volumes/Livebenin/Dev/SIGIE/apps/frontend', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    for (const { search, replace } of replacements) {
        content = content.split(search).join(replace);
    }
    
    if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${filePath}`);
    }
}

// 1. auth.slice.ts
replaceInFile('src/feature/auth/services/auth.slice.ts', [
    { search: '.addCase(refreshTokenThunk.fulfilled, (state, action: any) => {', replace: '.addCase(refreshTokenThunk.fulfilled, (state, action) => {' }
]);

// 2. InterventionsDashboard.tsx
replaceInFile('src/feature/interventions/components/InterventionsDashboard.tsx', [
    { search: 'const linkedReportQuery = useGetReportByIdQuery(', replace: '// const linkedReportQuery = useGetReportByIdQuery(' }
]);

// 3. InterventionsTraceability.tsx
replaceInFile('src/feature/interventions/components/InterventionsTraceability.tsx', [
    { search: 'completionPercentage', replace: 'completionPercentage' } // we will add this in interventions.rtk.ts
]);

replaceInFile('src/feature/interventions/services/interventions.rtk.ts', [
    { search: 'teamName?: string;', replace: 'teamName?: string;\n    completionPercentage?: number;' }
]);

// 4. reports.rtk.ts
replaceInFile('src/feature/reports/services/reports.rtk.ts', [
    { search: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n} from "./reports.types";', replace: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n    ReportFilters,\n} from "./reports.types";' },
    { search: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats } from "./reports.types";', replace: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats, ReportFilters } from "./reports.types";' },
    { search: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats, ReportFilters } from "./reports.types";', replace: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats, ReportFilters } from "./reports.types";' }
]);
replaceInFile('src/feature/reports/services/reports.types.ts', [
    { search: 'export interface ReportStats', replace: 'export interface ReportFilters {\n    status?: string;\n    categoryId?: string;\n    municipalityId?: string;\n    dateFrom?: string;\n    dateTo?: string;\n}\n\nexport interface ReportStats' }
]);

// 5. ManageTeamMembersModal.tsx
replaceInFile('src/feature/teams/components/ManageTeamMembersModal.tsx', [
    { search: 'import { UserMinus, Users } from "lucide-react";', replace: 'import { X, Loader2, UserMinus, Users, Search } from "lucide-react";' }
]);

// 6. teams.rtk.ts
replaceInFile('src/feature/teams/services/teams.types.ts', [
    { search: 'export interface Team {', replace: 'export interface TeamMember {\n    id: string;\n    userId: string;\n    teamId: string;\n    role: string;\n    joinedAt: string;\n    user?: { firstName: string; lastName: string; email: string };\n}\n\nexport interface Team {' }
]);
replaceInFile('src/feature/teams/services/teams.rtk.ts', [
    { search: 'import type { Team, CreateTeamDTO, UpdateTeamDTO } from "./teams.types";', replace: 'import type { Team, CreateTeamDTO, UpdateTeamDTO, TeamMember } from "./teams.types";' },
    { search: 'providesTags: (_result, _error, teamId) =>', replace: 'providesTags: (result, _error, teamId) =>' }
]);

// 7. useTerritoryCascade.ts
replaceInFile('src/feature/territory/hooks/useTerritoryCascade.ts', [
    { search: 'import type {\n    TerritoryFormValues,\n} from "../services/territory.types";', replace: 'import type {\n    TerritoryFormValues,\n} from "../services/territory.types";\n' }
]);

// 8. RolesPage.tsx
replaceInFile('src/pages/adminPages/RolesPage.tsx', [
    { search: 'getPageLabel,', replace: '' }
]);
replaceInFile('src/pages/adminPages/RoleEditModal.tsx', [
    { search: 'export interface RoleEditModalProps {\n    role: RoleRecord;', replace: 'export interface RoleEditModalProps {\n    isOpen?: boolean;\n    role: RoleRecord;' }
]);

// 9. SignalementsMapPage.tsx
replaceInFile('src/pages/Reports/SignalementsMapPage.tsx', [
    { search: 'import {\n  useTerritoryCascade,\n  useTerritoryMapScope,\n} from "../../feature/territory/hooks/useTerritoryCascade";', replace: 'import {\n  useTerritoryCascade,\n} from "../../feature/territory/hooks/useTerritoryCascade";' },
    { search: 'import type { TerritoryFormValues } from "../../feature/territory/services/territory.types";', replace: 'import type { TerritoryFormValues } from "../../feature/territory/services/territory.types";\ntype TerritoryFormLabels = any;' }
]);

// 10. TerritorialReportsList.tsx
replaceInFile('src/pages/shared/territorial/TerritorialReportsList.tsx', [
    { search: 'updateReportStatus({ id: selectedReport.id, status: newStatus })', replace: 'updateReportStatus({ id: selectedReport.id, data: { status: newStatus } })' }
]);

console.log("Replacements pass 2 complete.");
