import { useEffect, useState, useRef } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useAppDispatch } from "./stores/hooks"
import { refreshTokenThunk } from "./feature/auth/services/auth.thunk"
import RoleGuard from "./feature/auth/components/RoleGuard"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import SignalementsMapPage from "./pages/Reports/SignalementsMapPage"
import { ROLE_ROUTE_CONFIGS } from "./pages/shared/roleRouteConfigs"
import LoginPage from "./pages/Auth/LoginPage"
import RegisterPage from "./pages/Auth/RegisterPage"
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage"
import ChangePasswordPage from "./pages/Auth/ChangePasswordPage"
import VerifyCodePage from "./pages/Auth/VerifyPasswordCodePage"
import SetupPasswordPage from "./pages/Auth/SetupPasswordPage"
import PageLoader from "./components/ui/PageLoader"

// 🔒 Composant pour protéger les routes privées
const ProtectedLayout = () => {
  const dispatch = useAppDispatch()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const isStarted = useRef(false)

  useEffect(() => {
    if (isStarted.current) return
    isStarted.current = true

    const checkSession = async () => {
      try {
        await dispatch(refreshTokenThunk()).unwrap()
      } catch {
        // Session inexistante ou expirée : on laisse le state Redux gérer
        // (refreshTokenThunk.rejected met isAuthenticated = false)
      } finally {
        setIsCheckingSession(false)
      }
    }
    checkSession()
  }, [dispatch])

  if (isCheckingSession) {
    return (
      <PageLoader
        message="Vérification de la session"
        submessage="Contrôle sécurisé de vos accréditations…"
      />
    )
  }

  return <Outlet />
}

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔓 ROUTES PUBLIQUES : Accessibles directement sans vérification de token */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/verify-code-password" element={<VerifyCodePage/>} />
        <Route path="/auth/setup-password" element={<SetupPasswordPage />} />

        {/* 🔒 ROUTES PRIVÉES : Soumises à la vérification des accréditations */}
        <Route element={<ProtectedLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/signalements" element={<SignalementsMapPage />} />
          {ROLE_ROUTE_CONFIGS.map(({ path, roles, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleGuard allowedRoles={roles} fallback={<Navigate to="/login" replace />}>
                  {element}
                </RoleGuard>
              }
            />
          ))}
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
