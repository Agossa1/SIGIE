import { getRoleFolderByFolder } from "../shared/rolePages.config"
import RoleTerritorialDashboard from "../shared/territorial/RoleTerritorialDashboard"

const config = getRoleFolderByFolder("mayor")
if (!config) throw new Error("Config manquante: mayor")

const MayorDashboardPage = () => (
  <RoleTerritorialDashboard config={config} defaultUserTitle={"Maire"} />
)

export default MayorDashboardPage
