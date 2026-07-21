import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { fetchReports } from "../../reports/services/reports.thunk";
import { selectAllReports } from "../../reports/services/reports.selectors";
import { fetchMissions } from "../../missions/services/missions.thunk";
import { selectAllMissions } from "../../missions/services/missions.selectors";
import { teamsApi } from "../../teams/services/teams.api";
import { FieldReportStatus, IssueCategory } from "../../reports/services/reports.types";
import type { Team } from "../../teams/services/teams.types";

export const useAdminDashboardData = () => {
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectAllReports) ?? [];
  const missions = useAppSelector(selectAllMissions) ?? [];
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    dispatch(fetchReports()).catch(() => {});
    dispatch(fetchMissions()).catch(() => {});
    teamsApi.getAllTeams().then(setTeams).catch(() => {});
  }, [dispatch]);

  const stats = useMemo(() => {
    const activeReports = reports.filter((r) =>
      [FieldReportStatus.SUBMITTED, FieldReportStatus.ASSIGNED, FieldReportStatus.IN_PROGRESS].includes(r.status)
    ).length;

    const inProgressMissions = missions.filter((m) => m.status === "in_progress" || m.status === "assigned").length;
    const completedMissions = missions.filter((m) => m.status === "completed").length;

    const floodingReports = reports.filter(
      (r) =>
        [FieldReportStatus.SUBMITTED, FieldReportStatus.ASSIGNED].includes(r.status) &&
        r.issueCategory === IssueCategory.FLOODING
    ).length;

    const activeTeams = teams.filter((t) => t.status === "active").length;

    const resolvedWaste = reports.filter(
      (r) =>
        [FieldReportStatus.RESOLVED, FieldReportStatus.VALIDATED].includes(r.status) &&
        r.issueCategory === IssueCategory.WASTE
    ).length;

    const byCategory = (cat: IssueCategory) => reports.filter((r) => r.issueCategory === cat).length;

    return {
      activeReports,
      inProgressMissions,
      completedMissions,
      floodingReports,
      activeTeams,
      totalTeams: teams.length,
      resolvedWaste,
      reportsByCategory: {
        waste: byCategory(IssueCategory.WASTE),
        drainage: byCategory(IssueCategory.DRAINAGE),
        road: byCategory(IssueCategory.ROAD),
        other: byCategory(IssueCategory.OTHER),
      },
      totalReports: reports.length,
      reports,
      missions,
    };

  }, [reports, missions, teams]);

  return { stats };
};
