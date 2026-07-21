import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { selectPasswordLoading, selectPasswordError } from "../../password/services/password.selectors"
import { clearPasswordState } from "../../password/services/password.slice"

const VerifyAccountForms = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isLoading = useAppSelector(selectPasswordLoading)
  const error = useAppSelector(selectPasswordError)

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // Redirection de sécurité si aucun email n'est fourni
      navigate("/forgot-password")
    }
    
    return () => {
      dispatch(clearPasswordState())
    }
  }, [location.state, navigate, dispatch])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(clearPasswordState())
    
    // On passe l'email et l'OTP à l'étape suivante
    navigate("/reset-password", { state: { email, otp } })
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
            <h1 className="text-xl font-medium text-black">Vérification du code</h1>
            <p className="text-sm text-gray-400 font-semibold">Saisissez le code de sécurité OTP envoyé à l'adresse <span className="text-gray-700 font-medium">{email}</span>.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-medium text-rose-700 text-left leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700 block">Code de sécurité (OTP)</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 text-sm  text-gray-700 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all text-center "
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl py-3.5 font-medium text-sm transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              Continuer
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Renvoyer un code
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccountForms
