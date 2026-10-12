# Reporte 10/10

Notas de la jornada. Lo marcado como **propuesta** o **a confirmar** no es decisión. Continúa el [Reporte 9/10](Reporte%209-10.md).

---

## 1. Decisiones de negocio

- **Validación del problema:** se confirmó que la descripción del producto es correcta en lo esencial. Pali ataca la administración manual de turnos de los clubes y la reserva lenta de los jugadores. Queda refinar detalles.
- **Cupo de un turno:** **no se bloquea en 4.** Con 4 o más personas el turno figura **Completo** y se pueden seguir sumando (por ejemplo turnos de 6 con jugadores de nivel inicial). Falta definir si hay un máximo absoluto.
- **Etiquetas de personas:** solo la cantidad que se sumó («1 persona», «3 personas», «6 personas»). **Nunca «x de 4»**, para no dar la idea de que el sistema limita a 4.
- **Última persona de un turno:** al quitarla, el turno vuelve a **Libre** y desaparece de Reservas.
- **Cancha inactiva = cancha pausada:** el chatbot deja de ofrecerla y sus turnos y reservas futuras quedan en pausa hasta que el administrador la active de nuevo. Al pausar, el backoffice pide confirmar y avisa cuántas reservas futuras tiene para que el administrador notifique a esas personas. Falta definir si el aviso lo manda el sistema o el administrador, y si al reactivar las reservas se retoman tal cual.
- **Cobros día a día (definido):**
  - Solo suman los turnos **Completos** (personas × precio por jugador). **Reservado no suma.**
  - **Completo** se alcanza con 4 o más personas **o** cuando el administrador marca a mano un turno como completado (con 1, 2 o 3 personas), porque en la vida real hay turnos de menos de 4 y la plata entra igual.
  - El importe del día **sube** al completar un turno y **baja** si vuelve a Reservado o se cancela. Si cambian las personas durante el día, se actualiza.
  - Si alguien se baja (por ejemplo desde el chatbot), el turno vuelve a **Reservado**.
  - Semana y mes son la **suma de los días**. Los turnos de días futuros suman cuando llega su día.
  - Es una regla **interna**: la pantalla no cambia su texto; solo anima el número.
  - Con esto no hace falta distinguir entre devengado y percibido.
- **Marcar como completado a mano:** se habilita con 1, 2 o 3 personas (con 0 o con 4 o más queda deshabilitado), sirve para crear un turno (Libre → Completo directo) o para uno Reservado, y vale para turnos de cualquier día. Se guarda con Reservar o Aceptar. Si se suma una cuarta persona a uno marcado a mano, sigue Completo y el importe sube a 4 personas.
- **Edición de turnos pasados:** solo hasta **N días atrás**, parámetro de Configuración, hoy **6** (hoy lunes se edita desde el martes pasado, no el lunes pasado). Pasado el plazo el turno queda bloqueado. El valor por defecto queda **a confirmar**.

---

## 2. Backend y arquitectura de datos

- Nuevo campo de reserva: `completed` (marca manual de Completo). Estado calculado: Completo si `completed` o 4 o más personas.
- Nuevo endpoint candidato: `POST /bookings/:id/complete { completed }`.
- Nuevo parámetro en configuración: `editWindowDays` (hoy 6). Las operaciones sobre turnos de fechas fuera del plazo (sumar o quitar personas, cancelar, completar, crear) se rechazan.
- `GET /income` y `GET /income/summary` ahora cuentan **solo turnos Completos**.
- Quitar a una persona de un turno marcado a mano lo devuelve a Reservado (`completed = false`).
- Pendiente: definir la hora y la zona horaria en que el sistema consolida el día en Cobros.

---

## 3. Mejoras del prototipo

### Configuración
- **Alerta (modal) al pausar una cancha:** la llave se mueve como si se apagara y aparece un aviso con ícono de advertencia: «¿Querés pausar la Cancha X? El chatbot deja de ofrecerla… Tiene N reservas futuras: avisales a esas personas…». Botones «No, mantener activa» (el foco arranca ahí) y «Sí, pausar cancha». Esc o un clic afuera cancelan y la llave vuelve sola. Activar una cancha pausada es inmediato. El botón de confirmar es oscuro, no coral, porque pausar no es destruir.
- **Nuevo parámetro** «Días hacia atrás que se pueden modificar turnos» (obligatorio, con ejemplo). Ubicado provisoriamente en Parámetros de los turnos; se reorganiza en el rediseño de Configuración.

