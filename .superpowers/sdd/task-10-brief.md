### Task 10: Integración — Ruta en App.tsx + Sidebar

**Files:**
- Modify: `client/src/App.tsx` (agregar lazy import + ruta)
- Modify: `client/src/components/Sidebar.tsx` (agregar item + badge de citas)

**Interfaces:**
- Consumes: `CalendarioPage`, `citaService.countToday()`
- Produces: ruta `/calendario` accesible y visible en sidebar con badge

- [ ] **Step 1: Agregar lazy import en `client/src/App.tsx`**

Después de la línea `const CierreCajaPage = lazy(...)` (línea 24), agregar:

```typescript
const CalendarioPage = lazy(() => import('./pages/CalendarioPage'));
```

- [ ] **Step 2: Agregar ruta en `client/src/App.tsx`**

Dentro del bloque `<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>`, agregar la ruta para el calendario. Debe ser accesible para todos los roles autenticados (admin, doctor, secretaria).

Agregar esta línea **después de la línea 131** (después del cierre del Route de CierreCajaPage), **antes de la línea 134** (Route de Pacientes):

```tsx
              <Route path="/calendario" element={<CalendarioPage />} />
```

- [ ] **Step 3: Agregar item en el Sidebar `client/src/components/Sidebar.tsx`**

En el array `menuItems` (después de la línea 59, el item Dashboard), agregar este item:

```typescript
    { name: 'Calendario', path: '/calendario', icon: '📅', roles: ['admin', 'doctor', 'secretaria'] },
```

- [ ] **Step 4: Agregar badge de citas en el Sidebar**

En el Sidebar, agregar un nuevo estado junto al `notifCount` existente (después de línea 15):

```typescript
  const [citasHoyCount, setCitasHoyCount] = useState(0);
```

En el `fetchNotif` (después de la línea 28, después del try/catch existente), agregar:

```typescript
    // Contar citas de hoy
    try {
      const citasRes = await api.get('/citas/hoy/count');
      setCitasHoyCount(citasRes.data.total ?? 0);
    } catch { /* silencioso */ }
```

Y en el JSX del render, en el bloque donde se muestran badges, **después de la línea 93** (después del badge de cobros), agregar condición para Calendario:

```tsx
            {item.path === '/calendario' && citasHoyCount > 0 && (
              <span className="badge-notif">{citasHoyCount}</span>
            )}
```

- [ ] **Step 5: Verificar que compila**

Run: `cd client && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 6: Commit**

```bash
git add client/src/App.tsx client/src/components/Sidebar.tsx
git commit -m "feat(integration): add Calendario route and sidebar badge"
```
