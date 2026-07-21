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

// 1. InterventionsDashboard.tsx
replaceInFile('src/feature/interventions/components/InterventionsDashboard.tsx', [
    { search: 'useGetReportByIdQuery', replace: '/* useGetReportByIdQuery */' }
]);

// 2. interventions.rtk.ts
replaceInFile('src/feature/interventions/services/interventions.rtk.ts', [
    { search: 'teamName?: string;\n    completionPercentage?: number;\n    completionPercentage?: number;', replace: 'teamName?: string;\n    completionPercentage?: number;' }
]);

// 3. reports.rtk.ts
// We'll just replace the type imports
replaceInFile('src/feature/reports/services/reports.rtk.ts', [
    { search: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats } from "./reports.types";', replace: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats, ReportFilters } from "./reports.types";' },
    { search: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n} from "./reports.types";', replace: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n    ReportFilters\n} from "./reports.types";' }
]);
replaceInFile('src/feature/reports/services/reports.types.ts', [
    // ensuring it exists
    { search: 'export interface ReportFilters {\n    status?: string;\n    categoryId?: string;\n    municipalityId?: string;\n    dateFrom?: string;\n    dateTo?: string;\n}\n\nexport interface ReportFilters', replace: 'export interface ReportFilters' }
]);

// 4. ManageTeamMembersModal.tsx
replaceInFile('src/feature/teams/components/ManageTeamMembersModal.tsx', [
    { search: 'import { UserMinus, Users } from "lucide-react";', replace: 'import { X, Loader2, UserMinus, Users, Search } from "lucide-react";' }
]);

// 5. teams.rtk.ts
replaceInFile('src/feature/teams/services/teams.rtk.ts', [
    { search: 'import type { Team, CreateTeamDTO, UpdateTeamDTO } from "./teams.types";', replace: 'import type { Team, CreateTeamDTO, UpdateTeamDTO, TeamMember } from "./teams.types";' },
    { search: '(_result, _error, teamId)', replace: '(_result, _error, _teamId)' },
    { search: 'import type { Team, CreateTeamDTO, UpdateTeamDTO, TeamMember } from "./teams.types";\nimport type { Team, CreateTeamDTO, UpdateTeamDTO, TeamMember } from "./teams.types";', replace: 'import type { Team, CreateTeamDTO, UpdateTeamDTO, TeamMember } from "./teams.types";' }
]);

// 6. useTerritoryCascade.ts
replaceInFile('src/feature/territory/hooks/useTerritoryCascade.ts', [
    { search: 'import type {\n    TerritoryDistrict,\n    TerritoryMunicipality,\n    TerritoryNeighborhood,\n    TerritoryRegion,\n    TerritoryFormValues,\n} from "../services/territory.types";', replace: 'import type {\n    TerritoryFormValues,\n} from "../services/territory.types";' },
    { search: 'import type {\n    TerritoryDistrict,\n    TerritoryMunicipality,\n    TerritoryNeighborhood,\n    TerritoryRegion,\n    TerritoryFormLabels,\n    TerritoryFormValues,\n} from "../services/territory.types";', replace: 'import type {\n    TerritoryFormValues,\n} from "../services/territory.types";' }
]);

// 7. RoleEditModal.tsx
replaceInFile('src/pages/adminPages/RoleEditModal.tsx', [
    { search: 'export interface RoleEditModalProps {\n  isOpen?: boolean;\n    role: RoleRecord;', replace: 'export interface RoleEditModalProps {\n  isOpen?: boolean;\n  role: RoleRecord;' },
    { search: 'export interface RoleEditModalProps {\n    role: RoleRecord;', replace: 'export interface RoleEditModalProps {\n  isOpen?: boolean;\n  role: RoleRecord;' }
]);

// 8. SignalementsMapPage.tsx
replaceInFile('src/pages/Reports/SignalementsMapPage.tsx', [
    { search: 'import {\n  useTerritoryCascade,\n  useTerritoryMapScope,\n} from "../../feature/territory/hooks/useTerritoryCascade";', replace: 'import {\n  useTerritoryCascade,\n} from "../../feature/territory/hooks/useTerritoryCascade";' },
    { search: 'const TERRITORY_LAYER_CONFIG', replace: '// const TERRITORY_LAYER_CONFIG' },
    { search: 'type TerritoryFormLabels = any;\nimport type { TerritoryFormValues } from "../../feature/territory/services/territory.types";\ntype TerritoryFormLabels = any;', replace: 'type TerritoryFormLabels = any;\nimport type { TerritoryFormValues } from "../../feature/territory/services/territory.types";' }
]);

// 9. TerritorialReportsList.tsx
replaceInFile('src/pages/shared/territorial/TerritorialReportsList.tsx', [
    { search: 'updateReportStatus({ id: selectedReport.id, status: newStatus })', replace: 'updateReportStatus({ id: selectedReport.id, data: { status: newStatus } })' }
]);

console.log("Replacements pass 4 complete.");
