import { useMemo, type FormEvent } from "react"
import { User_Role } from "../../auth/services/auth.types"
import type { CreateUserDTO } from "../../auth/services/auth.types"
import TerritoryCascadeFields from "../../reports/components/TerritoryCascadeFields"
import type { TerritoryFormLabels, TerritoryFormValues } from "../../territory/services/territory.types"
import {
  needsCommuneAttachment,
  needsRegionAttachment,
  needsTerritoryAttachment,
} from "../utils/roleTerritoryRules"


interface CreateUserDrawerProps {
  isOpen: boolean
  onClose: () => void
  form: CreateUserDTO
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onTerritoryChange: (patch: Partial<TerritoryFormValues>, labels?: Partial<TerritoryFormLabels>) => void
  onSubmit: (e: FormEvent) => void
  isLoading: boolean
  error: string | null
  successMessage: string | null
}

const CreateUserDrawer = ({
  isOpen,
  onClose,
  form,
  onChange,
  onTerritoryChange,
  onSubmit,
  isLoading,
  error,
  successMessage,
}: CreateUserDrawerProps) => {
  const role = form.role ?? User_Role.TECHNICIAN
  const showCommune = needsCommuneAttachment(role)
  const showRegionOnly = needsRegionAttachment(role)
  const territoryValues: TerritoryFormValues = useMemo(
    () => ({
      regionId: form.regionId ?? "",
      municipalityId: form.municipalityId ?? "",
      districtId: form.districtId ?? "",
      neighborhoodId: form.neighborhoodId ?? "",
    }),
    [form.regionId, form.municipalityId, form.districtId, form.neighborhoodId]
  )

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ${isOpen ? "visible" : "invisible"}`}>
      {/* Overlay d'arrière-plan */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      {/* Le tiroir lui-même */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white border-l border-gray-800 shadow-2xl p-8 flex flex-col transition-transform duration-500 ease-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Créer un nouveau collaborateur</h3>
            <p className="text-sm text-gray-600 mt-0.5">Inscrire un membre et lui attribuer un rôle</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire intérieur */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto space-y-5 pr-2">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{successMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900  ">Prénom</label>
              <input
                name="firstName"
                type="text"
                required
                placeholder="Ex: Marc"
                value={form.firstName}
                onChange={onChange}
                className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900  ">Nom</label>
              <input
                name="lastName"
                type="text"
                required
                placeholder="Ex: Koffi"
                value={form.lastName}
                onChange={onChange}
                className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-900  ">Email professionnel</label>
            <input
              name="email"
              type="email"
              required
              placeholder="marc.koffi@domain.com"
              value={form.email}
              onChange={onChange}
              className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-900  ">Téléphone (avec indicatif)</label>
            <input
              name="phone"
              type="tel"
              placeholder="+229 90 00 00 00"
              value={form.phone}
              onChange={onChange}
              className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-900  ">Mot de passe temporaire</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-900  ">Attribuer un rôle</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full bg-gray-50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/80 cursor-pointer"
            >
              <option value={User_Role.SUPER_ADMIN}>Super administrateur</option>
              <option value={User_Role.PLATFORM_ADMIN}>Administrateur plateforme</option>
              <option value={User_Role.MINISTRY}>Ministère du Cadre de Vie</option>
              <option value={User_Role.PREFECTURE_DIRECTOR}>Directeur préfectoral</option>
              <option value={User_Role.MAYOR}>Maire / Municipalité</option>
              <option value={User_Role.DST_MANAGER}>Responsable DST</option>
              <option value={User_Role.SGDS_MANAGER}>Responsable SGDS</option>
              <option value={User_Role.SUPERVISOR}>Superviseur de zone</option>
              <option value={User_Role.TEAM_LEADER}>Chef de brigade</option>
              <option value={User_Role.TECHNICIAN}>Technicien terrain</option>
            </select>
          </div>

          {needsTerritoryAttachment(role) && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-gray-900">Rattachement territorial</p>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {showCommune
                  ? "Sélectionnez directement la commune ou commencez par la région."
                  : showRegionOnly
                    ? "Sélectionnez la région (département / préfecture) pour ce directeur."
                    : "Périmètre optionnel."}
              </p>
              <TerritoryCascadeFields
                values={territoryValues}
                onChange={onTerritoryChange}
                isNeighborhoodRequired={false}
              />
            </div>
          )}

          <div className="border-t border-slate-800 pt-6 mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-emerald-600 hover:bg-slate-800 text-sl-300 font-semibold text-sm transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Création en cours..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserDrawer
