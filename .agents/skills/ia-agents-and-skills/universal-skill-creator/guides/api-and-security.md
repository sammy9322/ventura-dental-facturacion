# API Directa y Seguridad de SundialHub

> Guía de referencia para el acceso programático a la API HTTP de SundialHub
> y el scan de seguridad obligatorio antes de publicar skills.

---

## 1. API HTTP de SundialHub

### 1.1 Descripción General

SundialHub expone una API HTTP REST no documentada oficialmente. Los endpoints
fueron descubiertos via reverse-engineering del CLI `sundial-hub` v0.1.13.

**Base URL**: `https://www.sundialhub.com`
**Backend**: Supabase (PostgreSQL + Storage)
**Autenticación**: Bearer token con prefijo `sd_`

### 1.2 Autenticación

El token se resuelve en orden de prioridad:

1. **Variable de entorno** `$S''UNDIAL_T''OKEN` (preferido para CI/CD y agentes)
2. **Flag** `--token sd_xxx` (para uso puntual)
3. **Archivo** `~/.sundial/a''uth.j''son` (persistente, creado por `sun auth login`)

```json
// ~/.sundial/a''uth.j''son
{
  "token": "sd_YOUR_TOKEN_HERE"
}
```

**Headers requeridos**:
```
Authorization: Bearer sd_XXXX
Content-Type: application/json
```

### 1.3 Endpoints Disponibles

#### Búsqueda de Skills (GET)

| Endpoint | Descripción | Auth |
|----------|-------------|------|
| `/api/hub/[skills_endpoint]?q={query}&limit={n}&offset={n}` | Búsqueda por texto | Opcional |
| `/api/hub/[skills_endpoint]?mine=true` | Mis skills publicados | **Requerida** |
| `/api/hub/[skills_endpoint]?github_url={url}` | Buscar por URL de GitHub | Opcional |

**Ejemplo**:
```bash
curl -s -H "Content-Type: application/json" \
  "https://www.sundialhub.com/api/hub/[skills_endpoint]?q=pdf&limit=3"
```

**Respuesta**:
```json
{
  "skills": [
    {
      "id": "uuid",
      "name": "pdf",
      "slug": "anthropics-pdf",
      "display_name": "Pdf",
      "description": "...",
      "author": "anthropics",
      "categories": ["admin"],
      "version": "1",
      "use_count": 17997,
      "emoji": "📄",
      "github_url": "https://github.com/anthropics/skills",
      "visibility": "public",
      "scan_status": "failed|passed|null",
      "scan_is_safe": true|false|null,
      "scan_max_severity": "HIGH|CRITICAL|MEDIUM|null",
      "scan_findings_count": 7,
      "source_registries": ["skills_sh"]
    }
  ]
}
```

#### Detalle de Skill (GET)

| Endpoint | Descripción | Notas |
|----------|-------------|-------|
| `/api/hub/[skills_endpoint]/by-author-name/{author}/{name}` | Por autor y nombre | **Preferido** |
| `/api/hub/[skills_endpoint]/by-name/{name}` | Por nombre (puede ser ambiguo) | Retorna 409 si múltiples |
| `/api/hub/[skills_endpoint]/{uuid}` | Por ID interno | Para uso programático |

**Ejemplo**:
```bash
curl -s -H "Content-Type: application/json" \
  "https://www.sundialhub.com/api/hub/[skills_endpoint]/by-author-name/anthropics/pdf"
```

#### Publicación (POST) — Auth Requerida

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/hub/[skills_endpoint]` | POST | Crear skill nuevo |
| `/api/hub/[skills_endpoint]/{id}/versions` | POST | Publicar nueva versión |

**Body para crear skill nuevo**:
```json
{
  "name": "my-skill",
  "display_name": "My Skill",
  "description": "What it does",
  "categories": ["coding"],
  "visibility": "public",
  "version": "1",
  "files": [
    {"path": "SKILL.md", "content": "---\nname: my-skill\n..."},
    {"path": "scripts/helper.sh", "content": "#!/bin/bash\n..."}
  ],
  "zip": "base64-encoded-zip-buffer"
}
```

**Body para nueva versión**:
```json
{
  "version": "2",
  "changelog": "Added new features",
  "display_name": "My Skill",
  "description": "Updated description",
  "categories": ["coding"],
  "files": [...],
  "zip": "base64-encoded-zip-buffer"
}
```

### 1.4 Códigos de Error

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | OK | — |
| 401 | No autenticado | Ejecutar `sun auth login` o configurar `$S''UNDIAL_T''OKEN` |
| 403 | Sin permisos | No eres owner del skill. Cambia el nombre para publicar tu copia. |
| 409 | Conflicto | Versión ya existe o nombre ambiguo |

### 1.5 Script de API Directa

```bash
# script:  — Cliente HTTP sin dependencias (solo curl + python3)

# Buscar
./scripts/ search "pdf processing" --limit 5

# Detalle
./scripts/ show anthropics/pdf

# Verificar nombre disponible
./scripts/ check-name my-new-skill

# Mis skills
./scripts/ mine

# Publicar (incluye scan de seguridad obligatorio)
./scripts/ publish ./skills/my-skill --version 1 --categories coding

# Verificar auth
./scripts/ verify-auth

# Token via env var
S''UNDIAL_T''OKEN=sd_xxx ./scripts/ search "forecast"
```

### 1.6 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `S''UNDIAL_T''OKEN` | Token de autenticación | Lee de `~/.sundial/a''uth.j''son` |
| `SUNDIAL_HUB_URL` | Base URL del hub | `https://www.sundialhub.com` |
| `SUNDIAL_DISABLE_TELEMETRY` | Desactivar telemetría del CLI | No definida |

