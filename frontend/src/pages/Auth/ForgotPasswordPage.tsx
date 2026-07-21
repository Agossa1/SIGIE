import { useState, useEffect, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { forgotPasswordThunk } from "../../feature/password/services/password.thunk"
import { selectPasswordLoading, selectPasswordError, selectPasswordSuccessMessage } from "../../feature/password/services/password.selectors"
import { clearPasswordState } from "../../feature/password/services/password.slice"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLoading = useAppSelector(selectPasswordLoading)
  const error = useAppSelector(selectPasswordError)
  const successMessage = useAppSelector(selectPasswordSuccessMessage)
 

  const [email, setEmail] = useState("")

  // 🧹 Nettoie les messages d'erreur/succès à l'ouverture et à la fermeture de la page
  useEffect(() => {
    dispatch(clearPasswordState())
    return () => {
      dispatch(clearPasswordState())
    }
  }, [dispatch])

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  
  try {
    // 1. Réinitialise les anciens messages d'erreur/succès
    dispatch(clearPasswordState())
    
    // 2. Déclenche l'action et attend la réponse du serveur (grâce à unwrap)
    await dispatch(forgotPasswordThunk({ email })).unwrap()
    
    // 3. Redirige uniquement si l'API renvoie un succès (HTTP 200)
    navigate("/verify-code-password", { state: { email } })
    
  } catch (error) {
    // Le Thunk rejette l'erreur ici. Elle est automatiquement stockée dans Redux.
    // Pas besoin de faire un "throw new Error", le slice gère déjà l'affichage du message d'erreur.
    console.error("Échec de la demande OTP:", error)
  }
}


  return (
    <div className="min-h-screen bg-gray-50/40 flex items-center justify-center p-4 relative overflow-hidden antialiased">
      
      {/* Grille géométrique discrète en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-75 pointer-events-none" />

      {/* Carte de connexion */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden z-10 relative flex flex-col">
        
        {/* Lisière Tricolore Officielle de la République du Bénin */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#008751]" /> {/* Vert */}
          <div className="flex-1 bg-[#FFD000]" /> {/* Jaune */}
          <div className="flex-1 bg-[#E8112d]" /> {/* Rouge */}
        </div>

        <div className="p-8 sm:p-10 flex flex-col">
          {/* Logo / Badge Gouvernemental */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-10 h-10 rounded-full bg-black border-2 border-[#008751] flex items-center justify-center font-medium text-white text-sm shrink-0 shadow-sm">
              H
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-black leading-none">HSE TERRA</span>
              <span className="text-sm font-medium text-gray-400 mt-1 leading-none">Supervision État - République du Bénin</span>
            </div>
          </div>

          {/* En-tête */}
          <div className="text-left space-y-1 mb-8">
            <h1 className="text-xl font-medium text-black">Mot de passe oublié</h1>
            <p className="text-sm text-gray-400 font-semibold">Saisissez votre adresse e-mail professionnelle pour recevoir un code de réinitialisation.</p>
          </div>

          {/* Messages d'erreur stylés */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-6 animate-shake">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-medium text-rose-700 text-left leading-relaxed">
                {error}
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
              
              {/* E-mail */}
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                  Adresse e-mail professionnelle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom.prenom@gouv.bj"
                    required
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="onDark" label="Envoi en cours…" />
                ) : (
                  <span>Envoyer le code OTP</span>
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={() => navigate("/reset-password", { state: { email } })}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              Passer à la réinitialisation
            </button>
          )}

          {/* Pied de carte */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-3">
            <p className="text-sm text-gray-400 font-semibold">
              <Link to="/login" className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default ForgotPasswordPage
