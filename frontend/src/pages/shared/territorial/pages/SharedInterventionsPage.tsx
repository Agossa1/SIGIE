import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import { InterventionsDashboard } from "../../../../feature/interventions/components/InterventionsDashboard"

const SharedInterventionsPage = ({ folder }: { folder: string }) => {
  return (
    <RoleTerritorialPageShell folder={folder} pageId="interventions">
      <InterventionsDashboard />
    </RoleTerritorialPageShell>
  )
}

export default SharedInterventionsPage
