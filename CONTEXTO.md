# Pali · Contexto del proyecto

Última actualización: 2026-10-07. Documento vivo: se completa por iteraciones con lo que va definiendo el equipo. **Solo contiene lo definido por el equipo o propuestas marcadas como tales.**

## Qué es

Producto con dos caras:

- **Backoffice para el administrador** de un club.
- **Chatbot conversacional de WhatsApp** para que las personas alquilen una cancha.

Todo se guarda en una base de datos. **Antes de ofrecer opciones, el chatbot consulta en la base de datos qué turnos hay disponibles y a qué hora.**

Hay un competidor conocido: **Clubo**. La intención es proponer algo diferente. La comparación concreta con Clubo está pendiente.

## Alcance del prototipo actual

El prototipo en `mockup/` cubre **solo el backoffice** del administrador. El chatbot de WhatsApp queda fuera del diseño de pantallas por ahora; su definición sigue vigente en este documento.

- **Pantallas:** Cobros, Agenda (reservar en 2 clics), Personas, Reservas y Configuración, más un **Login simulado** (`mockup/login.html`: email y contraseña obligatorios, o Microsoft; no hay autenticación real). Al pie del menú lateral hay un desplegable con el rol (Administrador) y la opción **Cerrar sesión**, que vuelve al login.
- **Diseño:** tema claro y oscuro (botón arriba a la derecha, con animación de onda) y barra lateral que se puede ocultar. Paleta blanco, verde y negro (verde bosque `#0f3d2e`, verde de marca `#1f6f57`, menta, negro verdoso `#0d1f18`), coral solo para cancelar, IBM Plex. Inspirado en el caso Crezco de Behance; el verde alude al tenis y al paddle. Detalle en `DESIGN-SYSTEM.md`.
- **Técnica:** HTML con su JavaScript dentro de cada página, sin librerías, funciona sin internet. Los datos pasan por una capa simulada (`PaliApi`) pensada para reemplazarse por los endpoints reales cuando se definan; los endpoints son candidatos.
- **Mantenimiento:** este archivo y `docs/producto-reserva-canchas.html` se actualizan cada vez que cambia una definición, un costo o el diseño.

## Equipo

| Persona | Rol |
|---|---|
| Ivan | Líder tecnológico |
| Gonza | BA, diseño y entendimiento del negocio |

## Cliente y deporte

- Hoy se vende a **un club específico** y el deporte es **paddle**.
- Luego se ajustará el producto para venderlo a **otros clubes** y para **otros deportes** (fútbol, tenis, por ejemplo).
- Primer cliente: **2 canchas** (supuesto para los cálculos).
- **Estado comercial (2026-10-08): todavía no hay ningún club contactado.** El primer cliente está por conseguirse. Se pidió una estrategia de salida al mercado con Scrum.

## Turnos y horarios

- Cada turno dura **1 h 30 min**. Es un **parámetro**: hoy vale eso y puede cambiar.
- Se puede alquilar **todos los días**.
- El **último turno empieza a las 22:30** (termina a las 00:00).
- El primer turno cae **cerca de las 11:00**, contando cada 1 h 30 min hacia atrás desde las 22:30.
- Grilla resultante (derivada): 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00, 22:30 → **9 turnos por cancha y por día**.

## Funciones del backoffice (definidas)

