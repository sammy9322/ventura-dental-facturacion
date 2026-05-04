# Ejemplos de Diagramas Mermaid

Este archivo contiene ejemplos de los diagramas Mermaid más utilizados en la documentación del proyecto.

### Flowchart (Flujos de proceso)
```mermaid
graph TD
    A[Inicio] --> B{¿Condición?}
    B -- Sí --> C[Proceso A]
    B -- No --> D[Proceso B]
    C --> E[Fin]
    D --> E
```

### Sequence Diagram (Interacciones API/Servicios)
```mermaid
sequenceDiagram
    participant User
    participant StandardAPI
    User->>StandardAPI: Request Data
    StandardAPI->>DB: Query
    DB-->>StandardAPI: Result
    StandardAPI-->>User: Response JSON
```

### Class Diagram (Estructura de Clases)
```mermaid
classDiagram
    class Build {
        +String id
        +Date createdAt
        +validate()
    }
```

### ER Diagram (Esquemas de Base de Datos)
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
```
