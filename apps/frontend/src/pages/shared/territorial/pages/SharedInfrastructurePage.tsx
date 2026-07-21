import { IssueCategory } from "../../../../feature/reports/services/reports.types"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialPanel from "../TerritorialPanel"

const SharedInfrastructurePage = ({ folder }: { folder: string }) => (
  <RoleTerritorialPageShell folder={folder} pageId="infrastructure">
    <TerritorialPanel
      folder={folder}
      category={IssueCategory.DRAINAGE}
      intro={"Inventaire et état des ouvrages hydrauliques, canaux et points de drainage sur le périmètre."}
      demoItems={[{ id: "i1", title: "Canal principal — curage", zone: "Zone est", status: "Planifié" }]}
      relatedLinks={[{ pageId: "gisMap", label: "Cartographie SIG" }]}
    >
      
    </TerritorialPanel>
  </RoleTerritorialPageShell>
)

export default SharedInfrastructurePage
