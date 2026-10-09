# Pali · Design System

Sistema de diseño del prototipo y del producto. Parte de la tipografía del documento de producto (IBM Plex) y de una paleta **blanco · verde · negro**, inspirada en el caso Crezco de Behance: verde bosque, menta y un acento cálido, con paneles amplios, tipografía grande y esquinas redondeadas. El verde remite al mundo del tenis y el paddle.

> **Fuente de verdad visual:** el prototipo en `mockup/`. Si algo de este documento y el prototipo difieren, manda el prototipo y este documento se actualiza.

---

## 1. Principios

1. **Pocos clics.** El flujo más importante es reservar un turno desde el backoffice. Hoy los clubes anotan a mano; si entrar al sistema cuesta más que anotar, se rompe la adopción.
2. **Verde con carácter.** El verde bosque ancla la interfaz (barra lateral, turno completo); el verde de marca es la acción; la menta marca lo activo y los paneles de encabezado.
3. **Blanco para trabajar.** Las superficies de trabajo (agenda, tablas, formularios) son blancas con bordes finos. El color se reserva para marcar estado y dar identidad.
4. **El negro es el texto.** Un negro verdoso (`--ink`) para texto y énfasis; grises con matiz verde para lo secundario.
5. **El coral solo cancela.** Es el único color cálido y se usa únicamente en acciones y estados destructivos (cancelar, cancelado).
6. **Datos reales en mono.** Horarios, importes y teléfonos van en IBM Plex Mono para alinearse y leerse rápido.

---

## 2. Color

| Token | Valor | Uso |
|---|---|---|
| `--white` / `--bg` | `#ffffff` | Fondo de página, cards, campos |
| `--bg-soft` | `#f5f8f6` | Hover de filas, notas |
| `--mint-soft` | `#dfeee6` | Panel de encabezado de página (con cuadrícula fina) |
| `--mint` | `#a9d6c4` | Ítem activo y acentos sobre verde bosque |
| `--cream` | `#f6efe6` | Superficie cálida de apoyo (reservada) |
| `--line` / `--line-strong` | `#e2eae5` / `#cad6cf` | Bordes y separadores |
| `--ink` | `#0d1f18` | Texto principal |
| `--ink-2` | `#43544d` | Texto secundario |
| `--mute` | `#6a7b74` | Texto de apoyo, etiquetas |
| `--forest` | `#0f3d2e` | Barra lateral, botón oscuro, turno completo |
| `--forest-deep` | `#0a2c21` | Hover de elementos verde bosque |
| `--brand` | `#1f6f57` | Acción principal, enlaces, foco |
| `--brand-hover` | `#185a47` | Hover del botón primario |
| `--brand-soft` | `#e8f4ee` | Fondo de “reservado”, chips suaves |
| `--brand-line` | `#bcdccb` | Borde de elementos verde suave |
| `--coral` | `#e5533d` | Cancelar y estados negativos |
| `--coral-soft` / `--coral-line` | `#fdeeea` / `#f4b9ad` | Fondo y borde de chip y botón de cancelar |

### Tema oscuro

Se activa con `<html data-theme="dark">` y **solo redefine tokens** (`css/tokens.css`): ningún componente tiene colores propios. Reglas para que renderice bien:

- `--surface` es la superficie de cards, campos, botones y modal (blanco en claro, verde casi negro en oscuro). `--white` queda como blanco puro, solo para texto sobre rellenos de color.
- `--fill-dark` es el relleno oscuro (botón oscuro, chip negro, turno completo). En oscuro pasa a un verde más claro para no perderse contra el fondo.
- `--ink` pasa a casi blanco y `--bg` a casi negro verdoso, así el control segmentado activo y el toast se invierten solos.
- `--brand` se aclara; el texto sobre botones y chips de marca pasa a oscuro para mantener el contraste.
- El tema se guarda en el navegador y, si no hay elección, sigue el del sistema.

**Cambio de tema:** el botón de la esquina superior derecha usa la API View Transitions: el tema nuevo se revela como una onda circular desde el punto del clic, más un anillo que sale del clic. Si el navegador no la soporta, o el usuario pidió menos movimiento, el cambio es instantáneo.

### Estados de negocio

| Estado | Resolución visual |
|---|---|
| Turno libre (0 personas) | Borde punteado gris, fondo blanco; en hover pasa a verde suave |
| Reservado (1 a 3 personas) | Fondo `--brand-soft`, borde `--brand-line`, texto verde |
| Completo (4 personas) | Relleno `--forest`, texto blanco, detalle en menta |
| Cancelado | Chip coral (`chip--coral`) |
| Dato a confirmar | Chip con borde punteado (`chip--dashed`) |

