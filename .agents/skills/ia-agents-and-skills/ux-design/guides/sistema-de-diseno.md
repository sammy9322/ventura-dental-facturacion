# Guía: Sistemas de Diseño

Un sistema de diseño es una colección de componentes reutilizables, guiados por estándares claros, que permite construir productos de forma consistente y eficiente.

---

## Estructura de un Sistema de Diseño

```
sistema-de-diseno/
├── foundations/          # Tokens base del sistema
│   ├── colores.md
│   ├── tipografia.md
│   ├── espaciado.md
│   ├── iconografia.md
│   └── sombras-elevacion.md
├── components/           # Componentes atómicos → moleculares → organismos
│   ├── atoms/            (botones, inputs, badges, avatars)
│   ├── molecules/        (cards, form groups, navigation items)
│   └── organisms/        (header, sidebar, modales, tablas)
├── patterns/             # Patrones de interacción recurrentes
│   ├── formularios.md
│   ├── empty-states.md
│   ├── loading-states.md
│   └── error-states.md
└── guidelines/           # Reglas editoriales y de voz
    ├── voz-y-tono.md
    └── accesibilidad.md
```

---

## Design Tokens

Los tokens son las variables del sistema. Permiten cambiar el tema globalmente.

### Ejemplo de estructura de tokens

```json
{
  "color": {
    "brand": {
      "primary": "#2563EB",
      "primary-hover": "#1D4ED8",
      "primary-subtle": "#EFF6FF"
    },
    "neutral": {
      "900": "#111827",
      "700": "#374151",
      "400": "#9CA3AF",
      "100": "#F3F4F6",
      "0":   "#FFFFFF"
    },
    "feedback": {
      "success": "#16A34A",
      "warning": "#D97706",
      "error":   "#DC2626",
      "info":    "#2563EB"
    }
  },
  "spacing": {
    "xs":  "4px",
    "sm":  "8px",
    "md":  "16px",
    "lg":  "24px",
    "xl":  "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "typography": {
    "scale": {
      "display":  { "size": "48px", "weight": "700", "leading": "56px" },
      "h1":       { "size": "32px", "weight": "700", "leading": "40px" },
      "h2":       { "size": "24px", "weight": "600", "leading": "32px" },
      "h3":       { "size": "20px", "weight": "600", "leading": "28px" },
      "body-lg":  { "size": "18px", "weight": "400", "leading": "28px" },
      "body":     { "size": "16px", "weight": "400", "leading": "24px" },
      "body-sm":  { "size": "14px", "weight": "400", "leading": "20px" },
      "caption":  { "size": "12px", "weight": "400", "leading": "16px" }
    }
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "full": "9999px"
  }
}
```

---

## Documentación de Componentes (Plantilla)

Cada componente debe documentarse con:

```markdown
## Componente: {Nombre}

### Cuándo usar
{Descripción de casos de uso}

### Cuándo NO usar
{Casos donde este componente no aplica — alternativa sugerida}

### Variantes
| Variante | Descripción | Uso |
|----------|-------------|-----|
| Primary  | Acción principal de la pantalla | Solo 1 por vista |
| Secondary| Acciones secundarias | Hasta 2 por vista |
| Ghost    | Acciones de bajo peso visual | Sin límite |
| Danger   | Acciones destructivas | Siempre con confirmación |

### Estados
- Default, Hover, Focus, Active, Disabled, Loading

### Especificaciones
- Altura mínima: 40px (área táctil mínima accesible)
- Padding horizontal: 16px
- Radio: token `radius.md` (8px)

### Accesibilidad
- Role: `button`
- Estado disabled: `aria-disabled="true"` (no `disabled` nativo para mantener foco)
- Focus visible: outline 2px offset 2px, color brand.primary
```

---

## Checklist de Calidad del Sistema de Diseño

### Foundations
- [ ] Paleta de color con semántica (brand, neutral, feedback)
- [ ] Escala tipográfica definida con line-height
- [ ] Sistema de espaciado consistente (múltiplos de 4 u 8)
- [ ] Tokens de radio de borde
- [ ] Tokens de sombra/elevación
- [ ] Set de iconos definido

### Componentes
- [ ] Todos los estados documentados (default, hover, focus, active, disabled)
- [ ] Variantes claras con criterio de uso
- [ ] Especificaciones de tamaño y espaciado
- [ ] Reglas de uso (cuándo sí / cuándo no)

### Accesibilidad
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Área táctil mínima 44×44px en mobile
- [ ] Estados de foco visibles
- [ ] Roles ARIA documentados
- [ ] Labels para inputs siempre visibles (no solo placeholder)

### Patrones
- [ ] Estados vacíos (empty state) para listas y tablas
- [ ] Estados de carga (skeleton, spinner)
- [ ] Manejo de errores inline y toast
- [ ] Patrones de formulario estandarizados

---

## Referencias de Sistemas de Diseño Públicos

| Sistema | Empresa | URL |
|---------|---------|-----|
| Material Design 3 | Google | https://m3.material.io |
| Ant Design | Alibaba | https://ant.design |
| Carbon | IBM | https://carbondesignsystem.com |
| Polaris | Shopify | https://polaris.shopify.com |
| Lightning | Salesforce | https://www.lightningdesignsystem.com |
| Atlassian Design | Atlassian | https://atlassian.design |
| Primer | GitHub | https://primer.style |
