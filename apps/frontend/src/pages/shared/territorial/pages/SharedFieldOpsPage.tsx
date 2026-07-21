import RoleTerritorialPageShell from "../RoleTerritorialPageShell";
import { FieldOpsDashboard } from "./FieldOpsDashboard";

const SharedFieldOpsPage = ({ folder }: { folder: string }) => {
  return (
    <RoleTerritorialPageShell folder={folder} pageId="fieldOps">
      <FieldOpsDashboard />
    </RoleTerritorialPageShell>
  );
};

export default SharedFieldOpsPage;
