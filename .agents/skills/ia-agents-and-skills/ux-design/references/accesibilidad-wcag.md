# Accesibilidad Web — Referencia WCAG 2.1

Guía de referencia rápida para diseñar productos accesibles. Basado en WCAG 2.1 (Web Content Accessibility Guidelines).

---

## Niveles de Conformidad

| Nivel | Descripción | Cuándo apuntar a él |
|-------|-------------|---------------------|
| **A** | Mínimo absoluto | Nunca es suficiente solo |
| **AA** | Estándar recomendado | Meta mínima para productos comerciales |
| **AAA** | Excelencia | Productos para audiencias con necesidades especiales |

**Meta recomendada: WCAG 2.1 AA**

---

## Los 4 Principios (POUR)

### 1. Perceptible
La información y componentes de la UI deben presentarse de formas que los usuarios puedan percibir.

**Checklist:**
- [ ] Imágenes tienen `alt` text descriptivo
- [ ] Videos tienen subtítulos
- [ ] Información NO transmitida solo por color
- [ ] Contraste texto normal: mínimo **4.5:1**
- [ ] Contraste texto grande (18px+ o 14px+ bold): mínimo **3:1**
- [ ] Contraste componentes UI y gráficos: mínimo **3:1**
- [ ] Texto escalable hasta 200% sin pérdida de contenido
- [ ] No hay contenido que parpadee más de 3 veces por segundo

### 2. Operable
Los componentes de la UI y la navegación deben ser operables.

**Checklist:**
- [ ] Toda funcionalidad accesible por teclado
- [ ] Sin trampas de teclado (el foco puede salir de cualquier componente)
- [ ] Área táctil mínima **44×44px** en mobile
- [ ] Focus visible en todos los elementos interactivos
- [ ] Skip link "Ir al contenido principal" como primer elemento
- [ ] Sin límite de tiempo para completar tareas (o ajustable)
- [ ] Títulos de página únicos y descriptivos

### 3. Comprensible
La información y operación de la UI deben ser comprensibles.

**Checklist:**
- [ ] Idioma de la página declarado en `<html lang="es">`
- [ ] Labels visibles en todos los inputs (no solo placeholder)
- [ ] Mensajes de error identifican el campo y sugieren corrección
- [ ] Navegación consistente en todo el sitio
- [ ] Componentes con la misma función nombrados consistentemente

### 4. Robusto
El contenido debe ser interpretable por tecnologías asistivas actuales y futuras.

**Checklist:**
- [ ] HTML válido y semántico
- [ ] Roles ARIA correctos cuando HTML nativo no es suficiente
- [ ] `aria-label` o `aria-labelledby` en iconos sin texto
- [ ] Estados de componentes comunicados con ARIA (`aria-expanded`, `aria-selected`, etc.)

---

## Contraste de Color — Referencia Rápida

```
Texto normal (< 18px regular, < 14px bold):
  ✅ WCAG AA:  ratio ≥ 4.5:1
  ✅ WCAG AAA: ratio ≥ 7:1

Texto grande (≥ 18px regular, ≥ 14px bold):
  ✅ WCAG AA:  ratio ≥ 3:1
  ✅ WCAG AAA: ratio ≥ 4.5:1

Componentes UI y gráficos informativos:
  ✅ WCAG AA:  ratio ≥ 3:1
```

**Herramientas:**
- https://webaim.org/resources/contrastchecker/
- https://www.whocanuse.com (simula condiciones visuales)
- https://colorsafe.co (genera paletas accesibles)

---

## Roles ARIA Más Comunes

| Elemento | Role HTML nativo | Cuándo agregar ARIA |
|----------|-----------------|---------------------|
| Botón | `<button>` | Si usas `<div>` como botón, agregar `role="button"` |
| Navegación | `<nav>` | Si usas `<div>`, agregar `role="navigation"` |
| Modal/Dialog | — | Siempre `role="dialog"` + `aria-modal="true"` + `aria-labelledby` |
| Alerta | — | `role="alert"` para mensajes que aparecen dinámicamente |
| Toggle/Acordeón | — | `aria-expanded="true/false"` en el trigger |
| Tab panel | — | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Breadcrumb | `<nav>` | `aria-label="Breadcrumb"` + `aria-current="page"` en último item |

---

## Patrones de Formulario Accesibles

```html
<!-- ✅ BIEN: Label siempre visible -->
<label for="email">Correo electrónico</label>
<input id="email" type="email" aria-describedby="email-hint email-error">
<span id="email-hint">Ej: usuario@dominio.com</span>
<span id="email-error" role="alert">Ingresa un correo válido</span>

<!-- ❌ MAL: Solo placeholder (desaparece al escribir) -->
<input type="email" placeholder="Correo electrónico">
```

---

## Testing de Accesibilidad

### Herramientas automatizadas (detectan ~30% de issues)
- **axe DevTools** (extensión Chrome/Firefox) — gratuita
- **WAVE** — https://wave.webaim.org
- **Lighthouse** (Chrome DevTools) — pestaña Accessibility

### Testing manual (imprescindible)
1. **Teclado**: Navegar todo el flujo solo con Tab, Shift+Tab, Enter, Space, Escape
2. **Zoom**: Aumentar al 200% — verificar que no se rompa el layout
3. **Screen reader**:
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (gratuito) o Narrator
   - Mobile iOS: VoiceOver
   - Mobile Android: TalkBack

### Checklist de smoke test (10 minutos)
- [ ] Navegar toda la página solo con teclado
- [ ] Activar zoom al 200%
- [ ] Desactivar CSS y verificar orden lógico del contenido
- [ ] Correr axe DevTools y resolver errores críticos

---

**Fuente oficial**: https://www.w3.org/TR/WCAG21/
**Guía práctica**: https://www.a11yproject.com
