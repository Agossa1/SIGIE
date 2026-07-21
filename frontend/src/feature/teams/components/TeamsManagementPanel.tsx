import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { fetchPaginatedTeams, deleteTeam, createTeam } from "../services/teams.thunk";
import { selectAllTeams, selectTeamsLoading, selectTeamsError, selectTotalTeams } from "../services/teams.selectors";
import type { Team } from "../services/teams.types";
import { CreateTeamModal } from "./CreateTeamModal";
import { ManageTeamMembersModal } from "./ManageTeamMembersModal";
import type { CreateTeamDTO } from "../services/teams.types";
import RoleGuard from "../../auth/components/RoleGuard";
import { User_Role } from "../../auth/services/auth.types";
import { Loader2, Plus, Users, Trash2, UserCog, ChevronLeft, ChevronRight } from "lucide-react";

const statusConfig: Record<Team["status"], { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700" },
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  suspended: { label: "Suspendue", className: "bg-red-50 text-red-600" },
  disabled: { label: "Désactivée", className: "bg-gray-100 text-gray-400" },
};

export const TeamsManagementPanel = () => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectAllTeams);
  const totalTeams = useAppSelector(selectTotalTeams);
  const loading = useAppSelector(selectTeamsLoading);
  const error = useAppSelector(selectTeamsError);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchPaginatedTeams({ page, limit }));
  }, [dispatch, page, limit]);

  const handleCreateTeam = async (data: CreateTeamDTO) => {
    try {
      await dispatch(createTeam(data)).unwrap();
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create team", err);
      // L'erreur peut être gérée par le state Redux ou localement
      throw err;
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette brigade ?")) return;
    try {
      await dispatch(deleteTeam(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete team", err);
      alert("Erreur lors de la suppression de l'équipe.");
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Chargement des brigades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Brigades et Équipes
          </h3>
          <p className="text-sm text-gray-500 mt-1">Gérez les équipes d'intervention sur le terrain</p>
        </div>
        <RoleGuard allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN, User_Role.SUPERVISOR]}>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Brigade
          </button>
        </RoleGuard>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {teams.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-400">Aucune brigade enregistrée.</p>
          <RoleGuard allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN, User_Role.SUPERVISOR]}>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-3 text-sm text-emerald-600 font-medium hover:underline"
            >
              Créer la première brigade →
            </button>
          </RoleGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const status = statusConfig[team.status] ?? statusConfig.active;
            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-emerald-200 transition-colors group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{team.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-sm font-medium rounded-md ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <RoleGuard allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN, User_Role.SUPERVISOR]}>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      title="Supprimer la brigade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </RoleGuard>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-sm text-gray-500 mt-3">
                  {team.teamType && (
                    <p className="font-medium text-gray-600 capitalize">
                      {team.teamType.replace(/_/g, " ")}
                    </p>
                  )}
                  {team.description && (
                    <p className="line-clamp-2 text-gray-400">{team.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700">
                      {team.membersCount ?? 0} membre{(team.membersCount ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <RoleGuard allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN, User_Role.SUPERVISOR]}>
                    <button
                      onClick={() => setManagingTeam(team)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-medium"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      Gérer les membres
                    </button>
                  </RoleGuard>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalTeams > limit && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, totalTeams)} sur {totalTeams} équipes
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(totalTeams / limit), p + 1))}
              disabled={page >= Math.ceil(totalTeams / limit)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateTeamModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateTeam}
        />
      )}
      {managingTeam && (
        <ManageTeamMembersModal
          team={managingTeam}
          onClose={() => setManagingTeam(null)}
        />
      )}
    </div>
  );
};
