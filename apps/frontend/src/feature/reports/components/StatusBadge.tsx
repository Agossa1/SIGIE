import { FieldReportStatus } from "../services/reports.types";

interface StatusBadgeProps {
    status: FieldReportStatus | string;
}

const config: Record<FieldReportStatus, { label: string; className: string }> = {
    [FieldReportStatus.DRAFT]:       { label: "Brouillon",  className: "bg-gray-100 text-gray-600 border border-gray-200" },
    [FieldReportStatus.SUBMITTED]:   { label: "Soumis",     className: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
    [FieldReportStatus.ASSIGNED]:    { label: "Assigné",    className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    [FieldReportStatus.IN_PROGRESS]: { label: "En cours",   className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    [FieldReportStatus.RESOLVED]:    { label: "Résolu",     className: "bg-emerald-600 text-white border border-emerald-600" },
    [FieldReportStatus.VALIDATED]:   { label: "Validé",     className: "bg-emerald-700 text-white border border-emerald-700" },
    [FieldReportStatus.REJECTED]:    { label: "Rejeté",     className: "bg-gray-800 text-white border border-gray-800" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const cfg = config[status as FieldReportStatus];
    if (!cfg) {
        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold bg-gray-100 text-gray-600">
                {status}
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold ${cfg.className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {cfg.label}
        </span>
    );
};
