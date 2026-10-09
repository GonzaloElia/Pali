# Reporte 8/10

Resumen de la jornada: estrategia para el primer cliente, definiciones de negocio, backend y mejoras del prototipo. Lo marcado como **propuesta** no es decisión.

---

## 1. Decisiones de negocio

### Estados del turno (por cantidad de personas)
- **Libre = 0 personas.**
- **Reservado = 1 a 3 personas.**
- **Completo = 4 personas.**
- Cancelado se guarda aparte y el horario vuelve a Libre.
- Se **elimina el estado "abonado"** de la visual: el club cobra en caja y no registra el pago en la app.
- Consecuencia: **un turno no se reserva vacío**. Exige al menos 1 persona. Esto reemplaza la definición anterior de "crear turnos sin personas".
- Si se quita a la última persona, el turno vuelve a Libre y la reserva se libera.

### Pagos
- El pago en caja **no se marca en la aplicación**.
- El campo "abonó" **existe igual en la base** (por jugador), pero como **campo opcional**: vacío = "no se registra".
- Se descartó dejarlo siempre en verdadero: afirmaría pagos que nadie registró y falsearía reportes cuando haya Mercado Pago.
- **Propuesta:** un `setting` por club (`track_payments`) activa o apaga la visual sin cambiar el esquema.
- **Cobros** pasa a ser una **estimación**: turnos no cancelados × precio del turno (propuesta, a confirmar).

### Personas
- **Campos obligatorios: nombre, apellido, teléfono y categoría.** Obligatorio es obligatorio: si falta uno, el formulario no avanza y avisa cuál falta.
- **Categoría:** lista cerrada 1ra, 2da, 3ra, 4ta, 5ta, 6ta, 7ma y 8va. Puede variar según el club y el deporte.
- **Alias: opcional.** Distingue a dos personas con el mismo nombre y apellido. Se muestra como "Juan Pérez (alias)".
- **Teléfono:** confirmado como dato a pedir y obligatorio.

### Primer cliente
- Hoy **no hay ningún club contactado**.
- Estrategia: ofrecer ser **cliente co-creador**. El club usa el producto gratis mientras se construye, decide qué entra primero y, a cambio, da una reunión semanal, uso real y testimonio.
- Scrum con el cliente adentro: Gonza como Product Owner, Ivan en desarrollo, el dueño del club en la revisión de cada sprint.
- Orden de contacto: entorno cercano, clubes donde se juega, visitas en persona; Instagram y WhatsApp como último recurso.
- Primera conversación: **escuchar, no vender**. La demo con el prototipo viene después.
- **No construir el chatbot** hasta tener un club comprometido.
- Plan de 13 pasos y metas de arranque: 15 clubes contactados, 5 conversaciones, 1 acuerdo (estimaciones, no datos medidos).

### Regla de trabajo
- Las **dudas viven solo en el HTML de documentación** (sección 08). Las definiciones también se reflejan en `CONTEXTO.md` y `DESIGN-SYSTEM.md`.

---

## 2. Backend y arquitectura de datos

- Nueva **sección 05 · Backend** en el HTML de producto: reglas de diseño, DER, detalle de campos y tablas con datos de ejemplo. Renumeré Financiero (06), Prototipo (07) y Preguntas (08).
- Regla: lo que usa solo algún club es **campo opcional** (vacío = "no se registra"); lo que cambia entre clubes va en `setting`, no en el esquema.
- Regla: lo obligatorio es obligatorio.
- Tablas: `sport`, `category`, `court`, `court_attribute`, `setting`, `person`, `booking`, `booking_participant`, `payment`, `staff_user`.
- La cantidad para un turno completo sale del deporte (`sport.players_required`, paddle = 4).
- `category` es una tabla por deporte. `person.category_id` y `person.whatsapp_phone` son obligatorios; `person.alias` es opcional.
- `booking` siempre tiene al menos una persona. `booking.price` guarda el precio al reservar (propuesta).
- El estado del turno **se calcula** contando personas, no se guarda: solo se guarda activa o cancelada.
- Endpoints candidatos nuevos: `GET /categories`, `GET /people/:id`, `PATCH /people/:id`.

---

## 3. Mejoras del prototipo

