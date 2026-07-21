import { useState, type FormEvent } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { loginThunk } from "../services/auth.thunk"
import { selectAuthLoading, selectAuthError, selectIsAuthenticated, selectCurrentUser } from "../services/auth.selectors"
import { clearError } from "../services/auth.slice"
import { User_Role } from "../services/auth.types"
import { getDefaultRouteForRoles } from "../../../pages/shared/rolePages.config"
import LoadingSpinner from "../../../components/ui/LoadingSpinner"

const LoginForms = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const currentUser = useAppSelector(selectCurrentUser)

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

    // Si authentifié, on gère la redirection
    if (isAuthenticated) {
      if (!currentUser) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" label="Initialisation de la session..." /></div>;
      const userRoles = (currentUser?.roles ?? []) as User_Role[];
      const targetRoute = getDefaultRouteForRoles(userRoles);
      return <Navigate to={targetRoute} replace />
    }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      dispatch(clearError())

      // 1. On attend le succès de l'authentification avec .unwrap()
      await dispatch(loginThunk({ email: identifier, password })).unwrap()

      // 2. On vide le formulaire UNIQUEMENT si la connexion réussit
      setIdentifier("")
      setPassword("")
    } catch (error) {
      // Les erreurs HTTP rejetées par Redux tombent ici grâce à .unwrap()
      console.error("Failed to login:", error)
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

          {/* En-tête de connexion */}
          <div className="text-left space-y-1 mb-8">
            <h1 className="text-xl font-medium text-black">Portail de supervision</h1>
            <p className="text-sm text-gray-400 font-semibold">Saisissez vos accréditations officielles d'inspection</p>
          </div>

          {/* Messages d'erreur stylés */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-6 animate-shake">
              <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm font-medium text-rose-700 text-left leading-relaxed">
                {error === "Identifiants invalides" ? "Adresse e-mail ou mot de passe incorrect." : error}
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* E-mail */}
            <div className="space-y-2 text-left">
              <label htmlFor="login-email" className="text-sm font-medium text-gray-700 block">
                Identifiant (E-mail ou Téléphone)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nom@gouv.bj ou +229..."
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Mot de passe sécurisé
                </label>
                <a href="/forgot-password" className="text-2xs font-medium text-blue-600 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Bouton de Connexion */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" variant="onDark" label="Vérification des accès…" />
              ) : (
                <span>Accéder à la console</span>
              )}
            </button>
          </form>

          {/* Pied de carte */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-3">

            <p className="text-sm text-gray-600 font-medium">
              Ce système d'information gouvernemental est réservé exclusivement aux agents et partenaires officiels de la Direction Générale du Développement Urbain.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default LoginForms