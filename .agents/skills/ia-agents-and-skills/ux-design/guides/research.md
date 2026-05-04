# Guía de Research de Usuarios

Metodologías para descubrir necesidades, comportamientos y motivaciones de los usuarios.

---

## Cuándo usar cada método

```
¿Qué quiero entender?
│
├── COMPORTAMIENTOS (qué hacen los usuarios)
│   ├── Cuantitativo → Analytics, A/B testing, encuestas métricas
│   └── Cualitativo  → Observación contextual, test de usabilidad
│
├── ACTITUDES (qué piensan/sienten)
│   ├── Cuantitativo → Encuestas (NPS, CSAT, escala Likert)
│   └── Cualitativo  → Entrevistas, grupos focales
│
└── DESCUBRIR el espacio del problema
    → Entrevistas generativas, Diary Studies, Jobs To Be Done
```

---

## Entrevistas de Usuario

### Cuándo: Fase de discovery, antes de diseñar

### Guion base (60 minutos)

```markdown
## Apertura (5 min)
- Agradecimiento y contexto
- "No estamos evaluando a ti, estamos evaluando el producto"
- Permiso para grabar

## Calentamiento (10 min)
- Cuéntame un poco sobre tu rol / día a día
- ¿Qué herramientas usas regularmente para {área de interés}?

## Exploración del problema (30 min)
- Cuéntame la última vez que tuviste que {tarea relevante}
- ¿Qué pasó exactamente? ¿Cuál fue el resultado?
- ¿Qué fue lo más difícil de ese proceso?
- ¿Qué haces cuando {situación de fricción}?
- Si pudieras cambiar UNA cosa de ese proceso, ¿qué sería?

## Cierre (10 min)
- ¿Hay algo más que sientas que debería saber?
- ¿Conoces a alguien más con estos desafíos que podría querer hablar con nosotros?
```

### Reglas de oro
- Preguntar "¿por qué?" mínimo 5 veces (Five Whys)
- No preguntar sobre el futuro ("¿usarías X?") — preguntar sobre el pasado
- Silencio es válido — no llenar el silencio con sugerencias
- Nunca hacer preguntas leading ("¿no crees que sería mejor si...?")

---

## Test de Usabilidad

### Cuándo: Para evaluar un flujo o prototipo existente

### Estructura (45-60 minutos)

```markdown
## Setup
- Compartir pantalla del participante
- Pensar en voz alta ("di lo que estás pensando mientras navegas")
- "No hay respuestas correctas o incorrectas"

## Tareas (15-20 min cada una)
Redactar tareas como escenarios reales, NO instrucciones:
  ❌ MAL: "Haz click en el botón 'Nueva orden'"
  ✅ BIEN: "Imagina que necesitas pedir materiales para tu proyecto.
           ¿Cómo lo harías desde aquí?"

## Métricas por tarea
- Task completion rate: ¿Completó la tarea? (S/N / Parcial)
- Time on task: tiempo en segundos
- Errores cometidos
- Nivel de dificultad (1-7 escala post-tarea)

## Post-test
- ¿Qué fue lo más difícil?
- ¿Qué cambiarías?
- Single Ease Question (SEQ): "¿Qué tan fácil fue esta tarea?" (1-7)
```

### Número de participantes
- **5 usuarios**: detecta ~85% de problemas de usabilidad (Nielsen, 1993)
- **3 usuarios mínimo** para iteraciones rápidas
- Aumentar a 10-15 para validación estadística de métricas

---

## Métricas de UX

### Métricas de actitud (encuesta)

| Métrica | Pregunta | Escala | Benchmark industria |
|---------|----------|--------|---------------------|
| **NPS** | "¿Recomendarías a un amigo?" | 0-10 | > 50 = excelente |
| **CSAT** | "¿Qué tan satisfecho estás?" | 1-5 | > 4 = bien |
| **SUS** | 10 preguntas de usabilidad | 0-100 | > 68 = aceptable |
| **SEQ** | "¿Qué tan fácil fue esta tarea?" | 1-7 | > 5.5 = bien |

### Métricas de comportamiento (analytics)

| Métrica | Descripción | Herramienta |
|---------|-------------|-------------|
| Task completion rate | % usuarios que completan tarea | Maze, Hotjar |
| Time on task | Tiempo promedio por tarea | Maze, analytics |
| Error rate | Errores por sesión | Maze, grabaciones |
| Drop-off rate | % abandono en cada paso del funnel | GA4, Mixpanel |
| Clicks to complete | Clics necesarios para completar | Maze |

---

## Jobs To Be Done (JTBD)

Framework para entender la motivación real detrás del uso de un producto.

### Formato de Job Statement

```
Cuando {situación},
quiero {motivación},
para poder {resultado esperado}.
```

### Ejemplo
```
Cuando estoy coordinando un proyecto con múltiples stakeholders,
quiero tener visibilidad del estado de cada tarea en tiempo real,
para poder anticipar bloqueos antes de que impacten la fecha de entrega.
```

### Tipos de Jobs
- **Functional**: La tarea práctica que quieren completar
- **Emotional**: Cómo quieren sentirse al hacerlo
- **Social**: Cómo quieren ser percibidos por otros

---

## How Might We (HMW)

Técnica para convertir problemas en oportunidades de diseño.

### Formato
> "¿Cómo podríamos [verbo de acción] para que [usuario] pueda [resultado]?"

### Calibración del HMW

```
Problema: "Los usuarios abandonan el formulario porque es muy largo"

Demasiado amplio:   "¿Cómo podríamos mejorar la experiencia de registro?"
Demasiado estrecho: "¿Cómo podríamos reducir el formulario a 3 campos?"
✅ Calibrado:       "¿Cómo podríamos hacer que completar el registro
                     se sienta rápido y sin esfuerzo?"
```

---

**Recurso**: Nielsen Norman Group — https://www.nngroup.com/articles/
