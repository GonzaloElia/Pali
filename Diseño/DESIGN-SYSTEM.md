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
7. **Obligatorio se marca, y opcional no.** Regla para todo el producto: en todo formulario, **cada campo obligatorio lleva un asterisco verde** pegado a su título (`<span class="req" role="img" aria-label="obligatorio"></span>`), y **los campos opcionales no llevan ninguno** (pueden decir “(opcional)”). Un campo obligatorio vacío no deja avanzar: se marca en coral y avisa “Falta completar el campo X: es obligatorio”. Al agregar un campo a cualquier pantalla se define primero si es obligatorio u opcional. Un paso necesario del flujo que no es un dato del formulario (por ejemplo, buscar y sumar una persona al reservar) **no es obligatorio ni opcional** y no lleva asterisco. El asterisco se dibuja con una máscara, no con el carácter `*`, para que quede centrado en la altura de las mayúsculas y a la misma altura en todas las pantallas.
8. **Los números se leen de un vistazo.** Importes y cifras van en mono con dígitos de ancho fijo (`tabular-nums`), y una cifra importante se acompaña de su variación contra el período anterior, siempre con flecha y texto, nunca solo con color.

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

### Secundarios fríos: azul cielo y lavanda (definidos; valores a validar)

Dos colores fuera de la gama del verde y que **no sirven para cancelar**. Cubren lo que el verde no puede: datos, comparaciones, promos y novedades. Siempre son secundarios: no reemplazan al verde en la acción principal.

| Color | Rol | Escala (token · valor) | Uso |
|---|---|---|---|
| Azul cielo | Intermedio (primario/secundario) | `--sky-700` `#1b4f8e` · `--sky-600` `#2f6fc0` · `--sky-400` `#6baee8` · `--sky-100` `#bfddf7` · `--sky-50` `#e8f2fc` | Datos y comparaciones (`--chart-compare`), avisos informativos, texto y líneas (600, 5,1 : 1 sobre blanco), series y rellenos (400), fondos (100 y 50) |
| Lavanda | De detalle | `--lav-700` `#4a3c8c` · `--lav-500` `#9c8ddd` · `--lav-100` `#e4dff7` · `--lav-50` `#f1eefb` | Promos y descuentos, novedades y acentos puntuales |

Contraste: el relleno lavanda (500) lleva **texto oscuro** (`--ink`, 5,9 : 1); con texto blanco solo da 3,6 : 1 y no se usa. Texto lavanda sobre blanco: 700 (9,1 : 1). Azul cielo y verde de marca se parecen en luminosidad, así que en un gráfico nunca se distinguen solo por color. Tienen su contraparte en el tema oscuro (`css/tokens.css`). Todavía no hay componentes que los usen.

### Datos y gráficos

| Token | Valor | Uso |
|---|---|---|
| `--chart-main` | `--brand` | Serie principal, pico y barra enfocada |
| `--chart-soft` | `--brand-line` | Resto de las barras |
| `--chart-ref` | `--ink-2` | Línea de referencia (promedio), siempre punteada |
| `--chart-compare` | `--sky-400` | Segunda serie: período anterior o comparación |

Reglas: una serie no se distingue **solo por el color** (se suma etiqueta directa, línea punteada o marca de “Pico”); el gráfico va acompañado de una **tabla con los mismos datos**; una baja se muestra en gris oscuro, no en coral (el coral es solo para cancelar). Siguen el tema claro y oscuro porque se definen con otros tokens.

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
| Cifra destacada (`--fs-display`) | 48 px | 600 | Solo en el panel de caja de Cobros; tracking −0,03 em |
| Texto base | 14,5 px | 400 | Interlineado 1,55 |
| Texto de apoyo | 12,5 px | 400 | `--mute` |
| Etiqueta (`.kicker`, `.label`) | 10,5–11 px | 400/500 mono | Mayúsculas, espaciado 0,08–0,1 em |

