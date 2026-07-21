import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { changePasswordThunk } from "../../feature/password/services/password.thunk"
import { selectPasswordLoading, selectPasswordError, selectPasswordSuccessMessage } from "../../feature/password/services/password.selectors"
import { clearPasswordState } from "../../feature/password/services/password.slice"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const ChangePasswordPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const isLoading = useAppSelector(selectPasswordLoading)
  const error = useAppSelector(selectPasswordError)
  const successMessage = useAppSelector(selectPasswordSuccessMessage)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocalError("")
    dispatch(clearPasswordState())

    if (newPassword !== confirmPassword) {
      setLocalError("Les nouveaux mots de passe ne correspondent pas.")
      return
    }

    if (newPassword.length < 8) {
      setLocalError("Le nouveau mot de passe doit contenir au moins 8 caractères.")
      return
    }

    dispatch(changePasswordThunk({ oldPassword, newPassword }))
  }

  return (
    <div className="min-h-screen bg-gray-50/40 flex items-center justify-center p-4 relative overflow-hidden antialiased">
      
      {/* Grille géométrique discrète en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-75 pointer-events-none" />

      {/* Carte */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden z-10 relative flex flex-col">
        
        {/* Lisière Tricolore Officielle de la République du Bénin */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#008751]" />
          <div className="flex-1 bg-[#FFD000]" />
          <div className="flex-1 bg-[#E8112d]" />
        </div>

        <div className="p-8 sm:p-10 flex flex-col">
          {/* Logo / Badge Gouvernemental */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-full bg-black border-2 border-[#008751] flex items-center justify-center font-medium text-white text-sm shrink-0 shadow-sm">
              H
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-black leading-none">HSE TERRA</span>
              <span className="text-sm font-medium text-gray-400 mt-1 leading-none">Espace Sécurisé</span>
            </div>
          </div>

          {/* En-tête */}
          <div className="text-left space-y-1 mb-8">
            <h1 className="text-xl font-medium text-black">Modifier le mot de passe</h1>
            <p className="text-sm text-gray-400 font-semibold">Mettez à jour vos accréditations de sécurité.</p>
          </div>

          {/* Messages d'erreur stylés */}
          {(error || localError) && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-6 animate-shake">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-medium text-rose-700 text-left leading-relaxed">
                {localError || error}
              </div>
            </div>
          )}

          {/* Messages de succès stylés */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
              <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-medium text-emerald-700 text-left leading-relaxed">
                {successMessage}
              </div>
            </div>
          )}

          {/* Formulaire */}
          {!successMessage ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Ancien MDP */}
              <div className="space-y-2 text-left">
                <label htmlFor="oldPassword" className="text-sm font-medium text-gray-700 block">
                  Mot de passe actuel
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Nouveau MDP */}
              <div className="space-y-2 text-left">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 block">
                  Nouveau mot de passe
                </label>
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

              {/* Confirm MDP */}
              <div className="space-y-2 text-left">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
                  Confirmer le nouveau mot de passe
                </label>
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

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="onDark" label="Mise à jour…" />
                ) : (
                  <span>Valider les modifications</span>
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              Retour
            </button>
          )}

          {/* Pied de carte */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-3">
            <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline font-medium flex items-center justify-center gap-1 w-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Annuler et retourner
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}

export default ChangePasswordPage
