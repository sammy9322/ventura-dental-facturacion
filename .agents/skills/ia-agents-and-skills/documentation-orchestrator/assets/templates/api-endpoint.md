# API: {Nombre del Endpoint}

> {Descripción breve de una línea}

## Información General

| Campo | Valor |
|-------|-------|
| **Ruta** | `{METHOD} /api/{version}/{ruta}` |
| **Autenticación** | {Bearer Token / API Key / None} |
| **Versión** | v1 |
| **Controlador** | `{ControllerName}@{method}` |

---

## Descripción

{Descripción detallada de qué hace este endpoint, cuándo usarlo y para qué casos de uso.}

---

## Request

### Headers

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer {token}` |
| `Content-Type` | Sí | `application/json` |
| `Accept` | No | `application/json` |

### Path Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `{param}` | integer | Sí | {Descripción} |

### Query Parameters

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Página para paginación |
| `per_page` | integer | 15 | Items por página |
| `{param}` | string | - | {Descripción} |

### Body (si aplica)

```json
{
  "campo1": "string (requerido) - Descripción",
  "campo2": 123,  // integer (opcional) - Descripción
  "campo3": {
    "subcampo": "valor"
  }
}
```

**Validaciones:**
| Campo | Reglas |
|-------|--------|
| `campo1` | required, string, max:255 |
| `campo2` | optional, integer, min:0 |

---

## Response

### Success (200 OK)

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "nombre": "Ejemplo",
    "created_at": "2026-01-21T00:00:00Z"
  }
}
```

### Success con Paginación (200 OK)

```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Item 1" },
    { "id": 2, "nombre": "Item 2" }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

### Errores

| Código | Tipo | Descripción |
|--------|------|-------------|
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable | Validación fallida |
| 500 | Server Error | Error interno |

**Ejemplo de error (422):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "campo1": ["El campo es requerido"],
    "campo2": ["Debe ser un número"]
  }
}
```

---

## Ejemplos

### cURL

```bash
curl -X {METHOD} \
  'https://{host}/api/{version}/{ruta}' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "campo1": "valor"
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('/api/{version}/{ruta}', {
  method: '{METHOD}',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campo1: 'valor'
  })
});

const data = await response.json();
```

### PHP (Laravel HTTP)

```php
$response = Http::withToken($token)
    ->post('/api/{version}/{ruta}', [
        'campo1' => 'valor'
    ]);

$data = $response->json();
```

---

## Permisos

| Rol | Acceso |
|-----|--------|
| Admin | ✅ Full |
| Manager | ✅ Lectura |
| User | ❌ Denegado |

---

## Rate Limiting

| Límite | Ventana |
|--------|---------|
| 60 requests | 1 minuto |

---

## Notas

- {Nota importante 1}
- {Nota importante 2}

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-01-21 | Endpoint creado |
