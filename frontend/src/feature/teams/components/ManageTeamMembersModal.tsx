import React, { useState, useEffect, useCallback } from "react";
import {
  UserMinus, Users, X, Loader2, Search
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { fetchUsers } from "../../users/services/users.thunk";
import { selectAllUsers } from "../../users/services/users.selectors";
import { selectTeamMembers } from "../services/teams.selectors";
import { fetchTeamMembers, addTeamMember, removeTeamMember } from "../services/teams.thunk";
import type { Team } from "../services/teams.types";

interface ManageTeamMembersModalProps {
  team: Team;
  onClose: () => void;
}

export const ManageTeamMembersModal: React.FC<ManageTeamMembersModalProps> = ({
  team,
  onClose,
}) => {
  const members = useAppSelector(selectTeamMembers(team.id));
  const dispatch = useAppDispatch();
  const allUsersRaw = useAppSelector(selectAllUsers);
  const allUsers = allUsersRaw.filter(u => !u.roles.includes("SUPER_ADMIN"));
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"members" | "add">("members");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      await dispatch(fetchTeamMembers(team.id)).unwrap();
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoadingData(false);
    }
  }, [team.id, dispatch]);

  useEffect(() => {
    dispatch(fetchUsers());
    fetchData();
  }, [fetchData, dispatch]);

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Retirer ce membre de la brigade ?")) return;
    try {
      setActionLoading(userId);
      await dispatch(removeTeamMember({ teamId: team.id, userId })).unwrap();
      await fetchData();
    } catch {
      alert("Erreur lors du retrait du membre.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdd = async (userId: string, role: string) => {
    try {
      setActionLoading(userId);
      await dispatch(addTeamMember({ teamId: team.id, userId, role })).unwrap();
      await fetchData();
    } catch {
      alert("Erreur lors de l'ajout du membre.");
    } finally {
      setActionLoading(null);
    }
  };

  const memberIds = new Set(members.map(m => m.user_id));

  // Users that are not yet members
  const nonMembers = allUsers.filter(
    u => !memberIds.has(u.id) &&
      (search === "" ||
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Membres de la brigade</h2>
            <p className="text-sm text-gray-500 mt-0.5">{team.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {(["members", "add"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-emerald-700 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "members"
                ? `Membres actuels (${members.length})`
                : "Ajouter des membres"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : tab === "members" ? (
            // ── Current Members ──
            members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun membre dans cette brigade.</p>
                <button
                  onClick={() => setTab("add")}
                  className="mt-3 text-sm text-emerald-600 font-medium hover:underline"
                >
                  Ajouter des membres →
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {members.map(member => (
                  <li
                    key={member.user_id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-sm shrink-0">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {member.first_name} {member.last_name}
                          {member.role_in_team === 'leader' && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                              Chef d'équipe
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      disabled={actionLoading === member.user_id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading === member.user_id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <UserMinus className="w-3.5 h-3.5" />}
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            // ── Add Members ──
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>

              {nonMembers.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">
                  {search ? "Aucun résultat trouvé." : "Tous les utilisateurs sont déjà membres."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {nonMembers.map(user => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold text-sm shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdd(user.id, 'member')}
                          disabled={actionLoading === user.id}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                        >
                          + Membre
                        </button>
                        <button
                          onClick={() => handleAdd(user.id, 'leader')}
                          disabled={actionLoading === user.id}
                          className="px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                        >
                          + Chef
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
