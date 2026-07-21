import LoadingSpinner from "./LoadingSpinner"

interface SelectLoadingStateProps {
  label: string
  required?: boolean
}

/** Placeholder discret pendant le chargement d'un select territorial */
const SelectLoadingState = ({ label, required }: SelectLoadingStateProps) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between gap-2">
      <span>
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <LoadingSpinner size="xs" variant="muted" />
    </span>
    <div className="w-full border border-gray-100 bg-gray-50/80 rounded-lg px-4 py-3 flex items-center gap-2">
      <div className="h-3 flex-1 max-w-[120px] rounded bg-gray-200/60 animate-pulse" />
    </div>
  </label>
)

export default SelectLoadingState