- Gestionar y crear turnos. Un turno se reserva con **al menos 1 persona** y se pueden sumar las demás después, hasta 4. Un turno con 0 personas está Libre.
- Pestaña de **reservas ya creadas**: ver si el turno está **completo o incompleto** y **cancelar turnos**. No hay opción de “abonado”: el club cobra en caja y no registra el pago en la aplicación.
- **Estados del turno (3 en pantalla), por cantidad de personas:** Libre = 0 personas; Reservado = 1 a 3; Completo = 4. Cancelado se guarda aparte y el horario vuelve a Libre. Los estados se calculan, no se guardan.
- **Editar perfil desde el turno:** al lado de cada persona de un turno hay un ícono de lápiz que abre la edición de su perfil (nombre, apellido, alias, teléfono y categoría) sin salir del turno.
- **Campos obligatorios:** son obligatorios de verdad. Al crear o editar una persona, nombre, apellido, teléfono y categoría no pueden quedar vacíos: el formulario no avanza y avisa qué campo falta.
- **Alias de la persona** (opcional): sirve para distinguir a dos personas con el mismo nombre y apellido. Se puede crear la persona sin alias. Al sumar a un turno se muestra “Juan Pérez (alias)”.
- **Categoría de la persona** (**obligatoria**): se elige al crear la persona, junto con nombre y teléfono (el teléfono es obligatorio). En el turno, cada persona muestra una etiqueta con su categoría. Es una lista cerrada que depende del club y del deporte; hoy: 1ra, 2da, 3ra, 4ta, 5ta, 6ta, 7ma y 8va.
- Guardar la información de las **personas que se suman al evento**.
- **Buscador único** de personas: con nombre y apellido se busca; si existe se asigna a la cancha, si no se crea y se piden sus datos.
- Reconocer **en qué canchas jugó cada persona**.
- Apartado más administrativo de **cobros**: cuánto se cobró por **día, semana y mes**, con filtro por **año**.
- **Configuración**: el administrador carga el **precio del turno**. Un único precio, no varía por cancha ni por horario. Estimado en **7k** (a confirmar, moneda a confirmar).
- **Principio de diseño:** reservar desde el backoffice con **muy pocos clics**. Hoy los clubes anotan todo a mano; un paso a paso corto rompe la fricción de entrar a un sistema.
- Habrá un **roadmap**: no todo tiene por qué salir junto. Qué entra en la primera entrega está por definir.

## Chatbot y pagos

- Canal: **API de WhatsApp Business** (propuesta).
- El jugador puede **pedir turnos** y **cancelar** por el chatbot; el administrador cancela desde el backoffice.
- **Turno ya cancelado por el administrador:** el chatbot lee el estado del turno en la base de datos y, si está cancelado, responde “el turno ya fue cancelado”.
- **Aviso proactivo (propuesta, a definir):** cuando el administrador cancela, el sistema puede enviar un mensaje de WhatsApp a la persona. No necesita IA: es una regla que se dispara al pasar el turno a cancelado. Requiere teléfono, consentimiento y una plantilla aprobada por Meta. Costo ~0,026 USD por mensaje fuera de la ventana de 24 h (a confirmar); dentro de la ventana es gratis.
- Campos de reserva propuestos para esto: `contact_phone`, `cancelled_by`, `cancelled_at`.
- **Primera versión:** el jugador **paga en caja**. En la base de datos se carga el campo de pago presencial.
- **Roadmap (no prioritario):** el chatbot pregunta “¿pagás en caja o pagás online?”. Si es online se redirige a Mercado Pago u otra app de cobros; si no, pago presencial. Motivo de la baja prioridad: la gente suele pagar en caja y las apps cobran comisión por transacción.

## Modelo comercial

- Cuota mensual por cancha de paddle: **15.000 ARS**. Con 2 canchas: **30.000 ARS por mes**.
- Ingreso anual del primer cliente: 360.000 ARS.
- **Referencia de mercado (precios públicos, pueden estar desactualizados):** PadelBook 1 a 3 canchas $44.900/mes; CanchaYa desde $40.000/mes (hasta 3 canchas, pago anual); Complejo.ar 1 a 3 canchas $47.200/mes; Canchero $49.999/mes; ATC 40–50 USD/mes por 1 a 3 canchas; Reservalo 0 + 10% o $9.990/mes + 2%; Canchas Club 3% por transacción; Book Padel gratis. No se encontró información de Padelink, Quiero Jugar ni Clubo.
- Con 15k por cancha: 2 canchas = 30k (debajo del mercado), 3 canchas = 45k (en línea). El diferencial es el chatbot de WhatsApp. Precio final: a definir.

## Arquitectura de datos (propuesta, a validar con Ivan)

- **Una base de datos por club.** Los datos son del club y no se comparten con otros.
- **Mismo esquema** en todas las bases.
- El **deporte es un dato**, no una estructura (`sport`); sumar deportes no cambia el esquema. Atributos propios por deporte en `court_attribute`.
- Entidades: `sport`, `court`, `court_attribute`, `setting`, `person`, `booking`, `booking_participant`, `payment`, `staff_user`.
- Parámetros en `setting`: duración del turno (90 min), último turno (22:30), precio del turno, zona horaria.
- La **reserva guarda inicio y fin**. Una cancha no puede tener dos reservas activas en el mismo horario.
- La **disponibilidad se calcula** (parámetros menos reservas), no se guarda.
- **Capa de acceso a datos con un adaptador por motor**, tipos y consultas estándar, para poder cambiar de base de datos.
- **Registro de clubes** separado de los datos de los clubes: dice a qué base ir según el número de WhatsApp.
- Motores (recomendación a confirmar): **PostgreSQL** inicial; MySQL/MariaDB como primer adaptador adicional; SQL Server a pedido; SQLite solo para desarrollo y pruebas.

