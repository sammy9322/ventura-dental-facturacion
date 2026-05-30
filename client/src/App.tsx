import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { authService } from './services';
import type { Rol } from './types';
import './styles/index.css';
import { ThemeProvider } from './ThemeContext';
import MainLayout from './components/MainLayout';

// ── Lazy-loaded pages (code-splitting) ──────────────────────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HistorialPagosPage = lazy(() => import('./pages/HistorialPagosPage'));
const TratamientosPage = lazy(() => import('./pages/TratamientosPage'));
const PacientesPage = lazy(() => import('./pages/PacientesPage'));
const UsuariosPage = lazy(() => import('./pages/UsuariosPage'));
const CobranzaPage = lazy(() => import('./pages/CobranzaPage'));
const MacroTratamientosPage = lazy(() => import('./pages/MacroTratamientosPage'));
const RegistrarPagoPage = lazy(() => import('./pages/RegistrarPagoPage'));
const CobrosPage = lazy(() => import('./pages/CobrosPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AuditoriaPage = lazy(() => import('./pages/AuditoriaPage'));
const CierreCajaPage = lazy(() => import('./pages/CierreCajaPage'));

// ── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
    </div>
  );
}

// ── Guards ──────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ roles, children }: { roles: Rol[]; children: React.ReactNode }) {
  const user = authService.getUser();
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.rol)) {
    if (user?.rol === 'secretaria') return <Navigate to="/cobros/pendientes" replace />;
    if (user?.rol === 'doctor') return <Navigate to="/pagos/registrar" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Redirige al home según el rol
function HomeRedirect() {
  const user = authService.getUser();
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  if (user?.rol === 'admin') return <Navigate to="/dashboard" replace />;
  if (user?.rol === 'doctor') return <Navigate to="/pagos/registrar" replace />;
  return <Navigate to="/cobros/pendientes" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Admin */}
              <Route path="/dashboard" element={
                <RoleRoute roles={['admin']}>
                  <DashboardPage />
                </RoleRoute>
              } />
              <Route path="/usuarios" element={
                <RoleRoute roles={['admin']}>
                  <UsuariosPage />
                </RoleRoute>
              } />
              <Route path="/macro-tratamientos" element={
                <RoleRoute roles={['admin']}>
                  <MacroTratamientosPage />
                </RoleRoute>
              } />
              <Route path="/auditoria" element={
                <RoleRoute roles={['admin']}>
                  <AuditoriaPage />
                </RoleRoute>
              } />

              {/* Doctor + Admin */}
              <Route path="/pagos/registrar" element={
                <RoleRoute roles={['doctor', 'admin']}>
                  <RegistrarPagoPage />
                </RoleRoute>
              } />
              <Route path="/tratamientos" element={
                <RoleRoute roles={['doctor', 'admin']}>
                  <TratamientosPage />
                </RoleRoute>
              } />

              {/* Secretaria + Admin */}
              <Route path="/cobros/pendientes" element={
                <RoleRoute roles={['secretaria', 'admin']}>
                  <CobrosPage />
                </RoleRoute>
              } />
              <Route path="/pagos" element={
                <RoleRoute roles={['secretaria', 'admin', 'doctor']}>
                  <HistorialPagosPage />
                </RoleRoute>
              } />
              <Route path="/cobranzas" element={
                <RoleRoute roles={['secretaria', 'admin']}>
                  <CobranzaPage />
                </RoleRoute>
              } />
              <Route path="/cierre-caja" element={
                <RoleRoute roles={['secretaria', 'admin']}>
                  <CierreCajaPage />
                </RoleRoute>
              } />

              {/* Todos los roles autenticados */}
              <Route path="/pacientes" element={<PacientesPage />} />
            </Route>

            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