### Agenda y modal del turno
- Sin tope de personas y etiquetas con solo la cantidad.
- **Check de «completado» junto al título del modal:** un ícono de 28 px azul cielo que se prende y se apaga como el ojito de Cobros (apagado: contorno con tilde tenue; prendido: relleno azul y el tilde se dibuja; deshabilitado: contorno punteado gris). Sin texto en pantalla: el motivo de que esté deshabilitado va en el tooltip y en la etiqueta accesible.
  - Se pasó por varias iteraciones (botón con texto largo, botón «Completar» en una fila, y finalmente el check junto al título), buscando que no cambie de color al hacer clic, sin texto de aclaración y sin sombra fuerte.
- **Turnos bloqueados:** el modal avisa que la fecha ya no se puede modificar y solo deja «Cerrar».

### Cobros
- **Solo suman los turnos Completos**, por día, semana y mes.
- **Animación de los montos** (Hoy, Esta semana, Este mes): si el importe cambió desde la última vez que se vio, sube con una cuenta corta en menta o baja en lavanda claro. Se corrigió un error por el cual solo animaba el mes (el valor guardado de Hoy y Semana no se persistía).
- **Hoy y Esta semana** en lavanda claro y sin el guión de la izquierda (buen contraste sobre el verde, también en tema oscuro).
- La tabla de reservas que se abre al tocar una barra sigue mostrando también los turnos Reservados (**a revisar** si debería mostrar solo Completos para coincidir con el importe).

### Colores secundarios
- Segunda vuelta de azul cielo y lavanda: chip «Total» y tarjeta «Veces que jugó» en azul; etiqueta «Pico» y título «Promos y descuentos» en lavanda. En tema oscuro ambos suben de tono para mantener el contraste.

### Componentes nuevos o ajustados
- `check-btn` (check de estado), `kicker--lav`, `chip--lav-solid`, `kpi--sky`, `kpi--lav`, modal de alerta (`modal--alert`), `lav-on-dark` (token). Se probó y descartó el botón `btn--sky` con texto.

---

## 4. Documentación actualizada

- **`CONTEXTO.md`:** reglas de Cobros día a día, edición de turnos pasados, pausa de canchas, cupo y etiquetas, check de completar.
- **`docs/producto-reserva-canchas.html` (sección 08):** pasaron a **«Definido»** la última persona del turno, el cupo y la cancha inactiva; se agregaron las definiciones de Cobros día a día y de la ventana de edición, y nuevas preguntas abiertas (hora de consolidación del día, aviso al jugador, máximo absoluto de personas).
- **`Diseño/DESIGN-SYSTEM.md`:** filas de `check-btn`, secundarios, ojito y alerta de pausa.
- **Manual de marca (`Diseño/`):** se actualizó a 34 diapositivas con la lámina «Dónde viven el azul y la lavanda», la pantalla de producto con chips secundarios y la lista de pendientes.
- Se preparó un **brief de diseño** para que la IA de diseño de Claude propusiera ubicaciones del botón de completar. Quedó **solo en el chat, sin archivo**, porque era para una decisión puntual.

---

## 5. Pendiente

- **Probar en pantalla** (no hubo navegador en el entorno): el modal con el check, la alerta de pausa, la animación de los tres montos en Cobros, el bloqueo de turnos pasados, tema oscuro y los chips azul y lavanda.
- `reservas.html` sigue mostrando «Reservado · n de 4» porque se pidió no tocarlo: cuando se habilite, cambiarlo a «Reservado» y solo la cantidad.
- Definir: quién avisa a los jugadores al pausar una cancha, máximo absoluto de personas por turno, hora y zona horaria de la consolidación diaria en Cobros, y el valor por defecto de 6 días de edición.
- Decidir si la tabla de Cobros debe mostrar solo turnos Completos.
- Rediseñar y reorganizar Configuración (el parámetro de días de edición está ubicado de forma provisoria).
- Seguir cerrando preguntas abiertas de la sección 08 (quedan unas 30): precio y moneda, aviso de cancelación por WhatsApp, funcionamiento de promos, proveedor de WhatsApp, entre otras.