Las cifras (importes, KPI, tablas) usan `font-variant-numeric: tabular-nums` (clase `.tnum`, ya aplicada en KPI, columnas `num` y `.mono`) para que los dígitos se alineen.

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
| Campo | `field`, `label`, `input`, `select`, `check`, `hint`, `req`, `field--error`, `field-error` | Foco con borde verde. **Los campos obligatorios llevan un asterisco (`*`) verde en el título; los opcionales no llevan ninguno.** Un campo obligatorio vacío se marca en coral con su mensaje |
| Buscador único | `combo`, `combo-list`, `combo-item`, `combo-item--create` | Busca persona por nombre y apellido; ofrece “Crear persona” si no existe |
| Control segmentado | `seg`, `is-on` | Filtros cortos (día/semana/mes). El activo es negro |
| Interruptor | `switch`, `switch-row` | Activo / inactivo (hoy: canchas y promos en Configuración). Verde cuando está activo, con texto al lado |
| Selector de opciones | `toggle-group`, `toggle` | Grupo de botones que se activan o no (`aria-pressed`): días de la semana y tipo de promo (precio promo / descuento) |
| Chip | `chip`, `chip--soft`, `chip--solid`, `chip--ink`, `chip--coral`, `chip--dashed` | Estado del turno (Reservado, Completo, Cancelado), “a confirmar” |
| Card / KPI | `card`, `kpi`, `kpi--brand`, `dom`, `value`, `sub` | |
| Tabla | `table`, `num`, `table-wrap`, `empty` | Encabezado en mono mayúsculas |
| Paginación | `pager`, `pager-size`, `pager-range`, `pager-nav`, `pager-btn` | Arriba de la tabla (`pager--top`): “Mostrar 10 / 20 / 50 / 100 por página” a la izquierda y un botón de ícono (`icon-btn`, solo el ícono de columnas, con tooltip “Elegir columnas”) a la derecha, en el mismo eje. Mientras llega una página se muestran filas de relleno animadas (`skel`). Debajo de la tabla: el rango “1–10 de 137” a la izquierda y los botones Anterior, números de página (con “…”) y Siguiente. Al cambiar filtro o cantidad vuelve a la página 1 (`css/components/pagination.css`) |
| Agenda y turno | `agenda`, `agenda-head`, `agenda-time`, `slot`, `slot--free`, `slot--booked`, `slot--full` | Una columna por cancha, una fila por horario |
| Modal | `scrim`, `modal`, `modal-head`, `modal-close`, `modal-foot`, `plist` | Cierra con clic afuera, la X o Esc |
| Toast | `toast` | Confirmación breve, 2 s |
| Gráfico de barras | `chart`, `chart-y`, `chart-plot`, `chart-grid`, `chart-avg`, `bars`, `bar`, `fill`, `peak`, `bar-labels`, `chart-tip`, `chart-legend` | CSS puro con eje, línea de promedio punteada, marca de “Pico”, tooltip con mouse y teclado y leyenda. Las barras sin datos van punteadas. Siempre con tabla de respaldo (`css/components/chart.css`) |
| Variación | `delta`, `delta--up`, `delta--down`, `delta--flat` | Píldora con flecha y porcentaje (▲ 12 %, ▼ 8 %, = 0 %); sin período anterior dice “— sin comparar”. La baja va en gris oscuro, no en coral |
| Panel destacado | `hero`, `hero-value`, `hero-row`, `hero-side`, `hero-stat` | Cifra principal grande sobre verde con cuadrícula fina y datos secundarios al costado. Hoy solo en Cobros; en móvil se apila |
| Estados de sección | `state`, `state-icon`, `state-title`, `state-hint`, `state--error` | Vacío (explica qué falta) y error (dice qué pasó y ofrece “Reintentar”, `role="alert"`). La carga usa bloques `skel` y `aria-busy="true"` |
| Loader (relleno animado) | `skel`, `skel-row` | Bloques grises con brillo que se mueve mientras llega un dato. Respeta `prefers-reduced-motion` |
| Botón de ícono | `icon-btn` | Cuadrado de 36 px con solo el ícono, tooltip y `aria-label`; verde con halo cuando abre un desplegable |
| Secundarios en el backoffice | `chip--sky`, `chip--lav`, `chip--lav-solid`, `kpi--lav`, `kpi--sky` | Criterio: el verde, el blanco y el negro dominan; el azul cielo aparece solo donde hay **datos o información** y la lavanda, más escasa, solo en **detalles**. Azul: canchas jugadas, “Precio base”, línea de promedio y su etiqueta (Cobros), botón del ojo. Lavanda: categoría del jugador (Personas, ficha y Agenda) y la insignia “Promo”. Ninguno cancela, confirma ni reemplaza la acción en verde. Cada pantalla suma pocas zonas azules y como mucho un detalle lavanda por bloque; se regula a ojo, sin porcentaje fijo (propuesta, se ajusta con la revisión) |
| Ocultar importes | `hero-eye` | Botón con ojo (28 px) dentro del panel oscuro de Cobros; con `aria-pressed` y etiqueta “Ocultar/Mostrar importes”. Al activarlo, los importes pasan a `$ *******` (el eje a `***`) y se recuerda en el navegador. Las variaciones en % no se ocultan (propuesta) |
| Pasos | `steps`, `is-key` | Pasos numerados de un flujo |
| Nota | `note` | Borde izquierdo verde, fondo gris suave |
| Barra de filtros y popover | `toolbar`, `pop-wrap`, `pop`, `pop-opt`, `row-link`, `modal--wide` | Filtros sobre una tabla, botón “Columnas” que muestra u oculta columnas, fila que abre una ficha (`css/components/popover.css`) |
| Controles del shell | `shell-btn`, `theme-toggle`, `nav-open`, `nav-hide`, `user-menu`, `user-btn`, `user-pop`, `theme-ripple` | Cambio de tema y ocultar/mostrar la barra lateral (`css/components/shell.css`). Su JavaScript está en cada página |

