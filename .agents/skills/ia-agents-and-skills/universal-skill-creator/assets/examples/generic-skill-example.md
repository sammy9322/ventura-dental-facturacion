# Ejemplo: Skill Genérico Completo

Este es un ejemplo funcional de un skill genérico basado en el estilo 
del repositorio **clean-code-skills**.

---

## El Skill

```markdown
---
name: python-naming
description: >
  Enforces Python naming conventions and best practices.
  Trigger: When writing or refactoring Python code, or when naming 
  variables, functions, classes, or modules.
license: MIT
metadata:
  author: ejemplo
  version: "1.0"
---

# Python Naming Conventions

> "There are only two hard things in Computer Science: cache invalidation 
> and naming things."
> — Phil Karlton

## Cuándo Usar

Activa este skill cuando:
- Escribas nuevo código Python
- Refactorices código existente
- Revises nombres de variables, funciones, clases
- El código tenga nombres poco claros o inconsistentes

---

## Patrones Críticos

### PEP 8 Naming Conventions

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Módulos | snake_case | `my_module.py` |
| Clases | PascalCase | `MyClass` |
| Funciones | snake_case | `my_function()` |
| Variables | snake_case | `my_variable` |
| Constantes | SCREAMING_SNAKE | `MAX_SIZE` |
| Métodos privados | _prefijo | `_internal_method()` |
| Variables "internas" | _prefijo | `_cache` |

---

## Árbol de Decisiones

\`\`\`
¿Qué estoy nombrando?
│
├── Clase → PascalCase
├── Función/Método → snake_case
├── Variable local → snake_case (breve si scope pequeño)
├── Constante → SCREAMING_SNAKE_CASE
├── Módulo/Package → snake_case (corto, sin guiones)
└── Variable de instancia → snake_case, descriptivo
\`\`\`

---

## Ejemplos de Código

### ❌ Nombres Problemáticos

\`\`\`python
# MAL: Nombres poco descriptivos
def calc(d, f):
    x = []
    for i in d:
        if f:
            x.append(i * 1.0825)
    return x

# MAL: Inconsistencia de estilo
class userAccount:  # Debería ser PascalCase
    def GetBalance(self):  # Debería ser snake_case
        return self.userBalance  # Redundante
\`\`\`

### ✅ Nombres Claros

\`\`\`python
# BIEN: Nombres descriptivos
TAX_RATE = 0.0825

def calculate_taxed_values(
    values: list[float], 
    apply_tax: bool = False
) -> list[float]:
    """Calculate values with optional tax applied."""
    if not apply_tax:
        return values
    return [value * (1 + TAX_RATE) for value in values]

# BIEN: Consistencia y claridad
class UserAccount:
    def get_balance(self) -> Decimal:
        return self._balance
\`\`\`

---

## Reglas Detalladas

### N1: Elige nombres descriptivos

**Principio**: El nombre debe revelar intención sin necesidad de comentarios.

\`\`\`python
# MAL
d = 7  # días

# BIEN
days_until_expiration = 7
\`\`\`

### N2: Evita abreviaciones

**Principio**: La claridad supera la brevedad.

\`\`\`python
# MAL
def calc_avg(vals):
    return sum(vals) / len(vals)

# BIEN
def calculate_average(values: list[float]) -> float:
    return sum(values) / len(values)
\`\`\`

### N3: Usa nombres pronunciables

**Principio**: Si no puedes decirlo en voz alta, es mal nombre.

\`\`\`python
# MAL
class DtaRcrd102:
    genymdhms: datetime

# BIEN
class CustomerRecord:
    generation_timestamp: datetime
\`\`\`

### N4: Longitud proporcional al scope

**Principio**: Scope pequeño → nombre corto. Scope grande → nombre descriptivo.

\`\`\`python
# BIEN: i es aceptable para loops cortos
for i in range(10):
    print(i)

# BIEN: nombre descriptivo para scope mayor
active_user_count_this_month = calculate_monthly_active_users()
\`\`\`

---

## Comandos Comunes

\`\`\`bash
# Verificar naming con pylint
pylint --disable=all --enable=C0103 my_module.py

# Verificar con flake8
flake8 --select=N my_module.py
\`\`\`

---

## Comportamiento del Agente

Cuando trabajes con código Python:

1. **Verificar nombres**: Revisar si los nombres revelan intención
2. **Aplicar PEP 8**: Usar las convenciones correctas según el tipo
3. **Refactorizar oportunísticamente**: Si tocas código con mal naming, mejóralo
4. **Reportar cambios**: Indicar qué nombres se mejoraron

### Ejemplo de Reporte

\`\`\`markdown
✅ Tarea completada

🔧 Naming mejorado:
- `d` → `days_until_deadline` (N1: descriptivo)
- `calc()` → `calculate_total_price()` (N2: sin abreviar)
- Variables `x, y, z` → `width, height, depth` (N1: descriptivo)
\`\`\`

---

## Recursos

- **PEP 8**: https://pep8.org/
- **Google Python Style Guide**: https://google.github.io/styleguide/pyguide.html
```

---

## Notas del Ejemplo

Este skill demuestra:

1. **Frontmatter completo** con trigger específico
2. **Tabla de referencia rápida** para consulta
3. **Árbol de decisiones** visual
4. **Ejemplos ❌/✅** comparativos
5. **Reglas numeradas** (estilo Clean Code)
6. **Comandos prácticos** para verificación
7. **Instrucciones para el agente** claras
8. **Sin referencias a proyecto específico** (genérico)