## Financiero (estimaciones, a confirmar)

Tipo de cambio supuesto: 1.500 ARS por USD. Ingreso del primer cliente: 30.000 ARS por mes.

| Escenario de base de datos | Costo USD/mes | Margen ARS/mes |
|---|---|---|
| Neon plan gratuito | 0 | 30.000 (100%) |
| Neon Launch, uso bajo | ~5,65 | ~21.525 (72%) |
| Amazon RDS PostgreSQL | ~14,30 | ~8.550 (29%) |
| Neon Launch, siempre encendida | ~19,43 | ~855 (3%) |

- Punto de equilibrio: la base puede costar hasta ~20 USD por mes con este cliente.
- Con 2 canchas son como máximo 6.570 reservas por año: el costo viene del cómputo, no del almacenamiento.
- **Rentabilidad con 30.000 ARS de ingreso (IA gratuita):** todo gratuito 100%; Neon bajo + 20 avisos de cancelación ~69% (margen ~20.745 ARS); con RDS ~26%; con recordatorio por plantilla en cada turno ~−1% (pérdida); peor caso ~−70%. El tope es ~550 plantillas por mes con Neon bajo.
- **Riesgo a verificar con Meta:** una fuente secundaria dice que desde el 2026-10-01 solo los primeros 1.000 mensajes de servicio por número y por mes son gratis. La documentación oficial leída no lo dice. Si fuera cierto, ~3.200 mensajes por mes costarían ~58 USD y habría pérdida con 2 canchas.
- **Quién cobra qué:** el costo de WhatsApp lo fija Meta por mensaje. Una IA, si el chatbot usa una, tiene un costo aparte que cobra el proveedor del modelo; **no está contemplado todavía**.
- **WhatsApp Business:** sin licencia propia; las respuestas del chatbot dentro de las 24 h desde que el jugador escribe son gratis (fuente: Meta). Un mensaje de plantilla fuera de esa ventana (por ejemplo, recordatorios) cuesta ~0,026 USD (tarifa a confirmar). Con 540 plantillas por mes serían ~14 USD, cerca del 70% de la cuota. Un proveedor intermediario puede sumar cargos.

## Preguntas abiertas

| Pregunta | Con quién |
|---|---|
| Datos obligatorios al crear un turno desde el backoffice para reservar con pocos clics | Ivan |
| Otros datos adicionales a pedir a una persona (hoy: nombre, apellido, teléfono y categoría obligatorios; alias opcional) | Ivan |
| Quiénes usan el backoffice (hoy un solo administrador) y si se usará desde el celular | A consultar |
| Si el chatbot debe avisar por su cuenta (recordatorios) | A consultar |
| Qué funciones del backoffice entran en la primera entrega del roadmap | A definir |
| Precio exacto del turno y moneda (estimado 7k) | A definir |
| Comparación concreta contra Clubo | A definir |
| Confirmar PostgreSQL y validar la arquitectura de datos | A definir |
| Proveedor intermediario de WhatsApp o conexión directa a Meta; tarifa de plantillas | A definir |
| Qué modelo de IA usa el chatbot (se prefiere gratuito); revisar límites y uso de datos de los planes gratuitos; resolver lo posible con botones y reglas | Ivan |
| Si se avisa por WhatsApp al jugador cuando el administrador cancela, con qué texto y si se ofrece reprogramar | A definir |

## Archivos de esta carpeta

| Ruta | Qué es |
|---|---|
| `CONTEXTO.md` | Este documento |
| `DESIGN-SYSTEM.md` | Design system (blanco, azul, negro; IBM Plex) |
| `docs/producto-reserva-canchas.html` | Documento de producto completo con diagramas, tablas y calculadora |
| `mockup/` | Prototipo navegable del backoffice (HTML con su JavaScript, estilos componetizados, capa de datos simulada) |
| `agenda/` | Reportes diarios en markdown (uno por jornada, ej. `Reporte 8-10.md`) |
| `mockup/README.md` | Cómo abrirlo y mapa de método de datos a endpoints candidatos |

## Reglas para quien continúe

- No inventar reglas de negocio: lo no definido va como pregunta abierta.
- Lo marcado como **propuesta** o **a confirmar** no es decisión.
- El detalle visual vive en el prototipo. Solo se actualiza el documento de producto cuando cambia una regla de negocio o una definición técnica.
