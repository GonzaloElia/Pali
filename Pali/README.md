# Pali

Backoffice para administradores de clubes y **chatbot de WhatsApp** para alquilar canchas, sobre una base de datos que se consulta antes de ofrecer cualquier turno.

> **Estado:** en definición. Hay un prototipo navegable del backoffice con datos simulados. Todavía no existe backend, base de datos real ni chatbot.

---

## Qué es

Pali tiene dos caras:

- **Backoffice del administrador.** Agenda de turnos, reservas, personas, cobros y configuración del club. El flujo principal es reservar un turno en pocos clics, pensado para clubes que hoy anotan todo a mano.
- **Chatbot de WhatsApp** *(propuesto, aún sin diseñar)*. La persona alquila una cancha conversando. Antes de ofrecer opciones, el chatbot consulta en la base de datos qué turnos están disponibles.

Hoy se piensa para **un club específico** y el deporte es **paddle**. La arquitectura se diseña para sumar otros clubes y otros deportes (fútbol, tenis) sin rehacer el esquema.

---

## Conceptos clave

### Turnos
- Duración de **1 h 30 min** (es un parámetro del club, puede cambiar).
- Se alquilan **todos los días**. El último turno empieza a las 22:30 y el primero cae cerca de las 11:00 (grilla de 9 turnos por cancha y por día).

### Estados del turno
Se calculan por cantidad de personas; no se guardan.

| Estado | Personas |
|---|---|
| **Libre** | 0 |
| **Reservado** | 1 a 3 |
| **Completo** | 4 |

Cancelado se guarda aparte y el horario vuelve a Libre. Un turno no se reserva vacío: exige al menos una persona.

### Personas
- Datos obligatorios: **nombre, apellido, teléfono y categoría**. Si falta alguno, el formulario no avanza y avisa cuál.
- **Categoría:** lista cerrada (hoy 1ra a 8va) que puede variar según club y deporte.
- **Alias:** opcional, para distinguir a dos personas con el mismo nombre y apellido. Se muestra como "Juan Pérez (alias)".

### Pagos
- En la primera versión el jugador **paga en caja**; la aplicación no marca quién abonó.
- El campo "abonó" existe en la base como **campo opcional** (vacío = "no se registra"), para cuando haya pago online o un club quiera registrarlo.

---

## Arquitectura de datos (propuesta)

- **Una base de datos por club**, con el mismo esquema. Los datos de un club no se comparten con otros.
- El **deporte es un dato**, no una estructura: sumar un deporte es agregar registros.
- Lo que usan solo algunos clubes es **campo opcional**; lo que cambia entre clubes va en configuración (`setting`), no en el esquema.
- La **disponibilidad se calcula** (parámetros menos reservas activas); no se guarda.
- **Capa de acceso a datos con un adaptador por motor**, para poder cambiar de base de datos. Motor inicial recomendado: PostgreSQL.
- Entidades: `sport`, `category`, `court`, `court_attribute`, `setting`, `person`, `booking`, `booking_participant`, `payment`, `staff_user`.

El detalle de campos, el DER y tablas de ejemplo están en la sección **05 · Backend** de [`docs/producto-reserva-canchas.html`](docs/producto-reserva-canchas.html).

---

## Prototipo del backoffice

HTML, CSS y JavaScript simples: **sin build, sin dependencias y sin internet** (las fuentes IBM Plex se cargan de Google Fonts si hay conexión; sin ella se usa una fuente del sistema).

### Cómo abrirlo
Abrí `mockup/login.html` (o `mockup/index.html`, el mapa de flujos) con doble clic.

- Los datos de ejemplo se guardan en el navegador (`localStorage`). Se restablecen desde **Configuración**.
- El login es simulado: con email y contraseña completos entra.

### Pantallas
| Pantalla | Qué resuelve |
|---|---|
| Cobros | Cuánto entró por día, semana y mes, con filtro por año (hoy estimado) |
| Agenda | Grilla de turnos por cancha y día; reservar en 2 clics |
| Personas | Buscador único, alta de persona e historial de canchas |
| Reservas | Reservas creadas, completas o incompletas, cancelar |
| Configuración | Precio del turno, parámetros y canchas |
| Login | Inicio de sesión simulado |

Los nombres de las pestañas son provisorios: se cambian en un solo lugar, `mockup/js/nav.js`.

### Pensado para conectarse a un backend
Las pantallas nunca tocan los datos directo: piden todo a `PaliApi` (`mockup/js/mock-api.js`). Cuando se definan los endpoints, cada método se reemplaza por una llamada real con la misma forma de respuesta y las pantallas no cambian. Los endpoints candidatos están en [`mockup/README.md`](mockup/README.md).

### Diseño
Paleta **blanco, verde y negro**, con tema claro y oscuro y barra lateral ocultable. Tokens y componentes documentados en [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

---

## Estructura del repositorio

```
Pali/
├─ README.md                        Este documento
├─ CONTEXTO.md                      Resumen vivo de todo lo definido
├─ DESIGN-SYSTEM.md                 Sistema de diseño
├─ docs/
│  └─ producto-reserva-canchas.html Documento de producto: alcance, backend, preguntas abiertas
├─ mockup/                          Prototipo navegable del backoffice
│  ├─ index.html                    Mapa de flujos
│  ├─ login · cobros · agenda · personas · reservas · configuracion .html
│  ├─ components.html               Galería de componentes
│  ├─ css/                          Tokens, base, layout y un archivo por componente
│  └─ js/                           mock-api.js (datos simulados) y nav.js (menú)
├─ Roadmap/                         Línea de tiempo 2026 (MVP)
└─ agenda/                          Reportes diarios de trabajo
```

---

## Documentación

| Documento | Para qué |
|---|---|
| [`docs/producto-reserva-canchas.html`](docs/producto-reserva-canchas.html) | Fuente de verdad del producto. Incluye las **preguntas abiertas** (sección 08) |
| [`CONTEXTO.md`](CONTEXTO.md) | Resumen de lo definido, para retomar rápido |
| [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | Colores, tipografía, componentes y patrones |
| [`mockup/README.md`](mockup/README.md) | Capa de datos simulada y endpoints candidatos |
| [`Roadmap/README.md`](Roadmap/README.md) | Cómo usar el roadmap |
| [`agenda/`](agenda/) | Un reporte por jornada: decisiones de negocio y mejoras del prototipo |

---

## Cómo se trabaja

- **No se inventan reglas de negocio.** Lo no definido va como pregunta abierta, solo en el documento de producto.
- Lo marcado como **propuesta** o **a confirmar** no es decisión.
- El detalle visual vive en el prototipo. El documento de producto cambia solo cuando cambia una regla de negocio o una definición técnica.
- Textos visibles en español de Argentina, con voseo y frases cortas. Clases CSS en inglés.

---

## Próximos pasos

- Conseguir un primer club como cliente co-creador y construir con él, en sprints cortos.
- Definir los endpoints a partir del prototipo y validar la arquitectura de datos con el equipo técnico.
- Elegir el primer corte del roadmap (se propone empezar por agenda, reservas y cobros) y recién después sumar el chatbot de WhatsApp.

---

## Equipo

| Persona | Rol |
|---|---|
| Gonza | BA, diseño y entendimiento del negocio |
| Ivan | Líder tecnológico |

---

## Licencia

Por definir.
