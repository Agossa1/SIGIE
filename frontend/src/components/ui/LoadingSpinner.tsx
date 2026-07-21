type SpinnerSize = "xs" | "sm" | "md" | "lg"
type SpinnerVariant = "default" | "muted" | "onDark"

interface LoadingSpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-3.5 w-3.5 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
}

const variantClasses: Record<SpinnerVariant, string> = {
  default: "border-gray-200/90 border-t-emerald-600",
  muted: "border-gray-100 border-t-gray-400",
  onDark: "border-white/25 border-t-white",
}

const LoadingSpinner = ({
  size = "md",
  variant = "default",
  label,
  className = "",
}: LoadingSpinnerProps) => (
  <span
    className={`inline-flex items-center gap-2 ${className}`.trim()}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span
      className={`inline-block shrink-0 rounded-full animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
      aria-hidden="true"
    />
    {label && (
      <span className="text-sm font-medium text-gray-500">{label}</span>
    )}
  </span>
)

export default LoadingSpinner
