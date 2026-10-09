# Pali · Roadmap 2026

Roadmap del producto con fechas reales, acotado a 2026 (MVP). Eje horizontal = tiempo; eje vertical = filas (vertientes); cajitas con fecha de inicio y fin.

## Cómo abrirlo

Abrí `index.html` con doble clic. No necesita internet. Todo se guarda solo en el navegador (`localStorage`, clave `pali-roadmap-v3`); si venías de la versión anterior, tus filas y cajitas se pasan solas a fechas.

> Si abrís la página desde otro navegador o perfil, vas a ver los datos de ejemplo. Usá **Exportar** para guardar una copia y **Importar** para recuperarla.

### Aviso de memoria

El navegador da unos 5 MB, compartidos con el prototipo y otras páginas abiertas con doble clic. En el roadmap y en la leyenda hay un botón **Memoria** fijo en la esquina de arriba a la derecha de la cajita verde del encabezado. Está anclado a esa cajita: no flota ni sigue la pantalla cuando bajás. Al tocarlo se abre el detalle: total usado, cuánto es del roadmap, cuánto del prototipo, cuánto queda disponible y el botón para exportar una copia.

El punto de color del botón indica el estado:

- **Verde:** todo bien.
- **Ámbar, desde el 80%:** se está llenando; el detalle se abre solo una vez para avisarte.
- **Coral, al llenarse:** ya no se pueden sumar más cosas y el último cambio no se guardó. La página sube hasta el botón, el detalle queda abierto y el botón titila hasta que liberes espacio (exportar, borrar cajitas o notas largas, o restablecer los datos de ejemplo del prototipo) y toques "Volver a revisar".

## Qué podés hacer

- **Pantalla completa:** el botón redondo `‹` al borde de la barra lateral la oculta; `›` la vuelve a mostrar.
- **Línea de hoy:** línea coral vertical con la etiqueta "Hoy". Arriba se ve el avance del año y los días que faltan para cerrar 2026. **Ir a hoy** te lleva ahí.
- **Vistas:** Meses (agrupados por trimestre), Semanas (por mes) o Días. Es el mismo roadmap con otro nivel de detalle.
- **Arrastrar cajitas:** arrastrá una cajita para moverla en el tiempo o a otra fila. Estirá su borde izquierdo o derecho para cambiar el inicio o el fin.
- **Crear una cajita:** tocá un espacio vacío de una fila. En el formulario elegís el día de inicio y el de fin, la fila, la categoría y una duración rápida. En **Más detalles** podés cargar responsable, avance, enlace y notas.
- **Hitos:** una cajita que empieza y termina el mismo día se muestra como un rombo.
- **Agregar fila:** el `+` debajo de la última fila. Cada fila tiene un tipo (Hito o Vertiente de negocio); los tipos se editan en **Tipos de fila**. Pasá el mouse sobre una fila para subirla, bajarla o editarla.
- **Leyenda (página aparte, `leyenda.html`):** se abre desde **01 Leyenda** en la barra lateral. Solo para leer: las categorías de las cajitas (qué significa cada color y el borde punteado, y cuántas cajitas hay de cada una) y los otros elementos (rombo, línea de hoy, nombre de la fila, barrita de avance).
- **Editar leyenda:** sigue en el roadmap, con el botón **Editar leyenda**. Cambiás nombres, significados, colores y el estilo sólido o punteado, o sumás categorías nuevas.

## Diseño

Usa el design system del prototipo (`../mockup/css/main.css`): blanco, verde y negro, coral solo para marcar algo especial, IBM Plex. Lo propio de esta carpeta está en `css/roadmap.css`.

## Estructura

```
Roadmap/
├─ index.html            roadmap (línea de tiempo) y formularios
├─ leyenda.html          leyenda (solo lectura)
├─ css/roadmap.css       estilos de ambas páginas
└─ js/
   ├─ roadmap-store.js   datos (localStorage): filas, cajitas, categorías, tipos de fila
   ├─ roadmap-app.js     roadmap: dibujo, arrastre, vistas y formularios
   └─ leyenda-app.js     leyenda: muestra categorías y otros elementos
```

## Modelo de datos

- `rows`: `{ id, title, kindId, order }`
- `rowKinds`: `{ id, name }`
- `boxes`: `{ id, rowId, title, desc, start, end, categoryId, owner, progress, link, notes }` (fechas `AAAA-MM-DD`, el fin cuenta)
- `categories`: `{ id, name, color, style: "solid" | "dashed", meaning }`
- `prefs`: `{ view, sidebarCollapsed }`

No se modificó nada fuera de esta carpeta.
