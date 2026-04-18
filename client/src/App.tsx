import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services';
import type { Rol } from './types';
import {
  LoginPage,
  DashboardPage,
  HistorialPagosPage,
  TratamientosPage,
  PacientesPage,
  UsuariosPage,
  CobranzaPage,
  MacroTratamientosPage,
} from './pages';
import RegistrarPagoPage from './pages/RegistrarPagoPage';
import CobrosPage from './pages/CobrosPage';
import { ErrorBoundary } from './components';
import './styles/index.css';

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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin only */}
        <Route path="/dashboard" element={
          <RoleRoute roles={['admin']}>
            <ErrorBoundary moduleName="Dashboard">
              <DashboardPage />
            </ErrorBoundary>
          </RoleRoute>
        } />
        <Route path="/usuarios" element={
          <RoleRoute roles={['admin']}>
            <ErrorBoundary moduleName="Usuarios">
              <UsuariosPage />
            </ErrorBoundary>
          </RoleRoute>
        } />
        <Route path="/macro-tratamientos" element={
          <RoleRoute roles={['admin']}>
            <ErrorBoundary moduleName="Catálogo Clínico">
              <MacroTratamientosPage />
            </ErrorBoundary>
          </RoleRoute>
        } />

        {/* Doctor + Admin */}
        <Route path="/pagos/registrar" element={
          <RoleRoute roles={['doctor', 'admin']}>
            <ErrorBoundary moduleName="Registro de Pagos">
              <RegistrarPagoPage />
            </ErrorBoundary>
          </RoleRoute>
        } />
        <Route path="/tratamientos" element={
          <RoleRoute roles={['doctor', 'admin']}>
            <ErrorBoundary moduleName="Plan de Tratamientos">
              <TratamientosPage />
            </ErrorBoundary>
          </RoleRoute>
        } />

        {/* Secretaria + Admin */}
        <Route path="/cobros/pendientes" element={
          <RoleRoute roles={['secretaria', 'admin']}>
            <ErrorBoundary moduleName="Cobros Pendientes">
              <CobrosPage />
            </ErrorBoundary>
          </RoleRoute>
        } />
        <Route path="/pagos" element={
          <RoleRoute roles={['secretaria', 'admin']}>
            <ErrorBoundary moduleName="Historial de Pagos">
              <HistorialPagosPage />
            </ErrorBoundary>
          </RoleRoute>
        } />
        <Route path="/cobranzas" element={
          <RoleRoute roles={['secretaria', 'admin']}>
            <ErrorBoundary moduleName="Cobranzas">
              <CobranzaPage />
            </ErrorBoundary>
          </RoleRoute>
        } />

        {/* Todos los roles autenticados */}
        <Route path="/pacientes" element={
          <ProtectedRoute>
            <ErrorBoundary moduleName="Pacientes">
              <PacientesPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } />

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
