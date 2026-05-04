# Ejemplos Gherkin (BDD)

Este documento contiene ejemplos de redacción de Criterios de Aceptación utilizando la sintaxis Gherkin (Dado, Cuando, Entonces).

## 1. Validación de Login Múltiple (Happy y Sad Path)

**Escenario: Login Exitoso (Happy Path)**
**Dado** que el usuario "juan@example.com" existe con contraseña "12345"
**Y** su cuenta se encuentra activa
**Cuando** intenta iniciar sesión en la web con esas credenciales
**Entonces** el sistema debe redirigirlo a "/dashboard"
**Y** mostrar un mensaje de bienvenida "Hola, Juan"

**Escenario: Contraseña Incorrecta (Sad Path)**
**Dado** que el usuario "juan@example.com" existe
**Pero** ingresa una contraseña incorrecta "password_equivocado"
**Cuando** intenta iniciar sesión
**Entonces** el sistema debe permanecer en la página de login
**Y** mostrar un mensaje de error en rojo "Credenciales inválidas"

## 2. Lógica Comercial y Cálculos

**Escenario: Aplicar cupón de descuento válido**
**Dado** un carrito de compras con un total de $1000
**Y** un cupón "DTO20" que otorga un 20% de descuento
**Cuando** el cliente aplica el cupón en la página de Checkout
**Entonces** el total a pagar debe actualizarse a $800
**Y** debe aparecer una etiqueta "Descuento aplicado: -$200"

**Escenario: Cupón expirado**
**Dado** un carrito de compras
**Y** un cupón "BLACKFRIDAY" cuya fecha de expiración pasó
**Cuando** el cliente intenta aplicarlo
**Entonces** el total no debe cambiar
**Y** debe aparecer un mensaje de error "El cupón ha caducado"

## 3. Comportamiento UI (Modal/Popups)

**Escenario: Eliminación de registro con confirmación**
**Dado** que el usuario está viendo la lista de "Productos"
**Cuando** hace clic en el ícono de la "Papelera" del producto "Laptop"
**Entonces** debe aparecer un Modal de Confirmación titulado "¿Estás seguro?"
**Y** debe tener botones de "Cancelar" y "Eliminar"

**Escenario: Cancelar eliminación**
**Dado** que el Modal de Confirmación está abierto
**Cuando** el usuario hace clic en "Cancelar" o pulsa la tecla ESCAPE
**Entonces** el Modal debe cerrarse
**Y** la "Laptop" debe seguir existiendo en la lista de Productos.
