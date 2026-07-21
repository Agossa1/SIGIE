import { IssueCategory } from "../../../../feature/reports/services/reports.types"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialPanel from "../TerritorialPanel"

const SharedRoadsPage = ({ folder }: { folder: string }) => (
  <RoleTerritorialPageShell folder={folder} pageId="roads">
    <TerritorialPanel
      folder={folder}
      category={IssueCategory.ROAD}
      intro={"État du réseau routier et points critiques (nids-de-poule, chaussées dégradées)."}
      demoItems={[{ id: "r1", title: "Nid-de-poule — axe principal", zone: "Centre", status: "Signalé" }]}
      relatedLinks={[{ pageId: "agentReports", label: "Signalements voirie" }]}
    >
      
    </TerritorialPanel>
  </RoleTerritorialPageShell>
)

export default SharedRoadsPage
