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
      
      <section className="bg-white border border-gray-200 rounded overflow-hidden  ">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Alertes actives (aperçu)</h3>
        </div>
        <ul className="divide-y divide-gray-50">
          {[
            { id: "a1", label: "Risque de crue — zone littorale", level: "Élevé", date: "22 mai 2026" },
            { id: "a2", label: "Pluies intenses prévues", level: "Vigilance", date: "22 mai 2026" },
          ].map((a) => (
            <li key={a.id} className="p-4 sm:px-5 sm:py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{a.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{a.date}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${a.level === 'Élevé' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {a.level}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </TerritorialPanel>
  </RoleTerritorialPageShell>
)

export default SharedAlertsPage
