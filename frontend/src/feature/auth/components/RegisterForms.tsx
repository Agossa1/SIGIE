import { useState, type FormEvent } from "react"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { registerThunk } from "../services/auth.thunk"
import { selectAuthLoading, selectAuthError } from "../services/auth.selectors"
import { clearError } from "../services/auth.slice"
import type { CreateUserDTO } from "../services/auth.types"
import { User_Role } from "../services/auth.types"
import LoadingSpinner from "../../../components/ui/LoadingSpinner"

const RegisterForms = () => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)

  const [form, setForm] = useState<CreateUserDTO>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "", // Optionnel, géré par le flux Setup
    role: User_Role.TECHNICIAN,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    try {
      dispatch(clearError())
      dispatch(registerThunk(form))

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: User_Role.TECHNICIAN,
      })
    } catch (error) {
      console.error("Failed to register:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/40 flex items-center justify-center p-4 relative overflow-hidden antialiased">
      
      {/* Grille géométrique discrète en arrière-plan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-75 pointer-events-none" />

      {/* Carte d'inscription */}
      <div className="w-full max-w-lg bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden z-10 relative flex flex-col my-8">
        
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

          {/* En-tête d'inscription */}
          <div className="text-left space-y-1 mb-8">
            <h1 className="text-xl font-medium text-black">Formulaire d'accréditation</h1>
            <p className="text-sm text-gray-400 font-semibold">Créez votre dossier d'accès pour les services d'inspection</p>
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

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prénom */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="register-firstName" className="text-sm font-medium text-gray-700 block">
                  Prénom
                </label>
                <input
                  id="register-firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Nom */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="register-lastName" className="text-sm font-medium text-gray-700 block">
                  Nom de famille
                </label>
                <input
                  id="register-lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Kpohihoun"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="register-email" className="text-sm font-medium text-gray-700 block">
                Adresse e-mail professionnelle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nom.prenom@gouv.bj"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="register-phone" className="text-sm font-medium text-gray-700 block">
                Numéro de téléphone mobile
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+229 90 00 00 00"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Type d'Agent */}
            

            <div className="space-y-1.5 text-left">
              <label htmlFor="register-role" className="text-sm font-medium text-gray-700 block">
                Rôle officiel
              </label>
              <select
                id="register-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              >
                <option value={User_Role.TECHNICIAN}>Technicien municipal</option>
                <option value={User_Role.SUPERVISOR}>Superviseur d'équipe</option>
                <option value={User_Role.DST_MANAGER}>Responsable DST</option>
                <option value={User_Role.SGDS_MANAGER}>Responsable SGDS</option>
              </select>
            </div>

            {/* Bouton d'Inscription */}
            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl py-3.5 font-medium text-sm shadow-sm hover:shadow-none transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" variant="onDark" label="Enregistrement du dossier…" />
              ) : (
                "Formuler la demande d'accès"
              )}
            </button>
          </form>

          {/* Pied de carte */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center space-y-3">
            <p className="text-sm text-gray-400 font-semibold">
              Déjà accrédité ?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </a>
            </p>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">
              Toute demande d'accréditation fait l'objet d'une validation manuelle par l'administrateur ministériel avant l'activation du compte.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

export default RegisterForms