---

## 7. Patrones de pantalla

- **Agenda:** grilla por cancha y horario; tocar un turno libre abre el modal de reserva; tocar uno reservado abre su gestión. Reservar son 2 clics.
- **Reserva rápida:** buscador de persona opcional + botón primario “Reservar”. No hay opción de abonado: el club cobra en caja. Con las 4 personas el turno pasa a Completo.
- **Formularios:** todo campo se declara obligatorio u opcional (principio 7). Hoy llevan asterisco: nombre, apellido, teléfono y categoría de una persona; y precio por jugador, valor, turnos desde y hasta de una promo, y duración y último turno en Configuración. Alias es opcional. El **login no lleva asteriscos** (todos sus campos son obligatorios y es evidente; igual avisa si falta alguno). “Persona” al reservar un turno es un paso necesario del flujo: no lleva asterisco.
- **Tablas con filtros:** control segmentado arriba, tabla debajo, acciones al final de la fila.
- **Cobros (panel de caja):** estimado (personas × precio por jugador). Arriba un panel verde (`hero`) con la cifra del mes y su variación contra el mismo tramo del mes anterior, y al costado Hoy y Esta semana con su variación. Debajo, el control día/semana/mes y año, el gráfico con eje, promedio y pico, y, al tocar una barra, el detalle de reservas de ese día, semana o mes (misma tabla que Reservas, sin filtros ni cancelar). La barra elegida queda resaltada (`is-sel`) y el detalle no se cierra. Cubre los tres estados: carga, vacío y error.
- **Estados de una sección:** carga (bloques `skel`), vacío (`state`) y error (`state--error` con “Reintentar”). Cada sección que depende de datos los define.

---

## 8. Accesibilidad

- Contraste: `--ink` y `--ink-2` sobre blanco cumplen AA; `--mute` se usa solo para texto de apoyo. El texto verde de marca sobre blanco o menta suave cumple AA para texto normal.
- Foco visible con anillo verde de 2 px en todo elemento interactivo.
- Los estados nunca dependen solo del color: llevan texto (“Libre”, “Reservado”, “Completo”, “Cancelado”) y cambian de relleno o borde.
- Botones de ícono llevan `aria-label`; el modal cierra con Esc.
- Se respeta `prefers-reduced-motion`.
- Formularios: el resumen de errores lleva `role="alert"` (se anuncia solo) y cada campo inválido lleva `aria-invalid`. Hoy el foco va al primer campo con error; llevarlo al resumen con enlaces a cada campo queda como mejora.
- Gráficos: cada barra se puede enfocar con teclado, muestra su tooltip y tiene `aria-label` con período e importe; la tabla de debajo repite los datos.
- Tamaño de los controles: 36 px en escritorio. Si el backoffice se usa en el celular, los botones de ícono suben a 44 px.

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
- Estados de carga, vacío y error: definidos y aplicados en Cobros y en la tabla de Personas. Falta aplicarlos a Agenda y Reservas y validar los textos de error cuando existan los endpoints reales.
- Definir roles y permisos visibles si hay más de un usuario.
- Decidir si se suma un detalle amarillo pelota como acento puntual (hoy no se usa).
