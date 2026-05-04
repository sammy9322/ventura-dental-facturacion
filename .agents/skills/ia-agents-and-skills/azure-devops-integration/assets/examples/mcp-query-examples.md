# Cheat-Sheet de Ejemplos de LLamadas MCP a Azure DevOps

Estos son ejemplos estructurales precisos de cómo un agente debe invocar los métodos expuestos por el `azure-devops-mcp`.

## 1. Crear un Parent-Child Link (Vincular Task a US)

Al descomponer una historia en tareas, deben vincularse físicamente en Azure DevOps usando `mcp_azure-devops-mcp_wit_work_items_link`. Ten en cuenta que en ADO los links se expresan como padre a hijo o viceversa.

**Argumentos Esperados:**
```json
{
  "project": "NombreDelProyecto",
  "updates": [
    {
      "id": 105, 
      "linkToId": 100, 
      "type": "parent"
    }
  ]
}
```
*Interpretación*: El Work Item `105` (La Task) tiene como 'parent' al Work Item `100` (La US). Por tanto, la Task `105` queda como hija de la US `100`.

## 2. Crear una Iteración (Sprint)

```json
{
  "project": "NombreDelProyecto",
  "iterations": [
    {
      "iterationName": "Sprint 82",
      "startDate": "2024-03-01T00:00:00Z",
      "finishDate": "2024-03-15T23:59:59Z"
    }
  ]
}
```

## 3. Buscar Work Items en el Backlog

Si quieres averiguar el ID real en ADO usando el `localId` asignado en Markdown (Ej: "BUSCAR US-01"). Utiliza `mcp_azure-devops-mcp_search_workitem`.

**Argumentos Esperados:**
```json
{
  "project": ["NombreDelProyecto"],
  "searchText": "US-01 Titulo Exacto",
  "top": 5
}
```
*Alternativamente, si conoces el State:*
```json
{
  "project": ["NombreDelProyecto"],
  "searchText": "Login",
  "workItemType": ["User Story", "Bug"],
  "state": ["New", "Active"]
}
```

## 4. Crear Work Items Múltiples Rápidamente (Añadir Tareas a una US padre)

Si deseas crear varias Tareas Hijas para un padre conocido, puedes usar el batch `mcp_azure-devops-mcp_wit_add_child_work_items`. Es más rápido que iterar uno por uno.

**Argumentos Esperados:**
```json
{
  "project": "NombreDelProyecto",
  "parentId": 100,
  "workItemType": "Task",
  "items": [
    {
      "title": "Configurar Backend JWT",
      "description": "Implementar middleware de sanctum.",
      "format": "Markdown",
      "areaPath": "Proyecto\\Backend"
    },
    {
      "title": "Ajustar Frontend Angular",
      "description": "Consumir API auth y guardar token.",
      "format": "Markdown",
      "areaPath": "Proyecto\\Frontend"
    }
  ]
}
```
*Nota*: Esta función nativa puede transformar el Markdown a HTML en algunos servidores si el formato lo especifica.
