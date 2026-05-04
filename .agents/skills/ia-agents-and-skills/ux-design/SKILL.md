---
name: ux-design
description: >
  Guía completa de proceso de diseño UX: investigación de usuarios, arquitectura
  de información, wireframing, sistemas de diseño, heurísticas de usabilidad y
  métricas. Tercera persona: orienta al agente en metodologías UX centradas en
  el usuario, desde el descubrimiento hasta la validación.
  Trigger: Usar cuando el usuario menciona UX, wireframes, flujos de usuario,
  usabilidad, research, personas, journey maps, sistemas de diseño, accesibilidad
  o cualquier tarea de diseño centrado en el humano.
license: MIT
metadata:
  author: crucenojmc
  version: "1.0"
---

# UX Design

> "El buen diseño es invisible. El mal diseño es omnipresente." — Don Norman

<!-- Límite: ≤ 500 líneas. Material extenso → references/ o guides/ -->

## Cuándo Usar

Activa este skill cuando:
- El usuario quiere **diseñar o revisar** una interfaz, flujo o experiencia de usuario.
- Se necesita realizar **research de usuarios** (entrevistas, encuestas, tests).
- Se pide crear **wireframes, prototipos o journey maps**.
- Se solicita definir o auditar un **sistema de diseño**.
- Se quiere evaluar una UI con **heurísticas de usabilidad**.
- El usuario menciona: UX, UI, usabilidad, accesibilidad, personas, flujos, onboarding.

**No usar cuando:**
- El usuario solo pide implementar código de frontend (usar skill `frontend-design`).
- La tarea es puramente gráfica/branding sin foco en experiencia del usuario.

---

## Patrones Críticos

### Patrón 1: User-First Discovery

**Descripción**: Antes de proponer soluciones, entender el problema desde la perspectiva del usuario. Nunca saltar directo a soluciones de interfaz.

```markdown
## Checklist Discovery (ejecutar SIEMPRE al inicio)
- [ ] ¿Quiénes son los usuarios? (segmentos, contexto)
- [ ] ¿Cuál es el problema real que enfrentan?
- [ ] ¿Cuál es el goal del negocio?
- [ ] ¿Qué datos/research ya existe?
- [ ] ¿Cuáles son las restricciones (técnicas, tiempo, accesibilidad)?
```

### Patrón 2: Entregar en Capas (Progressive Fidelity)

**Descripción**: Proponer diseño en fases de fidelidad creciente. No ir directo a diseño final sin validar estructura primero.

```
Fase 1 → Flujos de usuario (texto/diagrama)
Fase 2 → Wireframes de baja fidelidad (estructura)
Fase 3 → Wireframes de media fidelidad (contenido real)
Fase 4 → Prototipo navegable (interacción)
Fase 5 → Diseño visual final (UI)
```

### Patrón 3: Aplicar Heurísticas de Nielsen

**Descripción**: Al revisar o crear interfaces, evaluar sistemáticamente con las 10 heurísticas de Nielsen. Ver referencia completa en [references/heuristicas-nielsen.md](references/heuristicas-nielsen.md).

```markdown
Checklist rápido (top 5 críticas):
✓ Visibilidad del estado del sistema (feedback inmediato)
✓ Control y libertad del usuario (deshacer, salir)
✓ Prevención de errores (antes de mensajes de error)
✓ Reconocer antes que recordar (no cargar memoria del usuario)
✓ Ayuda y documentación accesible
```

---

## Árbol de Decisiones

```
¿Qué necesita el usuario?
├── INVESTIGAR usuarios o problema
│   ├── ¿Hay usuarios reales disponibles? → Entrevistas / Tests de usabilidad
│   └── ¿No hay acceso a usuarios? → Análisis heurístico + benchmarking
│
├── DISEÑAR una nueva experiencia
│   ├── ¿Existe research previo? → Fase 2 (Wireframes)
│   └── ¿No existe research? → Fase 1 (Discovery) primero
│
├── EVALUAR / AUDITAR diseño existente
│   ├── ¿Hay usuarios para testear? → Test de usabilidad + métricas
│   └── ¿Sin usuarios disponibles? → Auditoría heurística (Nielsen)
│
├── DOCUMENTAR sistema de diseño
│   └── Ver [guides/sistema-de-diseno.md](guides/sistema-de-diseno.md)
│
└── ACCESIBILIDAD
    └── Ver [references/accesibilidad-wcag.md](references/accesibilidad-wcag.md)
```

---

## Entregables por Fase

### Fase 0 — Research

| Entregable | Descripción | Template |
|-----------|-------------|----------|
| User Personas | Arquetipos de usuarios con goals y frustraciones | [assets/templates/persona.md](assets/templates/persona.md) |
| Journey Map | Experiencia end-to-end con emociones | [assets/templates/journey-map.md](assets/templates/journey-map.md) |
| How Might We | Preguntas para reformular problemas en oportunidades | texto libre |
| Jobs To Be Done | Qué trabajo contrata el usuario al usar el producto | texto libre |

### Fase 1 — Estructura

| Entregable | Descripción |
|-----------|-------------|
| Sitemap / Arquitectura IA | Jerarquía de páginas y contenidos |
| Flujos de usuario | Pasos para completar tareas clave |
| Wireframes lo-fi | Bocetos de estructura sin estilo visual |

