# Guía: Árbol de Decisiones para Creación de Skills

Esta guía detalla la lógica completa para decidir qué tipo de skill crear
y cómo estructurarlo.

---

## 🌳 Árbol de Decisión Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                    ¿DEBO CREAR UN SKILL?                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ¿Es un patrón o comportamiento que se repetirá?                 │
├─────────────────────────────────────────────────────────────────┤
│ NO → No crear skill. Considerar:                                │
│      • Documentación en README                                  │
│      • Comentario en el código                                  │
│      • Ticket/Issue para futuro                                 │
└─────────────────────────────────────────────────────────────────┘
                              │ SÍ
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ¿Ya existe documentación que cubre esto?                        │
├─────────────────────────────────────────────────────────────────┤
│ SÍ → No crear skill. Crear referencia a la doc existente:       │
│      references/docs.md → apunta a la documentación             │
└─────────────────────────────────────────────────────────────────┘
                              │ NO
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ¿La IA comete errores frecuentes en esto?                       │
├─────────────────────────────────────────────────────────────────┤
│ NO → Quizás no necesita skill. Evaluar:                         │
│      • ¿Es realmente un patrón complejo?                        │
│      • ¿Un desarrollador humano lo entendería sin guía?         │
│      Si ambas son SÍ → probablemente no necesita skill          │
└─────────────────────────────────────────────────────────────────┘
                              │ SÍ
                              ▼
                    ✅ CREAR UN SKILL
                              │
                              ▼
```

---

## 🔀 Árbol de Selección de Tipo

Una vez decidido crear un skill:

```
┌─────────────────────────────────────────────────────────────────┐
│                   ¿QUÉ TIPO DE SKILL?                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ¿Depende de convenciones específicas de ESTE proyecto?          │
└─────────────────────────────────────────────────────────────────┘
     │                                              │
     │ SÍ                                           │ NO
     ▼                                              ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   SKILL ESPECÍFICO   │              │ ¿Coordina otros skills?  │
│   DE PROYECTO        │              └──────────────────────────┘
│                      │                   │              │
│ Template:            │                   │ SÍ           │ NO
│ SKILL-PROJECT.md     │                   ▼              ▼
│                      │         ┌─────────────┐  ┌─────────────┐
│ Ubicación:           │         │ ORQUESTADOR │  │  GENÉRICO   │
│ .agent/skills/       │         │             │  │             │
│                      │         │ Template:   │  │ Template:   │
│ Referencias:         │         │ SKILL-      │  │ SKILL-      │
│ Código local         │         │ ORCH...md   │  │ GENERIC.md  │
└──────────────────────┘         │             │  │             │
                                 │ Ubicación:  │  │ Ubicación:  │
                                 │ Depende     │  │ ~/.gemini/  │
                                 │             │  │ o .agent/   │
                                 └─────────────┘  └─────────────┘
```

---

## 📍 Árbol de Decisión: Ubicación

```
┌─────────────────────────────────────────────────────────────────┐
│                 ¿DÓNDE UBICAR EL SKILL?                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ¿Usarás este skill en MÚLTIPLES proyectos?                      │
└─────────────────────────────────────────────────────────────────┘
     │                                              │
     │ SÍ                                           │ NO
     ▼                                              ▼
┌──────────────────────────┐         ┌────────────────────────────┐
│       GLOBAL             │         │        PROYECTO            │
│                          │         │                            │
│ ~/.gemini/antigravity/   │         │ .agent/skills/             │
│ skills/{nombre}/         │         │ {nombre}/                  │
│                          │         │                            │
│ ✅ Disponible siempre    │         │ ✅ Específico al workspace │
│ ✅ Consistencia global   │         │ ✅ Puede usar refs locales │
│ ❌ Sin refs de proyecto  │         │ ❌ Solo este proyecto      │
└──────────────────────────┘         └────────────────────────────┘
```

---

## 📁 Árbol de Decisión: Estructura de Carpetas

```
┌─────────────────────────────────────────────────────────────────┐
│              ¿QUÉ CARPETAS NECESITA EL SKILL?                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
OBLIGATORIO:
├── SKILL.md                 ← Siempre necesario
│
OPCIONAL (según necesidad):
│
├── ¿Necesitas templates de código?
│   └── SÍ → assets/templates/
│
├── ¿Necesitas esquemas JSON/YAML?
│   └── SÍ → assets/schemas/
│
├── ¿Necesitas scripts ejecutables?
│   └── SÍ → scripts/
│
├── ¿Necesitas guías extensas que no caben en SKILL.md?
│   └── SÍ → guides/
│
├── ¿Necesitas ejemplos elaborados?
│   └── SÍ → assets/examples/
│
└── ¿Necesitas referencias a documentación local?
    └── SÍ → references/
