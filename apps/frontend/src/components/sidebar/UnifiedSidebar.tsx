import { useEffect, type MouseEventHandler, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../../feature/auth/services/auth.types'
import { useAuthRoles } from '../../feature/auth/hooks/useAuthRoles'
import { User_Role } from '../../feature/auth/services/auth.types'
import RoleGuard from '../../feature/auth/components/RoleGuard'
import {
    getRoleFolderForRoles,

    ROLE_PAGE_DEFINITIONS,
    buildRolePath,
    type RolePageId,
} from '../../pages/shared/rolePages.config'

interface UnifiedSidebarProps {
    currentUser: User | null
    onLogout: MouseEventHandler<HTMLButtonElement>
    isOpen: boolean
    onClose: () => void
}

const AUTHORITY_LABELS: Record<User_Role, string> = {
    [User_Role.SUPER_ADMIN]: 'Gouvernement du Bénin',
    [User_Role.PLATFORM_ADMIN]: 'Administration Plateforme',
    [User_Role.MINISTRY]: 'Ministère du Cadre de Vie',
    [User_Role.PREFECTURE_DIRECTOR]: 'Direction Préfectorale',
    [User_Role.MAYOR]: 'Mairie / Municipalité',
    [User_Role.DST_MANAGER]: 'Services Techniques (DST)',
    [User_Role.SGDS_MANAGER]: 'Direction SGDS',
    [User_Role.SUPERVISOR]: 'Supervision de Zone',
    [User_Role.TEAM_LEADER]: 'Chef de Brigade',
    [User_Role.TECHNICIAN]: 'Équipe Terrain',
    [User_Role.VIEWER]: 'Observateur',
}

// Icônes SVG partagées (évite la duplication)
const ICONS: Record<string, ReactNode> = {
    dashboard: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    fieldOps: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>,
    agentReports: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    interventions: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    teamsGps: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    gisMap: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L10 7" /></svg>,
    infrastructure: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    roads: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    sanitation: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    alerts: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
    users: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    organizations: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    roles: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    access: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    auditLog: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    layers: <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
}

const SECTIONS: { label: string; pageIds: RolePageId[]; adminOnly?: boolean; superAdminOnly?: boolean }[] = [
    { label: 'Supervision et cartographie', pageIds: ['dashboard', 'fieldOps', 'agentReports', 'interventions', 'teamsGps'] },
    { label: 'Ouvrages & SIG', pageIds: ['gisMap', 'infrastructure', 'roads'] },
    { label: 'Salubrité & climat', pageIds: ['sanitation', 'alerts'] },
    { label: 'Administration', pageIds: ['users', 'organizations', 'roles', 'access', 'auditLog'], adminOnly: true },
    { label: 'Gestion SIG', pageIds: ['layers'], superAdminOnly: true },
]

const SidebarContent = ({
    currentUser,
    onLogout,
    onClose,
}: {
    currentUser: User | null
    onLogout: MouseEventHandler<HTMLButtonElement>
    onClose: () => void
}) => {
    const { roles } = useAuthRoles()
    const { pathname } = useLocation()
    const folder = getRoleFolderForRoles(roles)
    const pageIds: RolePageId[] = folder?.pages ?? []
    const isAdmin = roles.includes(User_Role.SUPER_ADMIN) || roles.includes(User_Role.PLATFORM_ADMIN)

    const displayName = currentUser
        ? `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email
        : 'Utilisateur'
    const initials = displayName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const authorityLabel = (Array.isArray(roles) && roles.length > 0)
        ? AUTHORITY_LABELS[roles[0]] ?? 'Agent de l\'État'
        : 'Agent de l\'État'

    const navLink = (pageId: RolePageId) => {
        const meta = ROLE_PAGE_DEFINITIONS[pageId]
        if (!meta) return null
        const to = buildRolePath(roles, pageId)
        const isActive = pathname === to || (pageId === 'dashboard' && pathname === '/admin')
        return (
            <Link
                key={pageId}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 ${isActive ? 'bg-emerald-600 text-white' : 'text-gray-800 hover:bg-emerald-50 hover:text-black'}`}
            >
                <span className={isActive ? 'text-white' : 'text-gray-900'}>{ICONS[pageId]}</span>
                {meta.title}
            </Link>
        )
    }

    return (
        <div className="flex flex-col flex-1 overflow-y-auto h-full">
            {/* Logo */}
            <div className="h-16 px-6 flex items-center justify-between gap-3 mt-2 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-emerald-700 flex items-center justify-center font-medium text-white text-sm shrink-0">H</div>
                    <div className="flex flex-col text-left">
                        <h1 className="text-base font-bold text-emerald-700 leading-none">SIGIE</h1>
                        <span className="text-sm text-gray-800 mt-1 leading-none">{folder?.dashboardTitle ?? 'Plateforme'}</span>
                    </div>
                </div>
                <button onClick={onClose} className="xl:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Fermer le menu">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Authority */}
            <div className="px-4 mb-4 shrink-0">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                        <span className="text-sm text-gray-600 font-medium leading-none">Niveau d'Autorité</span>
                        <span className="text-sm font-medium text-emerald-700 mt-2 leading-none">{authorityLabel}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 pt-0 space-y-5 flex-1 text-sm">
                {SECTIONS.map(section => {
                    const visiblePages = section.pageIds.filter(id => pageIds.includes(id))
                    if (visiblePages.length === 0) return null
                    // Sections admin uniquement
                    if (section.adminOnly && !isAdmin) return null
                    // Sections super admin uniquement
                    if (section.superAdminOnly) {
                        return (
                            <RoleGuard key={section.label} allowedRoles={[User_Role.SUPER_ADMIN]}>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-gray-500 px-3 block mb-2">{section.label}</span>
                                    {visiblePages.map(id => navLink(id))}
                                </div>
                            </RoleGuard>
                        )
                    }
                    return (
                        <div key={section.label} className="space-y-1">
                            <span className="text-xs font-semibold text-gray-500 px-3 block mb-2">{section.label}</span>
                            {visiblePages.map(id => navLink(id))}
                        </div>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-medium text-white text-sm">{initials}</div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-medium text-black leading-tight">{displayName}</span>
                            <button onClick={onLogout} className="text-sm font-semibold text-rose-600 hover:underline leading-none mt-1 cursor-pointer border-none bg-transparent p-0 text-left block">Déconnexion</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const UnifiedSidebar = ({ currentUser, onLogout, isOpen, onClose }: UnifiedSidebarProps) => {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            <aside className="hidden xl:flex w-64 bg-white border-r border-gray-100 flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
                <SidebarContent currentUser={currentUser} onLogout={onLogout} onClose={onClose} />
            </aside>
            {isOpen && (
                <div className="xl:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
                    <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
                        <SidebarContent currentUser={currentUser} onLogout={onLogout} onClose={onClose} />
                    </div>
                </div>
            )}
        </>
    )
}

export default UnifiedSidebar