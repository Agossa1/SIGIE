import TerritorialMap from "../../../feature/territory/components/TerritorialMap"
import { presetForFolder, type TerritorialMapPreset } from "../../../feature/territory/services/mapLayerPresets"
import type { IncidentPin, MissionPin, TeamLocation } from "../../../components/map/UnifiedMap"

interface TerritorialGisMapSectionProps {
  folder: string
  preset?: TerritorialMapPreset
  footnote?: string
  title?: string
  teamsData?: TeamLocation[]
  /** Données des signalements à afficher sur la carte */
  incidentsData?: IncidentPin[]
  /** Données des missions à afficher sur la carte */
  missionsData?: MissionPin[]
}

const FOOTNOTES: Record<string, string> = {
  mayor:
    "Carte SIG communal — communes, arrondissements et quartiers de votre périmètre. Zoomez pour le détail.",
  prefecture:
    "Carte SIG départementale — région, arrondissements et quartiers. Zoomez pour le détail.",
  ministry:
    "Carte SIG nationale — régions et communes. Zoomez pour afficher arrondissements et quartiers si disponibles.",
  dst: "Carte SIG — périmètre communal DST. Contour bleu : limite de votre rattachement.",
  sgds: "Carte SIG — périmètre communal SGDS. Contour bleu : limite de votre rattachement.",
  techniciens:
    "Carte SIG — communes, arrondissements et quartiers de votre commune.",
  supervisor:
    "Carte SIG — communes, arrondissements et quartiers de votre zone.",
  teamLeader:
    "Carte SIG — communes, arrondissements et quartiers de votre brigade.",
}

const TerritorialGisMapSection = ({
  folder,
  preset: presetOverride,
  footnote,
  title,
  teamsData,
  incidentsData,
  missionsData,
}: TerritorialGisMapSectionProps) => {
  const preset = presetOverride ?? presetForFolder(folder)

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 overflow-hidden min-h-[420px]">
        <TerritorialMap
          preset={preset}
          height="420px"
          title={title ?? "Cartographie territoriale (SIG)"}
          showInfraLayers={true}
          teamsData={teamsData}
          incidentsData={incidentsData}
          missionsData={missionsData}
        />
      </div>
      <p className="text-sm text-gray-500 font-medium px-1">
        {footnote ?? FOOTNOTES[folder] ?? "Couches territoriales selon votre périmètre."}
      </p>
    </div>
  )
}

export default TerritorialGisMapSection