### Fase 2 — Validación

| Entregable | Descripción |
|-----------|-------------|
| Guion de test de usabilidad | Tareas y preguntas para sesiones de test |
| Métricas de éxito | CSAT, NPS, task completion rate, time on task |
| Reporte de hallazgos | Problemas priorizados por severidad |

---

## Ejemplos

### ❌ Antipatrón: Solución Antes que Problema

**Problema**: Proponer interfaz sin entender el contexto del usuario.

```markdown
# MAL
Usuario: "Necesito una pantalla de login"
Agente:  "Aquí está el wireframe del login: [diseño]"
```

### ✅ Patrón Correcto: Discovery Primero

**Solución**: Preguntar antes de diseñar.

```markdown
# BIEN
Usuario: "Necesito una pantalla de login"
Agente:  "Antes de wireframear, algunas preguntas:
          - ¿Quiénes son los usuarios? (consumidores / empresas / ambos)
          - ¿Qué métodos de autenticación soporta el sistema?
          - ¿Hay usuarios con necesidades de accesibilidad?
          - ¿Cuál es el contexto de uso? (móvil, desktop, kiosco)
          Esto me permite proponer el flujo correcto."
```

---

### ❌ Antipatrón: Ignorar Accesibilidad

```markdown
# MAL - Contraste insuficiente
Color texto: #999999 sobre fondo #FFFFFF → ratio 2.85:1 (falla WCAG AA)
```

### ✅ Patrón Correcto: Accesibilidad desde el inicio

```markdown
# BIEN - Cumple WCAG AA mínimo
Color texto: #595959 sobre fondo #FFFFFF → ratio 7:1 (pasa WCAG AAA)

Regla: texto normal mínimo 4.5:1, texto grande mínimo 3:1
Tool: https://webaim.org/resources/contrastchecker/
```

---

## Comandos / Acciones Comunes del Agente

```markdown
# Generar Persona
→ Usar template: assets/templates/persona.md
→ Preguntar: segmento, edad aproximada, contexto de uso, goals, frustraciones

# Auditoría Heurística
→ Revisar pantalla/flujo contra las 10 heurísticas de Nielsen
→ Calificar severidad: 0 (no es problema) → 4 (catástrofe de usabilidad)
→ Formato: tabla con heurística | problema | severidad | recomendación

# Journey Map
→ Fases del viaje | Acciones | Pensamientos | Emociones | Puntos de dolor | Oportunidades

# Wireframe en texto (ASCII o Markdown)
→ Usar bloques de código para representar estructura
→ Anotar propósito de cada sección, no contenido final
```

---

## Tabla de Referencia Rápida

| Necesidad | Herramienta UX | Referencia |
|-----------|---------------|------------|
| Entender usuarios | Entrevistas, Personas, JTBD | [guides/research.md](guides/research.md) |
| Mapear experiencia | Journey Map, Service Blueprint | [assets/templates/journey-map.md](assets/templates/journey-map.md) |
| Definir estructura | Sitemap, Card Sorting, Tree Testing | [guides/arquitectura-ia.md](guides/arquitectura-ia.md) |
| Diseñar flujos | User Flows, Task Flows | texto/diagrama Mermaid |
| Evaluar usabilidad | Test de usabilidad, Heurísticas Nielsen | [references/heuristicas-nielsen.md](references/heuristicas-nielsen.md) |
| Accesibilidad | WCAG 2.1, Checklist A11y | [references/accesibilidad-wcag.md](references/accesibilidad-wcag.md) |
| Sistema de diseño | Tokens, Componentes, Guía de estilo | [guides/sistema-de-diseno.md](guides/sistema-de-diseno.md) |

---

## Recursos

- **Nielsen Norman Group**: [https://www.nngroup.com](https://www.nngroup.com)
- **WCAG 2.1**: [https://www.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/)
- **Laws of UX**: [https://lawsofux.com](https://lawsofux.com)
- **Material Design Guidelines**: [https://m3.material.io](https://m3.material.io)
- **Apple HIG**: [https://developer.apple.com/design/human-interface-guidelines/](https://developer.apple.com/design/human-interface-guidelines/)
- **Heurísticas detalladas**: Ver [references/heuristicas-nielsen.md](references/heuristicas-nielsen.md)
- **Templates**: Ver [assets/templates/](assets/templates/)

---

## Comportamiento del Agente

Cuando trabajes con este skill:

1. **Discovery**: Identificar fase del proceso UX en que está el usuario (research, diseño, validación).
2. **Preguntar antes de diseñar**: Si hay ambigüedad sobre el usuario o contexto, preguntar antes de proponer solución.
3. **Aplicar metodología correcta**: Seleccionar herramienta UX adecuada según la fase (ver Árbol de Decisiones).
4. **Fidelidad progresiva**: Empezar por estructura/flujo antes de detalles visuales.
5. **Incluir accesibilidad**: Mencionarla siempre como capa transversal, no como afterthought.
6. **Reportar**: Entregar hallazgos con severidad y recomendaciones accionables, no solo descripción de problemas.

### Notas Importantes

- Los wireframes en texto/Markdown son válidos cuando no hay herramienta de diseño disponible.
- Las heurísticas de Nielsen aplican a cualquier interfaz (web, mobile, voz, física).
- Siempre distinguir entre problema de UX (diseño) y problema de implementación (código).
