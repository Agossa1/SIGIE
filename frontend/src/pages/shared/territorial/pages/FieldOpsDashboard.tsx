import { useState } from "react";
import { MissionsDashboard } from "../../../../feature/missions/components/MissionsDashboard";
import { TeamsManagementPanel } from "../../../../feature/teams/components/TeamsManagementPanel";

export const FieldOpsDashboard = () => {
  const [activeTab, setActiveTab] = useState<"missions" | "teams">("missions");

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="flex border-b border-gray-100 px-2">
          <button
            onClick={() => setActiveTab("missions")}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "missions"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Missions & Planification
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "teams"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Équipes & Brigades
          </button>
        </div>
      </div>

      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === "missions" ? <MissionsDashboard /> : <TeamsManagementPanel />}
      </div>
    </div>
  );
};
