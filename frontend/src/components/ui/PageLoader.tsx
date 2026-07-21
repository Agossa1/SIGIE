import BeninFlagBar from "./BeninFlagBar"
import LoadingSpinner from "./LoadingSpinner"

interface PageLoaderProps {
  message?: string
  submessage?: string
}

const PageLoader = ({
  message = "Chargement en cours",
  submessage,
}: PageLoaderProps) => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
    <BeninFlagBar size="lg" className="w-full shrink-0" />

    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm ring-4 ring-emerald-600/10">
            <span className="text-lg font-medium text-white">H</span>
          </div>
          <BeninFlagBar
            size="sm"
            decorative
            withShadow={false}
            className="w-12 rounded-md overflow-hidden"
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">HSE TERRA</p>
          <p className="text-sm font-semibold text-gray-400">
            République du Bénin
          </p>
        </div>

        <LoadingSpinner size="md" label={message} />

        {submessage && (
          <p className="text-sm text-gray-400 font-medium leading-relaxed">{submessage}</p>
        )}
      </div>
    </div>
  </div>
)

export default PageLoader
