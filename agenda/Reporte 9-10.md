# Reporte 9/10

Notas de la jornada (la sesión siguió hasta el 11/10). Lo marcado como **propuesta** o **a confirmar** no es decisión.

---

## 1. Decisiones de negocio

- **Regla de diseño para todo el producto:** los campos obligatorios llevan un **asterisco (`*`)** y los opcionales **no llevan ninguno**. Al agregar un campo a cualquier pantalla se define primero si es obligatorio u opcional.
  - Persona: obligatorios nombre, apellido, teléfono y categoría. Opcional: alias (conserva el texto "(opcional)").
  - Login: email y contraseña. **Se sacó el asterisco del login** más adelante.
  - Configuración: precio por jugador y nombre de la cancha nueva (**propuesta**).
  - Reservar un turno: "Persona" **no lleva asterisco**; sumar al menos una persona es un paso del flujo.
- **Cobro por jugador, no por turno:** el importe es **personas anotadas × precio por jugador**. El pago se hace en caja y no se registra por turno. Cobros muestra una **estimación** (turnos no cancelados hasta hoy).
- **Canchas:** tienen estado **activa / inactiva** (la inactiva no aparece en la agenda ni la sugiere el chatbot). **Solo el equipo de Pali agrega canchas**; el club solo las activa o desactiva.
- **Promos y descuentos** en Configuración: precio fijo por jugador o % de descuento para ciertos turnos (por ejemplo el último de la noche). Si aplican varias, **gana la de menor precio**.
- **Parámetros de los turnos** en Configuración: duración (hoy 1 h 30), primer y último turno, personas por turno (hoy 4).
- **Identidad y tono:**
  - El jugador **nunca ve a Pali**; el chatbot habla con la **identidad del club**. La personalización por club sobre una base común queda **a confirmar**.
  - El club gana más presencia en el backoffice (marca blanca, **a definir**).
  - Tono **directo, amigable y cordial**, sin formalismos (voseo, español de Argentina).
  - Dirección visual: **moderna, mínima y con razón de ser**, pensada para crecer a otros deportes y clubes.
- **Cobros sin tabla de períodos:** al tocar una barra se abre el detalle de reservas de ese día, semana o mes. El detalle **no se cierra**: al cambiar de barra o de vista se actualiza. Sin filtros Próximas/Pasadas/estado ni botón Cancelar, y sin canceladas (ese estado todavía no existe).
- **Estado en las reservas de Cobros:** se muestra solo "Reservado" (sin "2 de 4") o "Completo".
- **Ocupación** (viñeta del gráfico): turnos con al menos 1 persona sobre turnos disponibles de las canchas activas, solo días ya transcurridos (**propuesta**).
- **Variación en Cobros:** contra el mismo tramo del período anterior (ayer, misma semana, mismo día del mes) (**propuesta**).
- **Paginación:** 10, 20, 50 o 100 por página, 10 por defecto (**a confirmar**).

---

## 2. Backend y arquitectura de datos

- Endpoints candidatos agregados o ajustados: `GET /people` con `q`, filtros y paginación (`page`, `pageSize` → `items, total, totalPages`), `GET /income` (ahora con **ocupación** por período), `GET /income/summary`, `GET /bookings?from=&to=` para el detalle de Cobros.
- **Recomendación para producción con muchos jugadores:** el filtrado inline pasa a ser **búsqueda en el servidor** (con debounce, índices y paginación); no se filtra todo en el navegador. Una base por club.
- Sin cambios en el modelo de datos más allá de lo anterior.

---

## 3. Mejoras del prototipo

### Formularios y login
- Asterisco en los campos obligatorios, **más pegado al título y a la misma altura** en todas las pantallas (máscara centrada en la altura de las mayúsculas). Componente general `req`.
- Configuración **valida** los campos obligatorios ("Falta completar el campo X: es obligatorio"). "Nombre de la nueva cancha" tiene título propio.
- Login: sin asterisco, con `aria-invalid` y `role="alert"` en los errores.

### Alineación
- La leyenda de la agenda (Libre, Reservado, Completo) se alineó con el encabezado, también en pantallas angostas (tres pasadas).

### Personas
- Tabla con **137 personas de ejemplo**, filtros, columnas elegibles (botón de ícono con desplegable que **marca las no ocultables**) y ficha del jugador.
- **Buscador único que filtra mientras se escribe** (debounce de 180 ms), con atajo "Crear persona “texto”".
- **Paginación** de servidor simulado: "Mostrar 10 / 20 / 50 / 100 por página" arriba a la izquierda, botón de columnas a la misma altura a la derecha, rango "1–10 de N" y Anterior / números / Siguiente abajo.
- **Loader** (filas de relleno con brillo) al cambiar de página o filtro.
- Se quitó el label "137 jugadores" y el botón de columnas quedó solo con ícono.

