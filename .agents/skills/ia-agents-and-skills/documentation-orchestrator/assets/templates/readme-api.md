# {Nombre del Proyecto}

> {Descripción breve de una línea}

## Descripción

{Descripción detallada del propósito del proyecto, qué problema resuelve y para quién.}

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Laravel | 10.x |
| PHP | PHP | 8.2+ |
| Base de Datos | MySQL | 8.0 |
| Cache | Redis | 7.x |
| Queue | Laravel Horizon | - |

## Requisitos Previos

- PHP >= 8.2
- Composer >= 2.0
- MySQL 8.0 o acceso a Azure MySQL
- Redis (opcional, para cache/queues)
- Docker (para desarrollo local)

## Instalación

### Desarrollo Local (Docker)

```bash
# Clonar repositorio
git clone {url}
cd {proyecto}

# Copiar configuración
cp .env.example .env

# Levantar contenedores
docker-compose up -d

# Instalar dependencias
docker exec -it {contenedor} composer install

# Generar key y migrar
docker exec -it {contenedor} php artisan key:generate
docker exec -it {contenedor} php artisan migrate
```

### Sin Docker

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Comandos Principales

```bash
# Desarrollo
php artisan serve                    # Iniciar servidor
php artisan migrate                  # Ejecutar migraciones
php artisan db:seed                  # Poblar base de datos

# Testing
php artisan test                     # Ejecutar tests
php artisan test --filter={nombre}   # Test específico

# Cache
php artisan config:cache             # Cachear configuración
php artisan route:cache              # Cachear rutas
php artisan cache:clear              # Limpiar cache

# Queues
php artisan horizon                  # Iniciar Horizon
php artisan queue:work               # Procesar cola
```

## Estructura del Proyecto

```
{proyecto}/
├── app/
│   ├── Http/
│   │   ├── Controllers/         # Controladores
│   │   ├── Middleware/          # Middleware
│   │   └── Requests/            # Form Requests
│   ├── Models/                  # Modelos Eloquent
│   ├── Services/                # Lógica de negocio
│   └── Repositories/            # Acceso a datos
├── config/                      # Configuración
├── database/
│   ├── migrations/              # Migraciones
│   └── seeders/                 # Seeders
├── routes/
│   ├── api.php                  # Rutas API
│   └── web.php                  # Rutas web
├── tests/                       # Tests
└── docs/                        # Documentación
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/{recurso}` | Listar recursos |
| POST | `/api/{recurso}` | Crear recurso |
| GET | `/api/{recurso}/{id}` | Obtener recurso |
| PUT | `/api/{recurso}/{id}` | Actualizar recurso |
| DELETE | `/api/{recurso}/{id}` | Eliminar recurso |

> Ver documentación completa en `docs/api/`

## Configuración

### Variables de Entorno Principales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `APP_ENV` | Ambiente | `local`, `production` |
| `DB_HOST` | Host de MySQL | `scm.db` |
| `DB_DATABASE` | Base de datos | `wmcloud-prd-local` |
| `REDIS_HOST` | Host de Redis | `scm.redis` |

## Testing

```bash
# Todos los tests
php artisan test

# Con coverage
php artisan test --coverage

# Grupo específico
php artisan test --group=api
```

## Deployment

Ver [docs/deployment.md](docs/deployment.md) para instrucciones de deploy.

## Documentación Adicional

- [Arquitectura](docs/architecture.md)
- [API Reference](docs/api/)
- [Changelog](docs/changelog.md)

## Contribución

1. Crear branch desde `develop`: `feature/task-{id}-descripcion`
2. Implementar cambios con tests
3. Crear PR siguiendo template
4. Code review y merge

## Contacto

- **Equipo**: Shell SCM Development
- **Azure DevOps**: [MEN0009-Shell.SCM_1](https://dev.azure.com/mapplicsdevs/MEN0009-Shell.SCM_1)
