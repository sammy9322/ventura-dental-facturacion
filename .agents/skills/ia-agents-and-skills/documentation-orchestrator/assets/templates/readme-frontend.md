# {Nombre del Proyecto}

> {Descripción breve de una línea}

## Descripción

{Descripción detallada del propósito del proyecto, qué problema resuelve y para quién.}

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Angular | 17.x |
| Lenguaje | TypeScript | 5.x |
| UI Library | {PrimeNG/Material} | - |
| State | {RxJS/NgRx} | - |
| Build | Angular CLI | 17.x |

## Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI (`npm install -g @angular/cli`)

## Instalación

### Desarrollo Local (Docker)

```bash
# Contenedor ya configurado
docker exec -it {contenedor} npm install
docker exec -it {contenedor} npm run start

# Acceder en http://localhost:{puerto}
```

### Sin Docker

```bash
# Clonar e instalar
git clone {url}
cd {proyecto}
npm install

# Configurar ambiente
cp src/environments/environment.example.ts src/environments/environment.ts

# Iniciar desarrollo
npm run start
```

## Comandos Principales

```bash
# Desarrollo
npm run start              # Servidor de desarrollo (http://localhost:4200)
npm run build              # Build de producción
npm run build:dev          # Build de desarrollo

# Testing
npm run test               # Tests unitarios
npm run test:coverage      # Tests con coverage
npm run e2e                # Tests end-to-end

# Calidad
npm run lint               # Ejecutar linter
npm run lint:fix           # Corregir errores de lint
```

## Estructura del Proyecto

```
{proyecto}/
├── src/
│   ├── app/
│   │   ├── core/                # Servicios singleton, guards, interceptors
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── shared/              # Componentes, pipes, directivas compartidas
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── features/            # Módulos de funcionalidades
│   │   │   ├── {feature}/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── {feature}.module.ts
│   │   │   └── ...
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets/                  # Archivos estáticos
│   ├── environments/            # Configuración por ambiente
│   └── styles/                  # Estilos globales
├── docs/                        # Documentación
└── package.json
```

## Módulos Principales

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | Panel principal |
| {Feature1} | `/{feature1}` | {Descripción} |
| {Feature2} | `/{feature2}` | {Descripción} |

## Configuración

### Ambientes

| Archivo | Uso |
|---------|-----|
| `environment.ts` | Desarrollo local |
| `environment.prod.ts` | Producción |
| `environment.staging.ts` | Staging |

### Variables Principales

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:{puerto}/api',
  // ...
};
```

## Conexión con API

El frontend se conecta a:

| API | URL Local | URL Producción |
|-----|-----------|----------------|
| {API Principal} | `http://localhost:{puerto}` | `https://{dominio}` |

## Testing

```bash
# Tests unitarios con Karma
npm run test

# Con watch mode
npm run test:watch

# Coverage report
npm run test:coverage
# Ver reporte en coverage/index.html
```

## Build y Deploy

```bash
# Build de producción
npm run build

# Los archivos se generan en dist/{proyecto}/
```

Ver [docs/deployment.md](docs/deployment.md) para deploy a Azure.

## Documentación Adicional

- [Arquitectura](docs/architecture.md)
- [Componentes](docs/modules/)
- [Changelog](docs/changelog.md)

## Contribución

1. Crear branch desde `develop`: `feature/task-{id}-descripcion`
2. Implementar cambios con tests
3. Verificar lint: `npm run lint`
4. Crear PR siguiendo template

## Contacto

- **Equipo**: Shell SCM Development
- **Azure DevOps**: [MEN0009-Shell.SCM_1](https://dev.azure.com/mapplicsdevs/MEN0009-Shell.SCM_1)
