---
name: local-time
description: >
  Obtiene la hora exacta del sistema local mediante scripts multiplataforma.
  Trigger: Cuando el usuario pregunta por la hora, fecha, timestamp, o necesita
  sincronizar acciones con el tiempo actual del sistema.
license: MIT
metadata:
  author: mapplics
  version: "1.0"
allowed-tools: Bash, PowerShell
---

# Local Time

> "El tiempo es la medida del cambio." — Aristóteles

## Cuándo Usar

Activa este skill cuando:
- El usuario pregunta "¿qué hora es?" o similar
- Necesitas sincronizar acciones con la hora actual
- Debes registrar timestamps en logs o archivos
- El usuario pide información de zona horaria

**No usar cuando:**
- La hora ya fue proporcionada en el mensaje del sistema (ver metadata)

---

## Scripts Disponibles

Este skill proporciona scripts multiplataforma para obtener la hora del sistema.

### Linux/macOS (Bash)

```bash
# Ejecutar script
./skills/local-time/scripts/get_time.sh [formato]
```

### Windows (PowerShell)

```powershell
# Ejecutar script
.\skills\local-time\scripts\get_time.ps1 [formato]
```

---

## Formatos Disponibles

| Formato | Ejemplo | Uso |
|---------|---------|-----|
| `iso` | `2026-02-06T15:40:50-03:00` | Logs, APIs, timestamps completos |
| `time` | `15:40:50` | Hora simple |
| `date` | `2026-02-06` | Fecha ISO |
| `datetime` | `2026-02-06 15:40:50` | Fecha y hora legible |
| `unix` | `1770424850` | Epoch timestamp |
| `full` | Todas las anteriores | Información completa |

---

## Árbol de Decisiones

```
¿Usuario pregunta por hora/fecha/timestamp?
├── SÍ → ¿Qué formato necesita?
│   ├── No especificado → Usar formato `iso`
│   ├── Solo hora → Usar formato `time`
│   ├── Solo fecha → Usar formato `date`
│   ├── Timestamp numérico → Usar formato `unix`
│   └── Todo → Usar formato `full`
└── NO → No usar este skill
```

---

## Ejemplos de Uso

### Obtener hora ISO (por defecto)

```bash
# Linux/macOS
./skills/local-time/scripts/get_time.sh iso

# Windows PowerShell
.\skills\local-time\scripts\get_time.ps1 iso
```

**Salida:** `2026-02-06T15:40:50-03:00`

### Obtener solo la hora

```bash
./skills/local-time/scripts/get_time.sh time
```

**Salida:** `15:40:50`

### Obtener timestamp Unix

```bash
./skills/local-time/scripts/get_time.sh unix
```

**Salida:** `1770424850`

### Obtener información completa

```bash
./skills/local-time/scripts/get_time.sh full
```

**Salida:**
```
ISO:      2026-02-06T15:40:50-03:00
Date:     2026-02-06
Time:     15:40:50
DateTime: 2026-02-06 15:40:50
Unix:     1770424850
Timezone: America/Argentina/Buenos_Aires
UTC Offset: -03:00
```

---

## Tabla de Referencia Rápida

| Pregunta del Usuario | Formato | Comando |
|---------------------|---------|---------|
| "¿Qué hora es?" | `time` | `get_time.sh time` |
| "¿Cuál es la fecha?" | `date` | `get_time.sh date` |
| "Dame el timestamp" | `unix` | `get_time.sh unix` |
| "¿Qué hora es en formato ISO?" | `iso` | `get_time.sh iso` |
| "Dame toda la info de tiempo" | `full` | `get_time.sh full` |

---

## Comportamiento del Agente

Cuando trabajes con este skill:

1. **Detectar**: Identifica si el usuario pregunta por hora/fecha/timestamp
2. **Elegir formato**: Selecciona el formato más apropiado según el contexto
3. **Ejecutar**: Usa el script correspondiente a la plataforma
4. **Reportar**: Comunica el resultado de forma clara

### Notas Importantes

- Prefiere el formato `iso` para logs y registros
- El script detecta la zona horaria automáticamente
- En Windows, asegúrate de que PowerShell permita ejecución de scripts
 
  
   
