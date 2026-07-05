### Task 11: CSS del Calendario

**Files:**
- Modify: `client/src/styles/index.css` (agregar estilos del calendario al final)

- [ ] **Step 1: Agregar estilos del calendario al final de `index.css`**

Append this CSS block at the very end of the file (after the last line, which is `}` at line 1185):

```css
/* ══════════════════════════════════════════════════════════════
   CALENDARIO CLÍNICO
   ══════════════════════════════════════════════════════════════ */

.calendario-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2rem);
}

/* ── Toolbar ──────────────────────────────────────────────── */
.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-color, #e2e2e2);
  margin-bottom: 1rem;
}

.calendar-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calendar-toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1a1a2e);
}

.calendar-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.calendar-view-toggle {
  display: flex;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-view-btn {
  padding: 0.4rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.calendar-view-btn.active {
  background: var(--brand-purple, #613192);
  color: #fff;
}

.calendar-view-btn:hover:not(.active) {
  background: var(--bg-hover, #f5f5f5);
}

.calendar-doctor-select {
  max-width: 200px;
  font-size: 0.85rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary, #666);
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-hover, #f5f5f5);
  color: var(--brand-purple, #613192);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

/* ── Calendar Body ────────────────────────────────────────── */
.calendar-body {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* ── Month View ───────────────────────────────────────────── */
.calendar-month-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.month-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-color, #e2e2e2);
}

.month-header-cell {
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-secondary, #666);
  text-transform: uppercase;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}

.month-cell {
  border: 1px solid var(--border-color, #e2e2e2);
  border-top: none;
  border-left: none;
  padding: 0.4rem;
  min-height: 100px;
  cursor: pointer;
  transition: background 0.15s;
}

.month-cell:hover {
  background: var(--bg-hover, #faf8fc);
}

.month-cell.other-month {
  background: var(--bg-muted, #f9f9f9);
  opacity: 0.4;
  pointer-events: none;
}

.month-cell.today {
  background: rgba(97, 49, 146, 0.04);
}

.month-cell-day {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary, #666);
}

.month-cell-day.today-number {
  background: var(--brand-purple, #613192);
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.month-cell-citas {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 0.25rem;
}

.month-cell-more {
  font-size: 0.7rem;
  color: var(--brand-purple, #613192);
  font-weight: 600;
  padding: 0 4px;
}

/* ── Week View ────────────────────────────────────────────── */
.calendar-week-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.week-header-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 2px solid var(--border-color, #e2e2e2);
  position: sticky;
  top: 0;
  background: var(--bg-primary, #fff);
  z-index: 5;
}

.week-header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  gap: 0.15rem;
}

.week-header-cell.today {
  color: var(--brand-purple, #613192);
}

.week-header-day {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

.week-header-num {
  font-size: 1.1rem;
  font-weight: 600;
}

.week-header-num.today-number {
  background: var(--brand-purple, #613192);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.week-body {
  flex: 1;
  overflow-y: auto;
}

.week-row {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  min-height: 40px;
}

.week-row.hour-start {
  border-top: 1px solid var(--border-color, #e2e2e2);
}

.week-time-gutter {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 8px;
  position: relative;
}

.week-time-label {
  font-size: 0.7rem;
  color: var(--text-secondary, #999);
  transform: translateY(-8px);
}

.week-cell {
  border-left: 1px solid var(--border-color, #eee);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 40px;
}

.week-cell:hover {
  background: rgba(97, 49, 146, 0.03);
}

.week-cell.drag-over {
  background: rgba(0, 188, 212, 0.1);
  outline: 2px dashed var(--brand-turquoise, #00BCD4);
  outline-offset: -2px;
}

.week-appointment-wrapper {
  position: relative;
  z-index: 2;
}

/* ── Day View ─────────────────────────────────────────────── */
.calendar-day-view {
  position: relative;
  height: 100%;
  overflow-y: auto;
}

.day-row {
  display: grid;
  grid-template-columns: 70px 1fr;
  min-height: 50px;
}

.day-row.hour-start {
  border-top: 1px solid var(--border-color, #e2e2e2);
}

.day-time-gutter {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 12px;
}

.day-time-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #999);
  transform: translateY(-8px);
  font-weight: 500;
}

.day-cell {
  border-left: 1px solid var(--border-color, #eee);
  position: relative;
  cursor: pointer;
  transition: background 0.15s;
  padding: 2px 4px;
}

.day-cell:hover {
  background: rgba(97, 49, 146, 0.03);
}

.day-cell.drag-over {
  background: rgba(0, 188, 212, 0.1);
  outline: 2px dashed var(--brand-turquoise, #00BCD4);
  outline-offset: -2px;
}

.day-appointment-wrapper {
  position: relative;
  z-index: 2;
}

.day-now-line {
  position: absolute;
  left: 70px;
  right: 0;
  height: 2px;
  background: #E74C3C;
  z-index: 10;
  pointer-events: none;
}

.day-now-dot {
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: #E74C3C;
  border-radius: 50%;
}

/* ── Appointment Card ─────────────────────────────────────── */
.appointment-card {
  background: var(--appointment-bg, rgba(0, 188, 212, 0.08));
  border-left: 3px solid var(--brand-turquoise, #00BCD4);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
  overflow: hidden;
}

.appointment-card:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.appointment-card.compact {
  padding: 2px 6px;
  font-size: 0.72rem;
}

.appointment-card.dimmed {
  opacity: 0.5;
}

.appointment-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.appointment-time {
  font-weight: 600;
  color: var(--text-primary, #333);
}

.appointment-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.appointment-card-body {
  display: flex;
  flex-direction: column;
}

.appointment-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-patient {
  font-size: 0.7rem;
  color: var(--text-secondary, #888);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Appointment Modal — Type Toggle ──────────────────────── */
.calendar-type-toggle {
  display: flex;
  border: 1px solid var(--border-color, #e2e2e2);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-type-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: var(--text-secondary, #666);
}

.calendar-type-btn.active {
  background: var(--brand-purple, #613192);
  color: #fff;
}

/* ── Form Row 3 Columns ──────────────────────────────────── */
.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

/* ── Horario Config ──────────────────────────────────────── */
.horario-config-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.horario-config-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.horario-config-row.disabled {
  opacity: 0.4;
}

.horario-day-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  font-weight: 500;
  cursor: pointer;
}

.horario-separator {
  color: var(--text-secondary, #999);
  font-size: 0.85rem;
}

.form-input-sm {
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  max-width: 110px;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .calendar-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .calendar-toolbar-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .calendar-doctor-select {
    max-width: 100%;
    flex: 1;
  }

  .form-row-3 {
    grid-template-columns: 1fr;
  }

  .month-cell {
    min-height: 60px;
    padding: 0.2rem;
  }

  .week-time-gutter,
  .day-time-gutter {
    width: 45px;
    min-width: 45px;
  }

  .week-header-row,
  .week-row {
    grid-template-columns: 45px repeat(7, 1fr);
  }

  .day-row {
    grid-template-columns: 45px 1fr;
  }
}
```

- [ ] **Step 2: Verificar visualmente (run dev build)**

Run: `cd client && npm run build`
Expected: Build exitoso sin warnings críticos

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/index.css
git commit -m "feat(css): add complete calendar module styles with Ventura branding"
```
