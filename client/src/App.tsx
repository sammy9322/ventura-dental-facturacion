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
  RegistrarPagoPage,
  CobrosPage,
  AuditoriaPage,
  CierreCajaPage
} from './pages';
import './styles/index.css';
import './styles/mejoras.css';
import { ThemeProvider } from './ThemeContext';
import MainLayout from './components/MainLayout';

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
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
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
              <RoleRoute roles={['secretaria', 'admin']}>
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
      </BrowserRouter>
    </ThemeProvider>
  );
}
