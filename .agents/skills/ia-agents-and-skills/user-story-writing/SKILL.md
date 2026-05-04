---
name: user-story-writing
description: >
  Skill para redactar historias de usuario efectivas y criterios de aceptación.
  Úsalo cuando necesites escribir user stories, definir criterios de aceptación Gherkin,
  crear descripciones detalladas, o estimar story points.
  Triggers: user story, historia de usuario, criterios de aceptación, Gherkin.
license: MIT
metadata:
  version: "2.0"
  type: method
  author: mapplics
allowed-tools: Read, Edit, Write, Glob, Grep
---

# User Story Writing

Skill especializado en la redacción de historias de usuario efectivas, criterios de aceptación verificables y documentación técnica.

## When to Use This Skill

Usa este skill cuando necesites:
- Escribir user stories con el formato correcto
- Definir criterios de aceptación verificables
- Usar formato Gherkin (Given-When-Then)
- Crear descripciones para herramientas de gestión ágil
- Estimar la complejidad relativa (Story points)

## Formato Básico de User Story (As a... I want... So that...)

```
Como <tipo de usuario / rol específico>
Quiero <acción/funcionalidad deseada>
Para <beneficio/objetivo de negocio>
```

> **NOTA IMPORTANTE SOBRE EL CONTEXTO:**
> A diferencia del antiguo skill SCM, **no hay una lista hard-codeada de roles**. Debes pedirle al usuario (o revisar el skill de arquitectura de su proyecto) cuáles son los roles relevantes para su aplicación (ej. Admin, Guest, Operator).

## Criterios de Aceptación

### Formato Gherkin (BDD)

```gherkin
Escenario: <Nombre identificativo>
Dado que <situación de partida/precondición>
Cuando <acción/evento>
Entonces <consecuencia/resultado validable>
```

**Ejemplo:**
```gherkin
Escenario: Login fallido por contraseña incorrecta
Dado que soy un usuario registrado
Y estoy en la página de login
Cuando ingreso mi email correcto
Y mi contraseña es incorrecta
Entonces visualizo un mensaje de "Credenciales inválidas"
Y no ingreso al dashboard
```

### Formato Checklist Rápido (Si no se requiere BDD)

```markdown
- [ ] El sistema muestra <elemento> cuando <condición>
- [ ] El usuario puede <acción> obteniendo <resultado>
- [ ] Tiempo de respuesta < Xms
```

## Palabras Claves (Verbos de Acción)

Utiliza estos verbos para aclarar tu intención en los requerimientos:
- **Visualizar/Ver**: Lectura (Read).
- **Crear/Registrar**: Escritura nueva (Create).
- **Editar/Modificar**: Actualización (Update).
- **Eliminar/Desactivar/Archivar**: Borrado (Delete).
- **Aprobar/Rechazar**: Flujos de Estado.
- **Exportar/Importar**: Manejo de archivos masivos.

## Checklist de Calidad para US

### Pre-Cierre de Historia

- [ ] Rol identificado de manera granular ("Como Admin" vs "Como Usuario Logueado").
- [ ] Funcionalidad clara y delimitada.
- [ ] Beneficio de negocio evidente.
- [ ] Criterios de Aceptación abarcan el Happy Path.
- [ ] Criterios de Aceptación abarcan Edge Cases / Errores.
- [ ] El título resume adecuadamente la historia.

## Plantillas (Templates)

Para mantener homogeneidad, este skill incluye plantillas para diferentes elementos ágiles en la carpeta `assets/templates/`:
- `epic.md`
- `feature.md`
- `user-story.md`
- `task.md`
- `bug-report.md`

Tú, como agente, DEBES utilizarlas siempre que generes documentación referida a estos work items.

## Comportamiento del Agente

1. **Plantillas Primero**: Lee los archivos Markdown que están bajo `assets/templates/` cuando te pidan redactar un ítem nuevo.
2. **Exigir Detalles**: Cuando un usuario dice "Hazme una historia para el login", responde formulando qué roles existen y cuáles son los casos límite.
3. **Estimar Complexity (Si lo piden)**: Sugerir story points basándose en integración, tamaño y novedad tecnológica (1 a 13). Sugerir slicing si se pasa de 8-13 puntos.
