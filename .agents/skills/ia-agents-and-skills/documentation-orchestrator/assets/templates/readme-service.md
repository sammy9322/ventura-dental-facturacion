# {Nombre del Servicio}

> {Descripción breve de una línea}

## Descripción

{Descripción detallada del propósito del servicio, qué problema resuelve y cómo encaja en la arquitectura.}

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | FastAPI | 0.100+ |
| Lenguaje | Python | 3.11+ |
| Base de Datos | {MongoDB/MySQL} | - |
| Cache | Redis | 7.x |
| Task Queue | Celery | - |

## Requisitos Previos

- Python >= 3.11
- pip / poetry
- Docker (para desarrollo local)
- Acceso a base de datos

## Instalación

### Desarrollo Local (Docker)

```bash
# El servicio corre en contenedor
docker-compose up -d {servicio}

# Acceder en http://localhost:{puerto}
# Docs en http://localhost:{puerto}/docs
```

### Sin Docker

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables
cp .env.example .env

# Iniciar servicio
uvicorn app.main:app --reload --port {puerto}
```

## Comandos Principales

```bash
# Desarrollo
uvicorn app.main:app --reload    # Servidor con hot-reload
python -m pytest                  # Ejecutar tests

# Docker
docker logs {contenedor}          # Ver logs
docker exec -it {contenedor} sh   # Shell en contenedor

# Celery (si aplica)
celery -A app.worker worker -l info
```

## Estructura del Proyecto

```
{servicio}/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/       # Endpoints por recurso
│   │   │   └── router.py        # Router principal
│   │   └── deps.py              # Dependencias comunes
│   ├── core/
│   │   ├── config.py            # Configuración
│   │   └── security.py          # Autenticación
│   ├── models/                  # Modelos de datos
│   ├── schemas/                 # Pydantic schemas
│   ├── services/                # Lógica de negocio
│   ├── repositories/            # Acceso a datos
│   └── main.py                  # Entry point
├── tests/                       # Tests
├── docs/                        # Documentación
├── requirements.txt
└── Dockerfile
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/{recurso}` | Listar recursos |
| POST | `/api/v1/{recurso}` | Crear recurso |
| GET | `/api/v1/{recurso}/{id}` | Obtener recurso |

> Documentación interactiva: `http://localhost:{puerto}/docs`

## Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `APP_ENV` | Ambiente | `development` |
| `DATABASE_URL` | Conexión a DB | `mongodb://...` |
| `REDIS_URL` | Conexión a Redis | `redis://...` |
| `API_KEY` | Key de autenticación | `secret` |

## Dependencias Externas

| Servicio | Propósito | URL |
|----------|-----------|-----|
| {DB} | Persistencia | `{host}:{port}` |
| Redis | Cache/Queues | `scm.redis:6379` |
| {Otro API} | {Propósito} | `{url}` |

## Testing

```bash
# Todos los tests
pytest

# Con coverage
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/test_{modulo}.py -v
```

## Monitoreo

- **Health**: `GET /health`
- **Logs**: `docker logs {contenedor}`
- **Metrics**: {Endpoint de métricas si existe}

## Deployment

Ver [docs/deployment.md](docs/deployment.md) para instrucciones de deploy.

## Documentación Adicional

- [Arquitectura](docs/architecture.md)
- [API Reference](docs/api/)
- [Changelog](docs/changelog.md)

## Contacto

- **Equipo**: Shell SCM Development
- **Azure DevOps**: [MEN0009-Shell.SCM_1](https://dev.azure.com/mapplicsdevs/MEN0009-Shell.SCM_1)
