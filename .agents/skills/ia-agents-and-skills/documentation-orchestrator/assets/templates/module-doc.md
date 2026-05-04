# Módulo: {Nombre del Módulo}

> {Descripción breve de una línea}

## Información General

| Campo | Valor |
|-------|-------|
| **Ubicación** | `{ruta/al/modulo}` |
| **Tipo** | {Service / Component / Repository / etc.} |
| **Dependencias** | {Otros módulos de los que depende} |

---

## Descripción

{Descripción detallada del módulo:
- Propósito principal
- Responsabilidades
- Cómo encaja en la arquitectura general}

---

## Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│                   {Módulo}                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐              │
│  │  Component  │  │   Service   │              │
│  └──────┬──────┘  └──────┬──────┘              │
│         │                │                      │
│         ▼                ▼                      │
│  ┌─────────────────────────────┐               │
│  │        Repository           │               │
│  └─────────────────────────────┘               │
└─────────────────────────────────────────────────┘
```

### Estructura de Archivos

```
{modulo}/
├── {archivo1}.{ext}         # Descripción
├── {archivo2}.{ext}         # Descripción
├── {subdirectorio}/
│   ├── {archivo3}.{ext}     # Descripción
│   └── {archivo4}.{ext}     # Descripción
└── index.{ext}              # Entry point
```

---

## Clases / Componentes Principales

### `{ClassName}`

**Responsabilidad**: {Qué hace esta clase}

**Métodos públicos:**

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `metodo1()` | `$param: Type` | `ReturnType` | {Descripción} |
| `metodo2()` | `$a, $b` | `void` | {Descripción} |

**Ejemplo de uso:**

```{language}
// Ejemplo de cómo usar la clase
$instance = new ClassName();
$result = $instance->metodo1($param);
```

### `{OtraClase}`

...

---

## Dependencias

### Internas (del proyecto)

| Módulo | Propósito |
|--------|-----------|
| `{Modulo1}` | {Para qué se usa} |
| `{Modulo2}` | {Para qué se usa} |

### Externas (librerías)

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `{paquete}` | ^1.0 | {Para qué se usa} |

---

## Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `{VAR}` | {Descripción} | `{valor}` |

### Archivo de Configuración

```{language}
// config/{modulo}.php o similar
return [
    'opcion1' => env('VAR', 'default'),
    'opcion2' => 100,
];
```

---

## Uso

### Caso de Uso 1: {Nombre}

```{language}
// Código de ejemplo
```

### Caso de Uso 2: {Nombre}

```{language}
// Código de ejemplo
```

---

## Testing

### Tests Disponibles

| Test | Tipo | Descripción |
|------|------|-------------|
| `{TestClass}` | Unit | {Qué testea} |
| `{TestClass2}` | Integration | {Qué testea} |

### Ejecutar Tests

```bash
# PHP/Laravel
php artisan test --filter={Modulo}

# JavaScript/TypeScript
npm run test -- --grep="{modulo}"
```

---

## Eventos / Hooks

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `{EventName}` | {Trigger} | `{ data: ... }` |

---

## Errores Comunes

### Error 1: {Descripción breve}

**Causa**: {Por qué ocurre}

**Solución**:
```{language}
// Código de solución
```

### Error 2: {Descripción breve}

...

---

## Notas de Mantenimiento

- {Consideración importante 1}
- {Consideración importante 2}

## Trabajo Futuro

- [ ] {Mejora pendiente}
- [ ] {Refactoring planificado}

---

## Referencias

- [Arquitectura general](../architecture.md)
- [API relacionada](../api/{recurso}.md)