---

## 3. Tipografía

- **Texto:** IBM Plex Sans (400, 500, 600).
- **Datos y etiquetas:** IBM Plex Mono (400, 500).
- Se cargan desde Google Fonts en `css/tokens.css`; sin conexión se usa una fuente del sistema.

| Rol | Tamaño | Peso | Notas |
|---|---|---|---|
| Título de página (`h1`) | 42 px | 600 | Interlineado 1,1; tracking −0,03 em; palabra de acento en verde con `<em>` |
| Título de sección (`h2`) | 28 px | 600 | Idem acento verde |
| Subtítulo (`h3`) | 15,5 px | 600 | |
| Texto base | 14,5 px | 400 | Interlineado 1,55 |
| Texto de apoyo | 12,5 px | 400 | `--mute` |
| Etiqueta (`.kicker`, `.label`) | 10,5–11 px | 400/500 mono | Mayúsculas, espaciado 0,08–0,1 em |

El acento de una frase se marca con `<em>` dentro de `h1`/`h2`: se ve verde y sin cursiva.

---

## 4. Espaciado, forma y movimiento

- **Escala de espaciado:** 4 · 8 · 12 · 16 · 24 · 32 · 48 px (`--s-1` a `--s-7`).
- **Radios:** 8 px (controles), 12 px (cards, slots, modal), 20 px (panel de encabezado), píldora para chips.
- **Sombra:** solo `--shadow-pop`, en modal y listas flotantes.
- **Transiciones:** 150 ms en hover; curva `--ease`. Sin animaciones decorativas.

---

## 5. Layout

- **Shell:** barra lateral verde bosque de 232 px + contenido. En pantallas de hasta 1000 px la barra pasa arriba.
- **Ocultar la barra lateral:** ícono chico («) arriba a la derecha de la barra (propuesta de ubicación). Al ocultarla, la columna se achica a 0 con una animación corta y el contenido ocupa todo el ancho (las grillas se redistribuyen solas); un botón de menú queda en la esquina superior izquierda para volver a mostrarla. El estado se recuerda. No aplica en pantallas de hasta 1000 px.
- **Marca:** una pelota de tenis estilizada (círculo menta con costura) junto al nombre Pali.
- **Menú de usuario:** al pie de la barra lateral, un desplegable con la inicial, el rol (hoy “Administrador”) y el email de quien ingresó. Al abrirlo muestra, por ahora, solo “Cerrar sesión”, que vuelve al login (simulado).
- **Navegación:** ítems numerados en mono (`01`, `02`…); el activo va en menta con texto verde bosque. Orden actual: Cobros, Agenda, Personas, Reservas, Configuración. Los nombres son provisorios; el orden y los textos se cambian solo en `js/nav.js`.
- **Encabezado de página:** panel menta suave con cuadrícula fina, `kicker`, título con acento y bajada.
- **Contenido:** padding lateral de 40 px (16 px en móvil).
- **Grillas:** `grid-2`, `grid-3`, `grid-4`; colapsan a una columna bajo 900 px.

---

## 6. Componentes

Cada componente tiene su CSS en `mockup/css/components/` y su markup de referencia en `mockup/components/`. Se ven todos juntos en `mockup/components.html`.

