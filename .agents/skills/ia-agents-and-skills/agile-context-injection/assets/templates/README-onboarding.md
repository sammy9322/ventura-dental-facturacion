# Guía de Onboarding Ágil para el Proyecto

¡Bienvenido al Entorno de Trabajo Ágil! Este documento detalla cómo los agentes de IA (en especial el `agile-product-owner`) entienden y se integran con tu proyecto.

## 1. El Skill de Arquitectura (El Contexto)

Durante el inicio del proyecto, se ha generado un skill llamado `architecture-skill` (o similar) mediante un cuestionario interactivo (Context Injection). Este skill contiene la **verdad absoluta** del proyecto:

- **Azure DevOps / Jira Config**: URLs, Project IDs, Nombres de Organización.
- **Áreas e Iteraciones**: Cómo se organiza el backlog y a dónde van los nuevos tickets por defecto.
- **Topología del Código**: Mapeo entre los dominios funcionales (ej: Frontend, Backend) y los repositorios reales de código.
- **Personas**: Clientes, administradores, tech leads y stakeholders.

## 2. Invocando al Planificador

Para comenzar a planificar, simplemente usa el trigger del agente orquestador, por ejemplo:
`"Planifica la épica de Login"` o `"Descompone los requerimientos de la nueva pasarela de pago"`.

El agente `agile-product-owner`:
1. **Fase 0**: Cargará el `architecture-skill` y validará que tiene información suficiente. Si no es así, te hará preguntas.
2. **Fase 1-3**: Analizará y descompondrá la épica en historias más pequeñas utilizando los criterios INVEST y Fibonacci.
3. **Fase 4-6**: Generará la documentación en formato dual (Markdown local para humanos y JSON para la automatización) y finalmente utilizará MCP para sincronizar todo a Azure DevOps/Jira.

## 3. Modificando el Contexto

Si la configuración del proyecto cambia (ej: crean un nuevo repositorio, cambian el nombre del sprint principal, o añaden un nuevo rol de usuario), **debes actualizar el archivo `architecture-skill.md`**. El agente siempre leerá de ahí antes de ejecutar cualquier acción de planificación.
