# Las 10 Heurísticas de Usabilidad de Nielsen

Referencia de evaluación para auditorías heurísticas. Cada heurística incluye descripción, señales de violación y ejemplos de buenas prácticas.

---

## 1. Visibilidad del Estado del Sistema

El sistema debe mantener siempre informados a los usuarios sobre lo que está ocurriendo, mediante retroalimentación apropiada en tiempo razonable.

**Señales de violación:**
- Sin indicador de carga en operaciones lentas
- El usuario no sabe en qué paso de un flujo multietapa se encuentra
- Sin confirmación visual al ejecutar una acción

**Buena práctica:**
- Progress bar en uploads/descargas
- Breadcrumbs en flujos multistep
- Toast de confirmación al guardar

---

## 2. Correspondencia entre el Sistema y el Mundo Real

El sistema debe hablar el lenguaje del usuario — palabras, frases y conceptos familiares — en lugar de términos orientados al sistema.

**Señales de violación:**
- Mensajes de error con códigos técnicos (ej: "Error 500")
- Nomenclatura interna del sistema expuesta al usuario
- Metáforas que no existen en el mundo real del usuario

**Buena práctica:**
- "Tu archivo está listo para descargar" en lugar de "Proceso completado exitosamente"
- Iconos universales (lupa = buscar, casa = inicio)

---

## 3. Control y Libertad del Usuario

Los usuarios eligen funciones por error con frecuencia y necesitan una "salida de emergencia" claramente marcada para dejar el estado indeseado sin pasar por diálogos extendidos.

**Señales de violación:**
- Sin botón "Cancelar" en modales o flujos
- No hay opción de deshacer acciones destructivas
- Flujos obligatorios sin posibilidad de salir

**Buena práctica:**
- Ctrl+Z / Deshacer
- "¿Seguro que quieres eliminar?" con opción de cancelar
- Botón X visible en todos los modales

---

## 4. Consistencia y Estándares

Los usuarios no deben tener que preguntarse si distintas palabras, situaciones o acciones significan lo mismo. Seguir convenciones de plataforma.

**Señales de violación:**
- Botón "Guardar" a veces verde, a veces azul, a veces en distintas posiciones
- El mismo término nombrado diferente en distintas pantallas
- Iconos con significados distintos en distintos contextos

**Buena práctica:**
- Sistema de diseño con componentes unificados
- Glosario de términos del producto
- Guía de estilo con posición estándar de CTAs

---

## 5. Prevención de Errores

Mejor que un buen mensaje de error es un diseño cuidadoso que evite que el problema ocurra.

**Señales de violación:**
- Formulario que acepta formatos inválidos sin advertencia previa
- Acción destructiva sin confirmación
- Botón de envío habilitado con campos requeridos vacíos

**Buena práctica:**
- Validación inline en tiempo real
- Deshabilitar botón "Enviar" hasta que el formulario sea válido
- Confirmación con descripción de consecuencias antes de eliminar

---

## 6. Reconocimiento antes que Recuerdo

Minimizar la carga de memoria del usuario haciendo visibles objetos, acciones y opciones. El usuario no debería tener que recordar información de una parte de la interfaz a otra.

**Señales de violación:**
- El usuario debe recordar un código o ID de una pantalla anterior
- Opciones de menú ocultas que el usuario debe memorizar
- Sin historial de búsquedas recientes

**Buena práctica:**
- Autocompletado con sugerencias recientes
- Mostrar resumen del carrito durante el checkout
- Breadcrumbs de navegación

---

## 7. Flexibilidad y Eficiencia de Uso

Los aceleradores — invisibles para el usuario novato — pueden acelerar la interacción del usuario experto, de modo que el sistema pueda atender tanto a usuarios inexpertos como experimentados.

**Señales de violación:**
- No hay atajos de teclado para acciones frecuentes
- No hay forma de personalizar la interfaz
- Un flujo de 10 pasos sin opción de "modo avanzado"

**Buena práctica:**
- Atajos de teclado (Cmd+S, Cmd+K)
- Plantillas para tareas repetitivas
- "Acciones recientes" o "Favoritos"

---

## 8. Estética y Diseño Minimalista

Los diálogos no deben contener información irrelevante o raramente necesaria. Cada unidad extra de información en un diálogo compite con la información relevante y disminuye su visibilidad relativa.

**Señales de violación:**
- Demasiados elementos en pantalla compitiendo por atención
- Texto legal extenso dentro de la UI principal
- Múltiples CTAs igual de prominentes en una misma vista

**Buena práctica:**
- Una acción principal por pantalla
- Jerarquía visual clara (H1 > H2 > body)
- Progressive disclosure: mostrar detalles solo cuando se necesitan

---

## 9. Ayudar a los Usuarios a Reconocer, Diagnosticar y Recuperarse de Errores

Los mensajes de error deben expresarse en lenguaje llano (sin códigos), indicar con precisión el problema y sugerir constructivamente una solución.

**Señales de violación:**
- "Ha ocurrido un error" sin más información
- Mensaje de error que no indica qué campo tiene el problema
- Error sin instrucción de cómo resolverlo

**Buena práctica:**
- "El email ingresado no es válido. Verifica que tenga el formato usuario@dominio.com"
- Resaltar en rojo el campo específico con el error
- Link a ayuda relevante cuando el error es complejo

---

## 10. Ayuda y Documentación

Aunque es mejor si el sistema puede usarse sin documentación, puede ser necesario proveer ayuda. Debe ser fácil de buscar, enfocada en la tarea del usuario, con pasos concretos.

**Señales de violación:**
- Sin opción de ayuda contextual
- Documentación genérica no relacionada con la tarea actual
- FAQ imposible de encontrar desde la UI

**Buena práctica:**
- Tooltips contextuales en campos complejos
- "?" inline que abre ayuda específica del módulo actual
- Chat de soporte accesible desde cualquier pantalla

---

## Escala de Severidad (Molich & Nielsen)

| Nivel | Descripción | Acción |
|-------|-------------|--------|
| **0** | No es un problema de usabilidad | Documentar y cerrar |
| **1** | Problema cosmético | Solo resolver si hay tiempo disponible |
| **2** | Problema menor | Baja prioridad en backlog |
| **3** | Problema mayor | Alta prioridad — impacta la tarea del usuario |
| **4** | Catástrofe de usabilidad | Resolver antes del lanzamiento |

---

**Fuente**: Nielsen, J. (1994). *Usability Engineering*. Morgan Kaufmann.
Más info: [https://www.nngroup.com/articles/ten-usability-heuristics/](https://www.nngroup.com/articles/ten-usability-heuristics/)
