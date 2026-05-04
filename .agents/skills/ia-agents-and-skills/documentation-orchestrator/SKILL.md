---
name: documentation-orchestrator
description: >
  The Conductor for Docs-as-Code. Orchestrates structure, validation, and rendering of technical documentation.
  Triggers: "generate docs", "document project", "validate docs", "render manual", "ci-check docs".
license: MIT
metadata:
  version: "2.0.0"
  author: mapplics
  dependencies:
    - knowledge-structure
    - docs-renderer
    - mermaid-expert
    - web-screenshot
---

# Documentation Orchestrator (Docs-as-Code)

> "Documentation is Code. Treat it that way."

Este skill es el **punto de entrada único** para todas las necesidades de documentación del proyecto. No hace el trabajo pesado por sí mismo, sino que coordina a los especialistas (`knowledge-structure`, `docs-renderer`, `mermaid-expert`, etc.).

## 🚀 Funcionalidades Principales

### 1. Scaffolding (`scaffold`)
Invoca a `knowledge-structure` para crear la estructura de carpetas estándar (`docs/`, `docs/assets`, `docs/adr`).
- **Comando**: "Prepara la documentación para este proyecto".

### 2. Validation (`validate` / `lint`)
Invoca a `knowledge-structure` para verificar la integridad del Grafo de Conocimiento.
- **Chequeos**: Links rotos, WikiLinks sin destino, Imágenes faltantes.
- **Comando**: "Valida los links de la documentación".

### 3. Rendering (`build` / `render`)
Invoca a `docs-renderer` para transformar Markdown en HTML/PDF bonitos.
- **Features**: Temas Visuales, LaTeX, Mermaid, WikiLinks.
- **Comando**: "Genera el PDF del manual con tema oscuro".

### 4. CI/CD Integration (`ci-check`)
Un comando compuesto que ejecuta `lint` + `build` y retorna exit code para pipelines.
- **Uso**: `documentation-orchestrator ci-check`

---

##  Workflow Sugerido

1.  **Escribir**: El usuario crea contenido en `docs/` usando Markdown + WikiLinks (`[[Concept]]`).
2.  **Validar**: El usuario (o CI) corre `validate` para asegurar que todo conecta.
3.  **Publicar**: El sistema genera HTML estático o PDF para consumo final.

---

## Estructura de Proyecto Esperada (Obsidian Compatible)
```
.
├── docs/                      # Vault Root
│   ├── index.md              # Entry point
│   ├── assets/               # Imágenes y anexos
│   │   ├── screenshots/      # Capturas automáticas
│   │   └── diagrams/         # Diagramas fuente
│   ├── guides/
│   │   └── getting-started.md
│   └── reference/
│       └── api.md
├── .github/workflows/        # CI Pipelines
│   └── docs.yml
└── ...
```

---

## Comandos del Agente

### Módulo: Scaffold
```bash
# Delega a knowledge-structure
./skills/knowledge-structure/bin/scaffold.sh
```

### Módulo: Validate
```bash
# Delega a knowledge-structure
./skills/knowledge-structure/bin/lint.js docs/
```

### Módulo: Render
```bash
# Delega a docs-renderer
./skills/docs-renderer/bin/render.js docs/index.md --theme modern --out dist/manual.pdf
```

### Módulo: Screenshot
```bash
# Delega a web-screenshot
./skills/web-screenshot/bin/snap.js https://localhost:3000 docs/assets/screenshots/home.png
```

---

## Comportamiento del Agente

1.  **Recepción**: Identifica qué fase del ciclo de vida documental necesita el usuario (Creación, Validación, Publicación).
2.  **Orquestación**: NO intentes hacerlo tú mismo. Llama al skill especialista.
3.  **Error Handling**: Si el especialista falla (ej: link roto), reporta el error exacto y sugiere corrección.
