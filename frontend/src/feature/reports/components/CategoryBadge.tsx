import { getCategoryConfig } from "../hooks/useReportCategories";

interface CategoryBadgeProps {
    category: string;
}

/**
 * Badge de catégorie — utilise les catégories chargées dynamiquement depuis l'API.
 * Affiche l'icône et le label configurés dans la table report_categories.
 */
export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
    const cfg = getCategoryConfig(category);

    // Construire une classe CSS à partir de la couleur (teinte de fond)
    // const bgClass = `bg-[${cfg.color}]/10`;
    // const textClass = `text-[${cfg.color}]`;

    // Utiliser un style inline pour la couleur (plus fiable que les classes Tailwind dynamiques)
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold border"
            style={{
                backgroundColor: `${cfg.color}15`,
                color: cfg.color,
                borderColor: `${cfg.color}30`,
            }}
        >
            <span>{cfg.icon}</span>
            {cfg.label}
        </span>
    );
};
