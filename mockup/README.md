# Pali · Prototipo navegable del backoffice

Referencia visual del backoffice del administrador. Pensado para llevarlo luego a endpoints reales sin tocar el diseño.

## Cómo abrirlo

Abrí `index.html` (doble clic, o en VS Code clic derecho → **Open with Live Server**). **No necesita internet**: las fuentes IBM Plex se cargan desde Google Fonts si hay conexión; sin ella se usa una fuente del sistema.

Los datos de ejemplo se guardan en el navegador (localStorage). Se restablecen desde **Configuración → Restablecer datos de ejemplo**.

## Estructura

```
mockup/
├─ index.html            mapa de flujos
├─ agenda.html           grilla de turnos y reserva en 2 clics
├─ reservas.html         reservas, pago y cancelación
├─ personas.html         buscador único e historial por cancha
├─ cobros.html           ingresos por día, semana y mes
├─ configuracion.html    precio por jugador, parámetros de turnos, promos y canchas activas o inactivas
├─ components.html       galería de componentes
├─ components/           markup de referencia por componente
├─ css/                  main.css · tokens · base · layout · components/
└─ js/mock-api.js        capa de datos simulada (PaliApi)
```

## Reglas del prototipo

- **HTML con el JavaScript dentro de cada página.** Sin librerías externas.
- **Estilos componetizados** en `css/`: `tokens.css`, `base.css`, `layout.css` y un archivo por componente en `css/components/`. Las páginas enlazan solo `css/main.css`.
- **Un único archivo JS:** `js/mock-api.js`, la capa de datos simulada y el único punto de contacto con los datos.
- **Paleta:** blanco, azul y negro. Ver `../Diseño/DESIGN-SYSTEM.md`.

## De prototipo a endpoints

Las pantallas llaman a `PaliApi`. Cada método devuelve una Promesa y se reemplaza por un `fetch()` con la misma firma y forma de respuesta. Los endpoints son **candidatos**, todavía no están definidos.

| Método `PaliApi` | Endpoint candidato | Lo usa |
|---|---|---|
| `getSettings()` | `GET /settings` | Configuración |
| `updateSettings(patch)` | `PATCH /settings` | Configuración |
| `listCategories({sport})` | `GET /categories?sport=` | Agenda, Personas |
| `listCourts()` | `GET /courts` | Configuración |
| `addCourt(name)` | `POST /courts` | Nadie: lo hace el equipo de Pali desde el back |
| `setCourtActive(id, active)` | `PATCH /courts/:id` | Configuración |
| `previewGrid(patch)` | — (se calcula en el cliente) | Configuración |
| `listPriceRules()` | `GET /price-rules` | Configuración |
| `savePriceRule(rule)` | `POST /price-rules`, `PATCH /price-rules/:id` | Configuración |
| `setPriceRuleActive(id, active)` | `PATCH /price-rules/:id` | Configuración |
| `deletePriceRule(id)` | `DELETE /price-rules/:id` | Configuración |
| `previewPrices({date})` | `GET /prices?date=` | Configuración |
| `listSlots({date})` | `GET /availability?date=` | Agenda |
| `listBookings({status,from,to})` | `GET /bookings` | Reservas |
| `getBooking(id)` | `GET /bookings/:id` | — |
| `createBooking(...)` | `POST /bookings` | Agenda |
| `addParticipant(id, personId)` | `POST /bookings/:id/participants` | Agenda |
| `removeParticipant(id, personId)` | `DELETE /bookings/:id/participants/:personId` | Agenda |
| `cancelBooking(id)` | `POST /bookings/:id/cancel` | Agenda, Reservas |
| `searchPeople(q)` | `GET /people?q=` | Agenda, Personas |
| `listPeople()` | `GET /people` | Personas |
| `createPerson(...)` | `POST /people` | Agenda, Personas |
| `getPerson(id)` | `GET /people/:id` | Agenda, Personas |
| `listPlayers({q, categoryId, courtId, from, to, page, pageSize})` | `GET /people/stats` | Personas. Devuelve `{items, total, page, pageSize, totalPages}`; `pageSize` 10, 20, 50 o 100 |
| `updatePerson(id, patch)` | `PATCH /people/:id` | Agenda |
| `getPersonHistory(personId)` | `GET /people/:id/history` | Personas |
| `getIncome({granularity,year})` | `GET /income` | Cobros |
| `getIncomeSummary()` | `GET /income/summary` | Cobros. Devuelve hoy, semana y mes más `prevToday`, `prevWeek` y `prevMonth` (mismo tramo del período anterior) |

Notas de diseño de datos que el prototipo ya respeta:

- **Una base por club, mismo esquema.** El prototipo muestra un solo club.
- **La disponibilidad se calcula**, no se guarda: parámetros de turno (`slotMinutes`, `lastSlotStart`) menos reservas activas.
- **La reserva guarda inicio y fin**, así un cambio futuro de duración no altera el historial.
- **Una reserva puede existir sin personas**; se suman después.
- **El pago es presencial hoy**; el modelo admite más métodos a futuro.

## Pendientes que afectan al prototipo

Datos obligatorios al crear un turno, datos de la persona (el teléfono está a confirmar), usuarios del backoffice y uso desde celular, precio exacto del turno. Ver `../CONTEXTO.md`.
