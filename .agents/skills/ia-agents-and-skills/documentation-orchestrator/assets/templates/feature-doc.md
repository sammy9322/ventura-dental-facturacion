# Feature: {Nombre del Feature}

> {Descripción breve de una línea}

## Información General

| Campo | Valor |
|-------|-------|
| **Fecha** | {YYYY-MM-DD} |
| **Autor** | {nombre} |
| **Task ID** | #{id} |
| **Repositorio** | {repo} |
| **Branch** | `feature/task-{id}-{descripcion}` |

---

## Descripción

{Descripción detallada del feature:
- Qué problema resuelve
- Para qué usuarios
- Contexto de negocio}

## Casos de Uso

### Caso 1: {Nombre}
**Actor**: {Usuario/Sistema}
**Precondición**: {Condición previa}
**Flujo**:
1. {Paso 1}
2. {Paso 2}
3. {Paso 3}

**Resultado**: {Resultado esperado}

### Caso 2: {Nombre}
...

---

## Arquitectura

### Componentes Involucrados

| Componente | Tipo | Cambios |
|------------|------|---------|
| `{Archivo1}` | Controller | Nuevo endpoint |
| `{Archivo2}` | Service | Nueva lógica |
| `{Archivo3}` | Component | Nueva UI |

### Diagrama de Flujo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │────▶│   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       └───────────▶│   {Otro}    │
                    └─────────────┘
```

---

## API (si aplica)

### Nuevo Endpoint

**`{METHOD} /api/{ruta}`**

**Request:**
```json
{
  "campo1": "valor",
  "campo2": 123
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "resultado": "..."
  }
}
```

**Errores:**
| Código | Descripción |
|--------|-------------|
| 400 | Parámetros inválidos |
| 401 | No autorizado |
| 404 | Recurso no encontrado |

---

## Configuración

### Variables de Entorno

| Variable | Descripción | Valor Default |
|----------|-------------|---------------|
| `{VAR_1}` | {Descripción} | `{default}` |
| `{VAR_2}` | {Descripción} | `{default}` |

### Migraciones (si aplica)

```bash
# Ejecutar migración
php artisan migrate

# Migración específica
php artisan migrate --path=database/migrations/{archivo}
```

---

## Uso

### Ejemplo Básico

```{language}
// Código de ejemplo mostrando uso típico del feature
```

### Ejemplo Avanzado

```{language}
// Código mostrando uso con opciones avanzadas
```

---

## Testing

### Tests Creados

| Test | Tipo | Descripción |
|------|------|-------------|
| `{TestClass}` | Unit | {Qué testea} |
| `{TestClass2}` | Integration | {Qué testea} |

### Ejecutar Tests

```bash
# Tests del feature
php artisan test --filter={FeatureName}
# o
npm run test -- --grep="{feature}"
```

---

## Limitaciones Conocidas

- {Limitación 1}: {Descripción y workaround si existe}
- {Limitación 2}: {Descripción}

## Trabajo Futuro

- [ ] {Mejora pendiente 1}
- [ ] {Mejora pendiente 2}

---

## Referencias

- **Task**: [#{id}](https://dev.azure.com/mapplicsdevs/MEN0009-Shell.SCM_1/_workitems/edit/{id})
- **PR**: [#{pr}](link-al-pr)
- **Docs relacionados**: [link](ruta)
