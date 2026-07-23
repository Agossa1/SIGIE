import { useEffect, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { fetchReports } from "../../../feature/reports/services/reports.thunk"
import {
  selectAllReports,
  selectReportsError,
  selectReportsLoading,
} from "../../../feature/reports/services/reports.selectors"
import { FieldReportStatus, IssueCategory } from "../../../feature/reports/services/reports.types"

export function useTerritorialReports() {
  const dispatch = useAppDispatch()
  const reports = useAppSelector(selectAllReports) ?? []
  const isLoading = useAppSelector(selectReportsLoading)
  const error = useAppSelector(selectReportsError)

  useEffect(() => {
    dispatch(fetchReports())
  }, [dispatch])

  const stats = useMemo(() => {
    const pending = reports.filter((r) =>
      [FieldReportStatus.SUBMITTED, FieldReportStatus.ASSIGNED, FieldReportStatus.IN_PROGRESS].includes(
        r.status
      )
    ).length
    const resolved = reports.filter((r) =>
      [FieldReportStatus.RESOLVED, FieldReportStatus.VALIDATED].includes(r.status)
    ).length
    const urgent = reports.filter(
      (r) =>
        [FieldReportStatus.SUBMITTED, FieldReportStatus.ASSIGNED].includes(r.status) &&
        [IssueCategory.FLOODING, IssueCategory.ROAD].includes(r.issueCategory as IssueCategory)
    ).length

    const byCategory = (cat: IssueCategory) =>
      reports.filter((r) => r.issueCategory === cat).length

    const activeZones = new Set(reports.map(r => r.neighborhoodId).filter(Boolean)).size
    const activeTeams = new Set(reports.map(r => r.assignedTo).filter(Boolean)).size

    return {
      total: reports.length,
      pending,
      resolved,
      urgent,
      activeZones,
      activeTeams,
      drainage: byCategory(IssueCategory.DRAINAGE),
      waste: byCategory(IssueCategory.WASTE),
      road: byCategory(IssueCategory.ROAD),
      flooding: byCategory(IssueCategory.FLOODING),
    }
  }, [reports])

  const refresh = () => dispatch(fetchReports())

  return { reports, isLoading, error, stats, refresh }
}