### Agenda y turnos
- Estados Libre / Reservado / Completo con "2 de 4 personas" en cada celda y leyenda por cantidad de personas.
- Se sacó el checkbox "Abonó en caja" y el bloque de estado dentro del modal.
- "Reservar" exige al menos una persona y avisa si no hay ninguna.
- Máximo 4 personas por turno.
- Reservas: filtros Todas / Incompletas / Completas / Canceladas.
- "Persona (opcional)" pasó a "Persona"; "Listo" pasó a "Aceptar".

### Crear y editar personas
- Formulario con Nombre, Apellido, Teléfono, Alias (opcional) y Categoría.
- Placeholder del teléfono: "Ej: 2284-363702", sin la etiqueta "a confirmar".
- **Validación formal** de obligatorios: marca el campo en coral, avisa "Falta completar el campo X: es obligatorio" y suma un resumen.
- El formulario **reemplaza** el buscador, la lista y los botones del turno, en vez de apilarse.
- Botones a la derecha: **Cancelar** (estilo neutro nuevo) y **Agregar**, del mismo tamaño que los del pie del modal.
- Cada persona del turno muestra una **etiqueta de categoría** y un **lápiz para editar el perfil**, a la izquierda de "Quitar".
- El buscador muestra la categoría de cada persona y permite crear una persona aunque ya exista otra con el mismo nombre.
- **Formularios:** títulos más pegados a su campo (4 px) y más separación entre campos (20 px); todos los campos con la misma altura, así Alias y Categoría quedan en el mismo eje.

### Menú lateral y sesión
- **Pestañas reordenadas:** Cobros, Agenda, Personas, Reservas, Configuración.
- El menú sale de un solo archivo (`js/nav.js`): orden y nombres se cambian en un único lugar, porque los nombres van a cambiar.
- **Menú de usuario** al pie del sidebar: muestra el rol (Administrador) y el email, y al abrirlo ofrece **Cerrar sesión**, que vuelve al login.
- **Ocultar menú** pasó a un ícono chico arriba a la derecha del sidebar (propuesta de ubicación, falta tu visto bueno).

### Login (simulado)
- Pantalla nueva `login.html` en dos paneles, con el verde del producto: panel claro a la izquierda y degradé verde con la tarjeta a la derecha.
- Email y contraseña obligatorios con aviso formal; también entra con "Ingresar con Microsoft" (con los colores de Microsoft) y "¿Olvidaste tu contraseña?" es simulado.
- **Siempre en tema claro**, sin opción de oscuro.
- Todo es mock: no hay autenticación real.

### Aspecto general
- **Ocultar la barra lateral:** el contenido se redistribuye al ancho completo y el estado se recuerda.
- **Tema oscuro** con animación de onda circular desde el clic, más un anillo. Se guarda la elección y, si no hay, sigue el tema del sistema.
- Tokens nuevos para sostener el modo oscuro (`--surface`, `--fill-dark`).

---

## 4. Documentación actualizada

- `docs/producto-reserva-canchas.html`: sección Backend, estados por cantidad de personas, categoría, alias, teléfono obligatorio y preguntas nuevas.
- `CONTEXTO.md` y `DESIGN-SYSTEM.md`: estados, categoría, alias, obligatorios, tema oscuro, barra lateral, menú de usuario y login.
- `mockup/README.md`: métodos nuevos de la capa de datos.
- Nueva carpeta `agenda/` con este reporte.

---

## 5. Pendiente para mañana

- **Sin verificar en pantalla** (no tuve forma de renderizarlos): tema oscuro y su animación, ocultar menú, menú de usuario, login y los ajustes de espaciado de los formularios. Hay que abrirlos y probarlos.
- Confirmar la nueva ubicación del botón de ocultar menú.
- Preguntas abiertas nuevas, en la sección 08 del HTML:
  - qué pasa al quitar a la última persona de un turno, y cómo cuenta quien reserva por el chatbot;
  - qué categoría se asigna a quien reserva por el chatbot si no está en la base;
  - si el precio del turno es por cancha o se reparte entre jugadores;
  - qué muestra Cobros sin registro de pago;
  - si la categoría va por persona o por persona y deporte;
  - si se valida nombre + apellido + alias repetidos;
  - si `paid` queda opcional (a confirmar con Ivan).
- Los nombres de las pestañas (Cobros, Personas) van a cambiar: se editan en `js/nav.js`.
- Primer paso de la estrategia: preguntar a 5 conocidos que jueguen pádel quién administra su club.
