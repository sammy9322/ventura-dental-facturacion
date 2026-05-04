---
name: docs-renderer
description: >
  Visual Artist. Converts Markdown to beautiful HTML and PDF with Themes, LaTeX, and Mermaid support.
  Triggers: "render pdf", "export html", "generate docs output", "usar tema oscuro".
license: MIT
metadata:
  version: "2.0.0"
  author: mapplics
  dependencies:
    - docker
    - puppeteer
    - katex
    - markdown-it-wikilinks
---

# Docs Renderer (The Artist)

> "Separation of Content and Presentation."

Este skill se encarga de que tu documentación se vea increíble. Toma Markdown crudo (con matemáticas, diagramas y links) y lo convierte en documentos profesionales.

## 🎨 Características Clave

### 1. Sistema de Temas (Themes)
Separa el contenido del estilo.
- **Modern**: Tipografía sans-serif limpia (Inter/Roboto), espaciado generoso.
- **Classic**: Serif (Merriweather), estilo académico/libro.
- **Dark**: Tema de alto contraste para lectura en pantalla.
- **Technical**: Estilo denso, mono-spaced para documentación de API.

### 2. Soporte Rico (Rich Media)
- **Math**: Renderizado LaTeX via KaTeX (`$E=mc^2$`).
- **Diagrams**: Renderizado Mermaid.js nativo con soporte de temas variables (colores, curvas).
- **WikiLinks**: Resolución de enlaces `[[WikiLink]]` a anclas HTML.

### 3. Formatos de Salida
- **HTML**: Un solo archivo (o sitio estático) autocontenido.
- **PDF**: Impresión de alta fidelidad via Puppeteer.

### 4. Theme Gallery
[View visual examples of all themes](assets/THEMES.md)

---

## Uso

### Comando Principal
```bash
# Ejecutar via Docker wrapper
./skills/docs-renderer/bin/render.sh <input> <output> [options]
```

### Opciones
- `--theme <name>`: modern, classic, dark, technical.
- `--format <fmt>`: pdf, html (default: pdf).
- `--title <text>`: Título del documento.

---

## Patrones de Implementación

### Markdown-it Stack
El corazón del renderizado usa `markdown-it` con plugins:
- `markdown-it-texmath` (LaTeX)
- `markdown-it-wikilinks` (Obsidian links)
- `markdown-it-container` (Callouts/Admonitions)
- `markdown-it-anchor` (Permalinks)

### Isolation
Todo corre dentro de un contenedor Docker para garantizar que las fuentes y herramientas de renderizado (Puppeteer/Chromium) sean idénticas en desarrollo y CI.

---

## Configuración de Temas

Los temas viven en `assets/themes/`. Un tema se compone de:
1.  **CSS**: Estilos para el HTML.
2.  **Mermaid Config**: JSON con configuración de colores para diagramas.

---

## Comportamiento del Agente

1.  **Selección de Tema**: Si el usuario no especifica, usa `modern`.
2.  **Validación**: Verifica que el input exista.
3.  **Feedback**: Reporta la ruta absoluta del archivo generado.
