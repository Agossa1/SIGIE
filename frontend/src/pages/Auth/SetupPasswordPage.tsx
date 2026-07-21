import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { authApi } from "../../feature/auth/services/auth.api"
import { api } from "../../lib/apiClient"

const SetupPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") || ""
  const token = searchParams.get("token") || ""

  const [step, setStep] = useState<"VERIFY" | "SETUP">("VERIFY")
  
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!email || !token) {
      navigate("/login")
    }
  }, [email, token, navigate])

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await authApi.verifyOtp({ email, code: otp })
      setStep("SETUP")
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la vérification du code OTP.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.")
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post<{ success: boolean; message: string }>("/password/setup-password", {
        email,
        token,
        newPassword
      })
      setSuccess(res.message)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de la configuration du mot de passe.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/40 flex items-center justify-center p-4 relative overflow-hidden antialiased">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-75 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden z-10 relative flex flex-col">
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#008751]" />
          <div className="flex-1 bg-[#FFD000]" />
          <div className="flex-1 bg-[#E8112d]" />
        </div>

        <div className="p-8 sm:p-10 flex flex-col">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-full bg-black border-2 border-[#008751] flex items-center justify-center font-medium text-white text-sm shrink-0 shadow-sm">H</div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-black leading-none">HSE TERRA</span>
              <span className="text-sm font-medium text-gray-400 mt-1 leading-none">Supervision État - République du Bénin</span>
            </div>
          </div>

          <div className="text-left space-y-1 mb-8">
            <h1 className="text-xl font-medium text-black">
              {step === "VERIFY" ? "Vérification du compte" : "Nouveau mot de passe"}
            </h1>
            <p className="text-sm text-gray-400 font-semibold">
              {step === "VERIFY" 
                ? `Saisissez le code de sécurité (OTP) reçu par email pour valider le compte ${email}.`
                : "Afin de sécuriser votre compte récemment vérifié, veuillez définir un mot de passe personnel."}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-medium text-rose-700 text-left leading-relaxed">{error}</div>
            </div>
          )}

          {success ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-medium text-emerald-700 text-center leading-relaxed">{success}</div>
              <p className="text-sm text-emerald-600 mt-2">Redirection vers la connexion en cours...</p>
            </div>
          ) : step === "VERIFY" ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2 text-left">
                <label htmlFor="otp" className="text-sm font-medium text-gray-700 block">Code de vérification (OTP)</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm text-center text-gray-700 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? "Vérification..." : "Vérifier le compte"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetupPassword} className="space-y-5">
              <div className="space-y-2 text-left">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 block">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2 text-left">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">Confirmer le mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer et terminer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SetupPasswordPage