### Configuración
- Precio por jugador, parámetros de turnos, canchas activas/inactivas (alta solo por el equipo de Pali) y **promos** con alta, edición, activar/desactivar y eliminar con confirmación. Vista previa de precios del día.

### Cobros (rediseño)
- **Panel de caja** (`hero`) con la cifra del mes, su variación y, al costado, **Hoy** y **Esta semana** con su variación.
- Gráfico con eje, **línea de promedio**, **pico** y viñeta al pasar el mouse: período, importe, variación vs. anterior y **mini barra con % de ocupación**.
- Estados de **carga, vacío y error** (con reintentar).
- **Botón del ojo** para ocultar los importes (se reemplazan por `$ *******`, eje `***`); se recuerda en el navegador. Las variaciones en % siguen visibles.
- **Detalle de reservas** al tocar una barra: tabla igual a la de Reservas (Día, Hora, Cancha, Personas, Estado), con loader, paginado y selector de cantidad por página. `reservas.html` **no se tocó**.
- "Hoy" y "Esta semana" en **lavanda claro** (buen contraste sobre el verde) y **sin el guión** de la izquierda.

### Componentes nuevos al sistema
- `icon-btn` (botón de ícono), `skel` (loader), `delta` (variación con ▲▼ y texto), `hero`, `state` (vacío/error), `hero-eye`, paginación (`pager`), `chip--sky`, `chip--lav`, `chip--lav-solid`, `kpi--sky`, `kpi--lav`, `kicker--lav`.

### Colores secundarios en el backoffice (propuesta)
- **Azul cielo** para datos e información: canchas jugadas, "Precio base", chip "Total" y línea de promedio de Cobros, ojito, tarjeta "Veces que jugó".
- **Lavanda**, más escasa, para detalles: categoría del jugador (Personas, ficha y Agenda), insignia "Promo", etiqueta "Pico", título "Promos y descuentos".
- Criterio: el verde predomina; solo chips, líneas y números, nunca fondos grandes; la dosis se decide a ojo. Ninguno se usa para cancelar.
- **Tema oscuro:** el azul (`#8CC4F2`) y la lavanda (`#B8ACEC`) suben de tono para mantener el contraste.

---

## 4. Documentación y herramientas

- `DESIGN-SYSTEM.md` (ahora en `Diseño/`): principio 7, secciones de datos y colores secundarios, filas de componentes nuevos, accesibilidad.
- `CONTEXTO.md`: Cobros, secundarios, ocupación, paginación, reglas para quien continúe.
- `docs/producto-reserva-canchas.html`: Configuración, `price_rule`, paginación, búsqueda, Cobros e identidad; **nuevas preguntas en la sección 08** (default de paginación y otras listas, base de comparación de Cobros, cálculo de ocupación, alcance de la personalización del chatbot, identidad del club en el backoffice, logo para otros deportes).
- **Skill UI/UX Pro Max** instalada desde `herramientas/ui-ux-pro-max` como consultora (no reemplaza el sistema de Pali).

### Manual de marca (`Diseño/`)
- Se creó el **Manual de marca Pali** (pptx y pdf): usos y no usos, colores primarios y secundarios, paleta, tipografía, logo claro y oscuro.
- Tres versiones: v1 (genérica), v2 (editorial) y **v3 actual, 34 diapositivas**, con lenguaje propio basado en la cancha, la pelota y la grilla de turnos. Las anteriores están en `Diseño/anteriores/`.
- Se actualizó con la diapositiva "Dónde viven el azul y la lavanda", la pantalla de producto con chips secundarios y la nueva lista de pendientes.
- Logo: pelota + "Pali" en IBM Plex Sans SemiBold; versiones claro, oscuro, negro y blanco en `Diseño/logo/` (SVG).

---

## 5. Pendiente

- **Probar en pantalla** (no hubo navegador en el entorno): tema oscuro, animaciones, menú de usuario, login, tabla y ficha de Personas, promos de Configuración, Cobros completo (panel, ojito, viñeta, detalle) y los chips azul y lavanda.
- Confirmar con el club: obligatoriedad de precio y nombre de cancha, default de paginación, base de comparación y cálculo de ocupación en Cobros, alcance de la personalización del chatbot, identidad del club en el backoffice y logo para otros deportes.
- Manual de marca: validar logo claro (pelota verde), medidas de respeto y tamaño mínimo, corregir el contraste del gris de apoyo (4,47 : 1) y del coral con texto blanco (3,7 : 1), y confirmar la dosis de azul y lavanda.
- El detalle de Cobros de un mes aún se pagina en el navegador (en producción, en el servidor).
- Versión del manual para impresión (CMYK) y uso en redes.
