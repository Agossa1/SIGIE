import { IssueCategory } from "../../../../feature/reports/services/reports.types"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialPanel from "../TerritorialPanel"

const SharedSanitationPage = ({ folder }: { folder: string }) => (
  <RoleTerritorialPageShell folder={folder} pageId="sanitation">
    <TerritorialPanel
      folder={folder}
      category={IssueCategory.WASTE}
      intro={"Suivi des collectes, dépôts sauvages et zones insalubres."}
      demoItems={[{ id: "s1", title: "Dépôt sauvage", zone: "Quartier nord", status: "Assigné" }]}
      relatedLinks={[{ pageId: "agentReports", label: "Signalements salubrité" }]}
    >
      
    </TerritorialPanel>
  </RoleTerritorialPageShell>
)

export default SharedSanitationPage
