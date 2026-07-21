/** Couleurs — Lisière tricolore République du Bénin */
export const BENIN_FLAG = {
  green: "#008751",
  yellow: "#FFD400",
  red: "#E8112d",
} as const

type BeninFlagBarSize = "sm" | "md" | "lg"

interface BeninFlagBarProps {
  size?: BeninFlagBarSize
  className?: string
  withShadow?: boolean
  /** Accent visuel uniquement (pas d’étiquette ARIA dupliquée) */
  decorative?: boolean
}

const heightBySize: Record<BeninFlagBarSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
}

/**
 * Bandeau tricolore horizontal : vert | jaune | rouge (pleine largeur).
 */
const BeninFlagBar = ({
  size = "md",
  className = "",
  withShadow = true,
  decorative = false,
}: BeninFlagBarProps) => (
  <div
    className={`w-full flex shrink-0 ${heightBySize[size]} ${withShadow ? "shadow-sm" : ""} ${className}`.trim()}
    {...(decorative
      ? { "aria-hidden": true }
      : { role: "img", "aria-label": "Lisière tricolore — République du Bénin" })}
  >
    <div className="flex-1 h-full" style={{ backgroundColor: BENIN_FLAG.green }} />
    <div className="flex-1 h-full" style={{ backgroundColor: BENIN_FLAG.yellow }} />
    <div className="flex-1 h-full" style={{ backgroundColor: BENIN_FLAG.red }} />
  </div>
)

export default BeninFlagBar
