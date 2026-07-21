import { IssueCategory } from "../../../../feature/reports/services/reports.types"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialPanel from "../TerritorialPanel"

const SharedAlertsPage = ({ folder }: { folder: string }) => (
  <RoleTerritorialPageShell folder={folder} pageId="alerts">
    <TerritorialPanel
      folder={folder}
      category={IssueCategory.FLOODING}
      intro={"Alertes météo, hydrologiques et risques climatiques."}
      demoItems={[]}
      relatedLinks={[{ pageId: "gisMap", label: "Zones à risque" }, { pageId: "infrastructure", label: "Ouvrages & canaux" }]}
    >
      
      <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Alertes actives (aperçu)</h3>
        <ul className="space-y-2">
          {[
            { id: "a1", label: "Risque de crue — zone littorale", level: "Élevé", date: "22 mai 2026" },
            { id: "a2", label: "Pluies intenses prévues", level: "Vigilance", date: "22 mai 2026" },
          ].map((a) => (
            <li key={a.id} className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <p className="text-sm font-medium text-gray-900">{a.label}</p>
              <div className="flex justify-between mt-1">
                <span className="text-sm font-medium text-sky-700">{a.level}</span>
                <span className="text-sm text-gray-400">{a.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </TerritorialPanel>
  </RoleTerritorialPageShell>
)

export default SharedAlertsPage
