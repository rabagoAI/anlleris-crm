# ANLLERIS — Guía de Usuario
### Sistema de Gestión de Stock · v1.0 · RABAGO AI

---

## Índice

1. [Primeros pasos](#1-primeros-pasos)
2. [Inventario](#2-inventario)
3. [Importar y exportar datos](#3-importar-y-exportar-datos)
4. [Alertas de reposición](#4-alertas-de-reposición)
5. [Pedidos a proveedor](#5-pedidos-a-proveedor)
6. [Panel de tareas](#6-panel-de-tareas)
7. [Historial de movimientos](#7-historial-de-movimientos)
8. [Informes](#8-informes)
9. [Proveedores](#9-proveedores)
10. [Mejoras previstas](#10-mejoras-previstas)

---

## 1. Primeros pasos

Al abrir la aplicación verás la pantalla de **Inventario** con la tabla vacía. El flujo normal de trabajo es:

1. **Importar el Excel** con el stock actual (solo la primera vez, o cuando haya un recuento completo).
2. A partir de ahí, **actualizar referencias** manualmente o volviendo a importar el Excel cuando haya cambios.
3. **Consultar, filtrar y exportar** según necesites.

La barra lateral izquierda te lleva a cada sección. Los números en color que aparecen junto a algunos menús son avisos rápidos:

| Color | Sección | Qué indica |
|-------|---------|------------|
| Rojo | Alertas | Referencias por debajo del stock mínimo |
| Naranja | Pedidos | Pedidos pendientes de recibir |
| Morado | Tareas | Tareas sin completar |
| Azul | Movimientos | Total de movimientos registrados |

---

## 2. Inventario

### Ver y buscar referencias

La tabla muestra todas las referencias con su estado de stock:

- **Con stock** (verde) — unidades iguales o superiores al mínimo establecido
- **Stock bajo** (naranja) — por debajo del mínimo o por debajo de 500 unidades si no hay mínimo definido
- **Sin stock** (rojo) — 0 unidades

Usa la barra de filtros para encontrar referencias rápidamente:

- **Buscador de texto** — escribe parte de la referencia o descripción
- **Proveedor** — filtra por un proveedor concreto
- **Estado** — muestra solo las referencias en un estado determinado
- **Categoría** — filtra por familia de producto (si has asignado categorías)

### Añadir una referencia manualmente

Haz clic en **Nueva referencia** (botón azul, arriba a la derecha). Rellena los campos:

- **Ref. Catalysis** *(obligatorio)* — código interno de la referencia
- **Ref. Proveedor** — código del proveedor si es diferente
- **Descripción** *(obligatorio)* — nombre o descripción del producto
- **Unidades** *(obligatorio)* — stock actual
- **Unidad de medida** — UND, KG, L, etc.
- **Proveedor** *(obligatorio)* — nombre del proveedor
- **Stock mínimo** — cantidad mínima antes de generar una alerta de reposición
- **Categoría** — familia del producto (estuches, frascos, cajas…). Al escribir, aparecen las categorías ya existentes para mantener coherencia
- **Fecha de recuento** — cuándo se contó físicamente este producto (formato DD/MM/YYYY)
- **Fecha de utilización** — fecha de caducidad o uso previsto
- **Notas** — observaciones libres

### Editar una referencia

Haz clic en el icono de **lápiz** en la fila correspondiente. Se abre el mismo formulario con los datos actuales. Cualquier cambio en las unidades quedará registrado automáticamente en el historial.

### Eliminar una referencia

Haz clic en el icono de **papelera**. La app pedirá confirmación antes de eliminar. Esta acción no se puede deshacer.

### Crear una tarea desde el inventario

Haz clic en el icono de **portapapeles** en cualquier fila para abrir el panel de tareas con esa referencia ya asociada. Útil para anotar cosas como "revisar este lote" o "devolver a proveedor".

---

## 3. Importar y exportar datos

### Importar desde Excel

Haz clic en **Importar Excel** (dentro de la sección Inventario) para desplegar el área de importación.

**Formato esperado del Excel:**
- Las cabeceras están en la fila 3
- Los datos empiezan en la fila 4
- Columnas: Ref. Catalysis · Ref. Proveedor · Descripción · Unidades · Unidad de Medida · Nombre Proveedor · Fecha recuento · Fecha utilización

Al importar con datos ya existentes, la app pregunta qué hacer:

- **Actualizar referencias existentes** *(recomendado)* — compara referencia por referencia. Solo modifica las que hayan cambiado. Conserva las categorías, stocks mínimos y notas que hayas introducido manualmente.
- **Reemplazar todo el inventario** — borra todos los datos actuales y carga el Excel completo. Úsalo solo si quieres empezar desde cero.

Tras la importación, aparece un resumen con cuántas referencias se han añadido, actualizado o mantenido sin cambios.

### Exportar a Excel

Haz clic en **Exportar Excel**. Se descarga un archivo `.xlsx` con el inventario actual. Si tienes filtros activos, solo se exportan las referencias visibles (la app te avisa del número).

### Exportar a PDF

Haz clic en **Exportar PDF**. Se abre un panel con opciones:

- **Título del informe** — texto que aparecerá en la cabecera del PDF
- **Orientación** — vertical u horizontal (horizontal recomendado para ver todas las columnas)
- **Incluir métricas** — añade un resumen de KPIs al inicio
- **Incluir referencias sin stock** — desmarca si solo quieres ver las que tienen stock

Si tienes filtros activos, el PDF también respetará esos filtros.

---

## 4. Alertas de reposición

La sección **Alertas** muestra todas las referencias cuyas unidades están por debajo del stock mínimo definido.

La tabla ordena las referencias por **urgencia**: primero las que más lejos están del mínimo (mayor déficit). Cada fila muestra:

- Referencia y descripción
- Unidades actuales
- Stock mínimo definido
- **Déficit** — cuántas unidades faltan para llegar al mínimo
- Estado visual (sin stock / stock bajo)

Desde esta pantalla puedes hacer clic en **Editar** para ajustar el stock mínimo o actualizar las unidades directamente.

El número rojo en el menú lateral indica cuántas referencias están en alerta en todo momento.

---

## 5. Pedidos a proveedor

### Crear un pedido

Haz clic en **Nuevo pedido**. El proceso tiene dos pasos:

1. **Selecciona el proveedor** — solo puedes pedir a un proveedor por pedido
2. **Añade líneas** — busca las referencias de ese proveedor y define cuántas unidades pedir

La app asigna automáticamente un número correlativo (P-001, P-002…).

Opcionalmente puedes indicar la **fecha esperada de recepción** y añadir notas al pedido.

### Estados de un pedido

| Estado | Significado |
|--------|-------------|
| Pendiente | Pedido creado, sin recibir |
| Parcial | Se ha recibido parte de las unidades |
| Recibido | Se ha recibido todo |
| Cancelado | Pedido anulado |

### Recepcionar un pedido

Cuando llegue la mercancía, haz clic en **Recepcionar** en el pedido correspondiente. Se abre un formulario con todas las líneas del pedido y las unidades pedidas ya rellenas. Puedes modificarlas si solo llega una parte. Al confirmar:

- Las unidades se suman automáticamente al stock de cada referencia
- El pedido pasa a estado **Recibido** o **Parcial** según lo que hayas introducido
- Queda un registro en el historial de movimientos

### Cancelar un pedido

Haz clic en **Cancelar pedido**. El pedido pasa a estado Cancelado y ya no aparece en los contadores activos. No modifica el stock.

---

## 6. Panel de tareas

El panel de tareas es un tablero **Kanban** con tres columnas: Pendiente, En curso y Completada.

### Crear una tarea

Haz clic en **Nueva tarea**. Campos disponibles:

- **Título** *(obligatorio)* — descripción breve de la tarea
- **Descripción** — detalle adicional
- **Prioridad** — Alta, Media o Baja
- **Fecha límite** — formato DD/MM/YYYY. Si se supera sin completar, la tarjeta se marca en rojo
- **Referencia asociada** — vincula la tarea a una referencia del inventario. Al seleccionarla, el proveedor se rellena automáticamente

### Gestionar tareas

Cada tarjeta tiene:

- **Botón de avance** (abajo a la derecha) — mueve la tarea a la siguiente columna con un clic
- **Lápiz** — editar la tarea
- **Papelera** — eliminar con confirmación

Las tareas se ordenan dentro de cada columna por prioridad (Alta primero) y luego por fecha de creación (más reciente arriba).

### Crear tareas desde el inventario

En la tabla de inventario, cada fila tiene un icono de portapapeles. Al hacer clic, se abre el formulario de nueva tarea con la referencia ya asociada.

---

## 7. Historial de movimientos

Cada vez que se modifica el stock — por importación, edición manual, creación, eliminación o recepción de pedido — se registra automáticamente un movimiento.

Puedes filtrar el historial por:
- **Texto** — busca por referencia, descripción o proveedor
- **Tipo** — Importación, Creación, Ajuste, Edición, Eliminación

Cada entrada muestra: fecha y hora, tipo, referencia, unidades antes y después, diferencia y notas.

Con el botón **Limpiar historial** puedes borrar todos los registros si el listado se vuelve demasiado largo. La app pide confirmación antes de hacerlo.

---

## 8. Informes

La sección de informes ofrece una visión global del inventario:

- **KPIs** — total de referencias, total de unidades, porcentaje con stock correcto y proveedor principal
- **Distribución por estado** — gráfico circular con la proporción de referencias en cada estado
- **Top proveedores** — gráfico de barras con los 10 proveedores que más unidades aportan al inventario
- **Distribución por categoría** — gráfico de barras con el número de referencias por familia de producto
- **Referencias obsoletas** — tabla con referencias cuya fecha de recuento supera los 2 años, indicando que pueden necesitar revisión o baja

---

## 9. Proveedores

Resumen agrupado por proveedor. Para cada uno muestra:

- Número de referencias
- Total de unidades
- Porcentaje de referencias sin stock (en rojo si supera el 50%)

Útil para detectar qué proveedor tiene más referencias en riesgo de rotura de stock.

---

## 10. Mejoras previstas

Las siguientes funcionalidades están planificadas para versiones futuras:

### Buscador con código de barras
Los lectores de código de barras de almacén funcionan como teclados: escanean y escriben el código automáticamente. Con un pequeño ajuste en el buscador, el operario podría apuntar la pistola a cualquier producto y ver su ficha al instante, sin teclear nada.

**Requisito previo:** confirmar qué código está impreso en las etiquetas físicas del almacén (Ref. Catalysis, Ref. Proveedor u otro) para asegurarse de que coincide con los datos del sistema.

### Impresión de etiquetas con código de barras
Generación de etiquetas en PDF con código de barras listo para imprimir desde la propia app. Útil para etiquetar nuevas referencias o reponer etiquetas dañadas.

### Multiusuario con login
Acceso con usuario y contraseña para que varios miembros del equipo puedan usar la app simultáneamente, con registro de quién hizo cada cambio. Requiere activar la base de datos Supabase que ya está preparada en el código.

### Sincronización en la nube
En la versión actual, los datos viven en la memoria del navegador y se pierden al cerrar o recargar la página. La activación de Supabase permitiría guardar todos los datos en la nube, acceder desde cualquier dispositivo y no depender de importar/exportar Excel para mantener los datos actualizados.

### Notificaciones automáticas de alerta
Envío de un correo o mensaje cuando una referencia caiga por debajo del stock mínimo, sin necesidad de entrar a la app a revisar.

### App móvil / vista adaptada
Optimización de la interfaz para tablets y móviles, especialmente útil para operarios que trabajan con tablet en el almacén.

---

*Documento generado por RABAGO AI · ANLLERIS Gestión de Stock v1.0*
