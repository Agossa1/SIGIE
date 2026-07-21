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
    { search: 'action: PayloadAction<{ user: User }>', replace: 'action: any' }
]);

// 3. InterventionsTraceability.tsx
replaceInFile('src/feature/interventions/components/InterventionsTraceability.tsx', [
    { search: 'intervention.completionPercentage', replace: '(intervention as any).completionPercentage' }
]);

// 4. reports.rtk.ts
replaceInFile('src/feature/reports/services/reports.rtk.ts', [
    { search: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats } from "./reports.types";', replace: 'import type { Report, CreateReportDTO, UpdateReportDTO, ReportStats, ReportFilters } from "./reports.types";' },
    { search: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n} from "./reports.types";', replace: 'import type {\n    Report,\n    CreateReportDTO,\n    UpdateReportDTO,\n    ReportStats,\n    ReportFilters\n} from "./reports.types";' }
]);

// 5. ManageTeamMembersModal.tsx
replaceInFile('src/feature/teams/components/ManageTeamMembersModal.tsx', [
    { search: 'import { UserMinus, Users } from "lucide-react";', replace: 'import { X, Loader2, UserMinus, Users, Search } from "lucide-react";' }
]);

// 6. useTerritoryCascade.ts
replaceInFile('src/feature/territory/hooks/useTerritoryCascade.ts', [
    { search: '    TerritoryDistrict,\n', replace: '' },
    { search: '    TerritoryMunicipality,\n', replace: '' },
    { search: '    TerritoryNeighborhood,\n', replace: '' },
    { search: '    TerritoryRegion,\n', replace: '' },
    { search: 'import type { TerritoryFormLabels } from "../../feature/territory/services/territory.types";\n', replace: '' },
    { search: 'import type { TerritoryFormLabels, TerritoryFormValues } from "../../feature/territory/services/territory.types";', replace: 'import type { TerritoryFormValues } from "../../feature/territory/services/territory.types";' }
]);

// 7. RoleEditModal.tsx
replaceInFile('src/pages/adminPages/RoleEditModal.tsx', [
    { search: 'export interface RoleEditModalProps {\n  isOpen?: boolean;\n  isOpen?: boolean;', replace: 'export interface RoleEditModalProps {\n  isOpen?: boolean;' } // just in case
]);

// 8. SignalementsMapPage.tsx
replaceInFile('src/pages/Reports/SignalementsMapPage.tsx', [
    { search: 'import type { TerritoryFormLabels } from "../../feature/territory/services/territory.types";\ntype TerritoryFormLabels = any;', replace: 'type TerritoryFormLabels = any;' }
]);

// 9. TerritorialReportsList.tsx
replaceInFile('src/pages/shared/territorial/TerritorialReportsList.tsx', [
    { search: 'updateReportStatus({ id: selectedReport.id, status: newStatus })', replace: 'updateReportStatus({ id: selectedReport.id, data: { status: newStatus } })' }
]);

console.log("Replacements pass 3 complete.");