```

---

## ✍️ Árbol de Decisión: Contenido del SKILL.md

```
┌─────────────────────────────────────────────────────────────────┐
│            ¿QUÉ SECCIONES INCLUIR EN SKILL.md?                  │
└─────────────────────────────────────────────────────────────────┘

OBLIGATORIO para TODOS:
├── Frontmatter (name, description con trigger, metadata)
├── Cuándo Usar (condiciones de activación)
├── Al menos 1 ejemplo de código
└── Comportamiento del Agente (instrucciones para IA)

SEGÚN EL TIPO:
│
├── GENÉRICO:
│   ├── Patrones críticos (reglas universales)
│   ├── Tabla de referencia rápida
│   └── Enlaces a documentación oficial
│
├── ESPECÍFICO DE PROYECTO:
│   ├── Contexto del proyecto (stack, estructura)
│   ├── Convenciones del proyecto
│   ├── Referencias locales (rutas a docs/código)
│   └── Comandos específicos del proyecto
│
└── ORQUESTADOR:
    ├── Filosofía/principio guía
    ├── Tabla de skills coordinados
    ├── Quick Wins (acciones directas)
    ├── Matriz de delegación
    └── Flujo de orquestación

SI APLICA:
├── ¿Hay decisiones condicionales? → Árbol de decisiones
├── ¿Hay formas incorrectas comunes? → Antipatrones (❌)
├── ¿Hay comandos útiles? → Sección de comandos
└── ¿Hay recursos externos? → Sección de recursos
```

---

## 🤔 Preguntas Frecuentes (FAQ)

### ¿Cuándo usar un orquestador vs un skill maestro?

```
¿El skill necesita DELEGAR a otros skills?
├── SÍ → Es un ORQUESTADOR (coordina, no implementa)
└── NO → ¿Tiene MUCHAS reglas relacionadas?
    ├── SÍ → Es un SKILL MAESTRO (implementa todas las reglas)
    └── NO → Es un skill normal
```

### ¿Cuándo dividir un skill en múltiples skills?

```
¿El skill tiene >50 reglas o >3 dominios distintos?
├── SÍ → Considerar dividir:
│   ├── Un skill por dominio (clean-names, clean-functions, etc.)
│   └── Un orquestador que los coordine
└── NO → Mantener como un solo skill
```

### ¿Cuándo agregar scripts?

```
¿La tarea requiere lógica determinística que la IA haría mal?
├── SÍ → Agregar script en scripts/
│   Ejemplos:
│   • Parsing de archivos binarios
│   • Validaciones complejas
│   • Transformaciones de datos
└── NO → Solo instrucciones en SKILL.md
```

---

## 📋 Plantilla de Decisión Rápida

Usa esta tabla para decidir rápidamente:

| Pregunta | Sí | No |
|----------|----|----|
| ¿Se repite el patrón? | Continuar | No crear |
| ¿Existe doc? | Referenciar | Continuar |
| ¿La IA falla en esto? | Crear skill | Evaluar necesidad |
| ¿Depende del proyecto? | ESPECÍFICO | GENÉRICO u ORQUESTADOR |
| ¿Coordina otros? | ORQUESTADOR | GENÉRICO |
| ¿Multi-proyecto? | Global | Proyecto |
