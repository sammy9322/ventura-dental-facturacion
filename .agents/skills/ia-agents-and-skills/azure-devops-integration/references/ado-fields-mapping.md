# Azure DevOps (ADO) System Fields Mapping

Cuando utilices el MCP de Azure DevOps (`azure-devops-mcp`), debes utilizar los nombres internos (Reference Names) de los campos para la creación o actualización de Work Items mediante los comandos `wit_create_work_item` o `wit_update_work_item`.

Este documento sirve como referencia rápida validada de los nombres técnicos esperados.

## Campos Comunes (Para todos los Tipos)

- **Título**: `System.Title`
- **Descripción General**: `System.Description` (Acepta HTML)
- **Estado**: `System.State` (Ej: 'New', 'Active', 'Closed', 'Resolved', 'Removed')
- **Área**: `System.AreaPath` (Ej: `MiProyecto\Equipo1`)
- **Iteración (Sprint)**: `System.IterationPath` (Ej: `MiProyecto\Sprint 1`)
- **Asignado a**: `System.AssignedTo` (Email del usuario)
- **Tags**: `System.Tags` (Separados por punto y coma, ej: `Frontend; Urgent`)

## Campos Específicos por Tipo de Item

### 📝 User Story / PBI (Product Backlog Item)
- **Criterios de Aceptación**: `Microsoft.VSTS.Common.AcceptanceCriteria` (Acepta HTML, ideal para Gherkin)
- **Story Points**: `Microsoft.VSTS.Scheduling.StoryPoints` (Número)
- **Valor de Negocio**: `Microsoft.VSTS.Common.BusinessValue` (Número)

### 🐛 Bug
- **Pasos para Reproducir**: `Microsoft.VSTS.TCM.ReproSteps` (Acepta HTML)
- **Información del Sistema**: `Microsoft.VSTS.TCM.SystemInfo`
- **Prioridad**: `Microsoft.VSTS.Common.Priority` (1 = Alta, 2, 3, 4 = Baja)
- **Severidad**: `Microsoft.VSTS.Common.Severity` (1 - Critical, 2 - High, 3 - Medium, 4 - Low)

### 🔨 Task
- **Trabajo Estimado Inicial**: `Microsoft.VSTS.Scheduling.OriginalEstimate` (En horas, número)
- **Trabajo Completado**: `Microsoft.VSTS.Scheduling.CompletedWork` (En horas, número)
- **Trabajo Restante**: `Microsoft.VSTS.Scheduling.RemainingWork` (En horas, número)
- **Actividad**: `Microsoft.VSTS.Common.Activity` (Ej: Development, Testing, Design)

⚠️ **NOTA CRUCIAL PARA LA DESCRIPCIÓN:**
Azure DevOps espera HTML para los campos de texto enriquecido (`System.Description`, `AcceptanceCriteria`, `ReproSteps`). Usa tags HTML simples (`<h1>`, `<p>`, `<b>`, `<ul>`, `<li>`) si deseas que el formato Markdown local se visualice correctamente en la web. No envíes Markdown crudo si el servidor espera HTML.