| Componente | Clases clave | Notas |
|---|---|---|
| Botón | `btn`, `btn--primary`, `btn--dark`, `btn--neutral`, `btn--ghost`, `btn--danger`, `btn--coral`, `btn--sm`, `btn--lg`, `btn--block` | Un solo primario por vista. Cancelar usa `btn--danger` (o `btn--coral` para confirmar) |
| Campo | `field`, `label`, `input`, `select`, `check`, `hint`, `field--error`, `field-error` | Foco con borde verde. Un campo obligatorio vacío se marca en coral con su mensaje |
| Buscador único | `combo`, `combo-list`, `combo-item`, `combo-item--create` | Busca persona por nombre y apellido; ofrece “Crear persona” si no existe |
| Control segmentado | `seg`, `is-on` | Filtros cortos (día/semana/mes). El activo es negro |
| Chip | `chip`, `chip--soft`, `chip--solid`, `chip--ink`, `chip--coral`, `chip--dashed` | Estado del turno (Reservado, Completo, Cancelado), “a confirmar” |
| Card / KPI | `card`, `kpi`, `kpi--brand`, `dom`, `value`, `sub` | |
| Tabla | `table`, `num`, `table-wrap`, `empty` | Encabezado en mono mayúsculas |
| Agenda y turno | `agenda`, `agenda-head`, `agenda-time`, `slot`, `slot--free`, `slot--booked`, `slot--full` | Una columna por cancha, una fila por horario |
| Modal | `scrim`, `modal`, `modal-head`, `modal-close`, `modal-foot`, `plist` | Cierra con clic afuera, la X o Esc |
| Toast | `toast` | Confirmación breve, 2 s |
| Gráfico de barras | `bars`, `bar`, `fill`, `bar-labels` | CSS puro; la barra pico va en verde |
| Pasos | `steps`, `is-key` | Pasos numerados de un flujo |
| Nota | `note` | Borde izquierdo verde, fondo gris suave |
| Controles del shell | `shell-btn`, `theme-toggle`, `nav-open`, `nav-hide`, `user-menu`, `user-btn`, `user-pop`, `theme-ripple` | Cambio de tema y ocultar/mostrar la barra lateral (`css/components/shell.css`). Su JavaScript está en cada página |

---

## 7. Patrones de pantalla

- **Agenda:** grilla por cancha y horario; tocar un turno libre abre el modal de reserva; tocar uno reservado abre su gestión. Reservar son 2 clics.
- **Reserva rápida:** buscador de persona opcional + botón primario “Reservar”. No hay opción de abonado: el club cobra en caja. Con las 4 personas el turno pasa a Completo.
- **Tablas con filtros:** control segmentado arriba, tabla debajo, acciones al final de la fila.
- **Cobros:** (estimado: turnos no cancelados por el precio) tres KPI arriba, vista por día/semana/mes, gráfico de barras y tabla del mismo dato.

---

## 8. Accesibilidad

- Contraste: `--ink` y `--ink-2` sobre blanco cumplen AA; `--mute` se usa solo para texto de apoyo. El texto verde de marca sobre blanco o menta suave cumple AA para texto normal.
- Foco visible con anillo verde de 2 px en todo elemento interactivo.
- Los estados nunca dependen solo del color: llevan texto (“Libre”, “Reservado”, “Completo”, “Cancelado”) y cambian de relleno o borde.
- Botones de ícono llevan `aria-label`; el modal cierra con Esc.
- Se respeta `prefers-reduced-motion`.

---

## 9. Estructura de carpetas

```
mockup/
├─ index.html                 mapa de flujos
├─ components.html            galería de componentes
├─ agenda.html                pantallas del backoffice
├─ reservas.html
├─ personas.html
├─ cobros.html
├─ configuracion.html
├─ components/                markup de referencia por componente
├─ css/
│  ├─ main.css                único archivo que enlazan las páginas
│  ├─ tokens.css              variables de diseño
│  ├─ base.css                reset, tipografía, utilidades
│  ├─ layout.css              shell, barra lateral, encabezado de página
│  └─ components/             un archivo por componente
├─ js/mock-api.js             capa de datos simulada (PaliApi)
└─ js/nav.js                  menú lateral: orden y nombres de las pestañas (único lugar para cambiarlos)
```

---

## 10. Cómo se escribe una pantalla

- **HTML primero.** La estructura y el comportamiento van en el HTML. El JavaScript de cada pantalla va dentro de su propio HTML (un bloque `<script>` al final), sin librerías externas, para que funcione sin internet. Los botones declaran su acción con `data-act` y se atienden con un solo manejador de clics.
- **Estilos solo por clases.** Nada de estilos propios en la página salvo ajustes puntuales de layout; lo repetido se convierte en componente.
- **Datos solo por `PaliApi`.** Las pantallas no leen datos de otra forma, así reemplazar la capa simulada por los endpoints no obliga a tocar el diseño.
- **Nombres en inglés para clases (BEM liviano):** `bloque`, `bloque--variante`, `is-estado`. Los textos visibles van en español de Argentina.
- **Textos:** voseo (“tocá”, “elegí”), sin tecnicismos, frases cortas.

---

## 11. Pendientes del sistema

- Definir diseño móvil del backoffice (hoy está pendiente si se usará desde el celular).
- Definir estados de carga y de error cuando existan los endpoints reales.
- Definir roles y permisos visibles si hay más de un usuario.
- Decidir si se suma un detalle amarillo pelota como acento puntual (hoy no se usa).