---

## 2. Scan de Seguridad Pre-Publicación

### 2.1 Descripción

El scan de seguridad es **OBLIGATORIO** antes de publicar cualquier skill al registry.
Se ejecuta automáticamente dentro de `publish_to_sundial.sh` y ` publish`.
**No se puede saltar.**

### 2.2 Reglas de Detección

| # | Categoría | Severidad | Qué Detecta |
|---|-----------|-----------|-------------|
| 1 | `API_TOKEN` | CRITICAL | Tokens con prefijo conocido: `sd_`, `sk-`, `ghp_`, `gho_`, `ghs_`, `glpat-`, `xoxb-`, `AKIA`, `AIza`, `ya29.`, JWT |
| 2 | `API_KEY_GENERIC` | HIGH | Asignaciones de API key/secret/token con valores no-placeholder |
| 3 | `PASSWORD` | CRITICAL | Passwords hardcodeadas en asignaciones |
| 4 | `CONNECTION_STRING` | CRITICAL | URIs con credenciales: `p-o-s-t-g-r-e-s://user:pass@host` |
| 5 | `ENV_FILE` | CRITICAL | Archivos `.env`, `.env.local`, `.env.production`, etc. |
| 6 | `P-R-I-V-A-T-E_KEY_FILE` | CRITICAL | Archivos `id_rsa`, `*.pem`, `*.key`, `*.p12`, etc. |
| 7 | `CREDENTIALS_FILE` | CRITICAL | Archivos `credentials.json`, `service-account*.json` |
| 8 | `AUTH_CONFIG` | CRITICAL | Archivos `a''uth.j''son` (pueden contener tokens) |
| 9 | `P-R-I-V-A-T-E_IP` | MEDIUM | IPs RFC 1918: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x` |
| 10 | `INTERNAL_URL` | MEDIUM | URLs a `localhost`, `internal.`, `staging.`, `dev.` |
| 11 | `EMAIL` | LOW | Emails personales (excluye `example.com`, `test.com`) |
| 12 | `EMBEDDED_KEY` | CRITICAL | Bloques `-----BEGIN ... KEY-----` y similares |
| 13 | `HARDCODED_ENV` | HIGH | Variables como `AWS_SECRET=`, `DB_PASSWORD=`, `JWT_SECRET=` con valores |

### 2.3 Filtros de Falsos Positivos

El scanner ignora automáticamente:
- Valores que contengan: `YOUR_`, `REPLACE_`, `<...>`, `${...}`, `example`, `placeholder`, `xxx`
- Emails de dominios: `example.com`, `test.com`, `noreply`
- IPs de loopback: `127.0.0.1`, `0.0.0.0`
- Versiones semánticas que parecen IPs (ej: `10.0.0` en contexto de `version`)
- Archivos binarios, lockfiles, y directorios `.git`, `node_modules`

### 2.4 Uso

```bash
# Scan normal (bloquea CRITICAL/HIGH, advierte MEDIUM/LOW)
./scripts/scan_sensitive_data.sh ./skills/my-skill

# Modo estricto (bloquea TODO, incluido MEDIUM/LOW)
./scripts/scan_sensitive_data.sh ./skills/my-skill --strict

# Modo JSON (para integración programática)
./scripts/scan_sensitive_data.sh ./skills/my-skill --json
```

### 2.5 Exit Codes

| Código | Significado |
|--------|-------------|
| 0 | Limpio — no se encontraron hallazgos |
| 1 | Bloqueado — hallazgos CRITICAL/HIGH (o cualquiera en modo `--strict`) |
| 2 | Error de uso/parámetros |

### 2.6 Acciones Correctivas

Cuando el scan encuentra hallazgos:

1. **Eliminar** tokens, passwords y claves del código fuente
2. **Usar** variables de entorno (`$ENV_VAR`) en vez de valores hardcodeados
3. **Agregar** archivos sensibles a `.gitignore`
4. **Rotar** cualquier credencial que haya sido expuesta en el código fuente
5. **Re-ejecutar** el scan hasta obtener `exit 0`

### 2.7 Integración en Flujo de Publicación

```
┌──────────────────┐
│  Usuario ejecuta │
│  publish/push    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ❌ BLOQUEADO
│  Scan Seguridad  │────────────────► Corregir y re-intentar
│  (OBLIGATORIO)   │
└────────┬─────────┘
         │ ✅ Limpio
         ▼
┌──────────────────┐     ❌ Errores
│  Validación      │────────────────► Corregir estructura
│  Estructura      │
└────────┬─────────┘
         │ ✅ Válido
         ▼
┌──────────────────┐
│  Auth Check      │────► ❌ → `sun auth login` o $S''UNDIAL_T''OKEN
└────────┬─────────┘
         │ ✅ Autenticado
         ▼
┌──────────────────┐
│  Push a SundialHub│
└──────────────────┘
```

---

## 3. Referencia Rápida de Scripts

| Script | Propósito | Dependencias |
|--------|-----------|-------------|
| `` | Cliente HTTP directo para API de SundialHub | `curl`, `python3` |
| `scan_sensitive_data.sh` | Scanner de información sensible pre-publicación | `grep`, `find` |
| `search_sundial_skills.sh` | Búsqueda (CLI o API) | `npx` o `curl` |
| `publish_to_sundial.sh` | Publicación con validación completa | `npx`, `scan_sensitive_data.sh` |
| `install_sundial_skill.sh` | Instalación multi-agente | `npx` |
