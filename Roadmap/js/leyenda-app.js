/* Pali · Roadmap — página de leyenda (solo lectura). Datos siempre vía RoadmapStore.
   Los significados se editan desde el roadmap (index.html → "Editar leyenda"). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var board = { categories: [], rowKinds: [], rows: [], boxes: [], prefs: {} };

  function swatchClass(c) { return 'legend-swatch c-' + esc(c.color) + (c.style === 'dashed' ? ' is-dashed' : ''); }

  function renderCategories() {
    $('#categoryList').innerHTML = board.categories.map(function (c) {
      var count = board.boxes.filter(function (b) { return b.categoryId === c.id; }).length;
      return '<li><span class="' + swatchClass(c) + '"></span>' +
        '<span><b>' + esc(c.name) + '.</b> ' + esc(c.meaning || 'Sin significado definido.') +
        (c.style === 'dashed' ? ' <em class="muted">(borde punteado)</em>' : '') +
        ' <span class="chip">' + count + ' cajita' + (count === 1 ? '' : 's') + '</span></span></li>';
    }).join('');
  }

  function renderFixed() {
    var kinds = board.rowKinds.map(function (k) { return esc(k.name); }).join(' o ');
    $('#fixedList').innerHTML = [
      '<li><span class="legend-swatch is-milestone c-forest"></span><span><b>Rombo.</b> Una cajita que empieza y termina el mismo día se muestra como hito puntual.</span></li>',
      '<li><span class="legend-swatch is-today"></span><span><b>Línea coral vertical.</b> El día de hoy; se actualiza sola cada vez que abrís el roadmap.</span></li>',
      '<li><span class="legend-swatch c-mute"></span><span><b>Nombre de la fila.</b> Es la vertiente del eje vertical. Arriba del nombre se ve su tipo: ' + kinds + '.</span></li>',
      '<li><span class="legend-swatch c-brand"></span><span><b>Barrita inferior de una cajita.</b> El avance cargado en "Más detalles".</span></li>'
    ].join('');
  }

  /* Barra lateral: misma preferencia que el roadmap */
  function applySidebar() {
    var collapsed = !!board.prefs.sidebarCollapsed;
    document.body.classList.toggle('is-full', collapsed);
    var btn = $('#sidebarToggle');
    btn.textContent = collapsed ? '›' : '‹';
    btn.setAttribute('aria-label', collapsed ? 'Mostrar barra lateral' : 'Ocultar barra lateral');
  }

  /* Indicador de memoria: misma pastilla que en el roadmap (solo lectura acá) */
  function fmtSize(chars) {
    if (chars >= 1024 * 1024) return (chars / 1024 / 1024).toFixed(2) + ' MB';
    if (chars >= 1024) return (chars / 1024).toFixed(1) + ' KB';
    return chars + ' B';
  }
  function fmtPercent(p) { return p > 0 && p < 0.1 ? '<0,1%' : String(p).replace('.', ',') + '%'; }

  async function renderStorage() {
    var u = await RoadmapStore.getUsage();
    var level = (u.full || u.percent >= 99.5) ? 'full' : (u.percent >= 80 ? 'warn' : 'ok');
    var widget = $('#storageWidget'), bar = Math.max(u.percent, 0) + '%';
    widget.classList.toggle('is-warn', level === 'warn');
    widget.classList.toggle('is-full', level === 'full');
    $('#storagePill').innerHTML = '<span class="pill-dot"></span><span>Memoria</span><span class="pill-caret" aria-hidden="true">▾</span>';
    $('#storagePill').title = 'Memoria: ' + fmtSize(u.totalChars) + ' de ~' + fmtSize(u.limitChars) + ' (' + fmtPercent(u.percent) + ')';
    $('#storagePanel').innerHTML =
      '<h4>' + { ok: 'Memoria del navegador', warn: 'La memoria se está llenando', full: 'La memoria está llena' }[level] + '</h4>' +
      '<div class="meter"><span style="width:' + bar + '"></span></div>' +
      '<dl>' +
        '<dt>Usado en total</dt><dd>' + fmtSize(u.totalChars) + ' (' + fmtPercent(u.percent) + ')</dd>' +
        '<dt>De eso, el roadmap</dt><dd>' + fmtSize(u.roadmapChars) + '</dd>' +
        '<dt>Prototipo y otras páginas</dt><dd>' + fmtSize(Math.max(0, u.totalChars - u.roadmapChars)) + '</dd>' +
        '<dt>Disponible</dt><dd>' + fmtSize(Math.max(0, u.limitChars - u.totalChars)) + '</dd>' +
      '</dl>' +
      '<p>Para exportar una copia o liberar espacio, andá al <a href="index.html">roadmap</a>.</p>';
  }

  async function load() {
    board = await RoadmapStore.getBoard();
    renderCategories();
    renderFixed();
    renderStorage();
    applySidebar();
  }

  $('#storagePill').addEventListener('click', function () {
    var panel = $('#storagePanel');
    panel.hidden = !panel.hidden;
    this.setAttribute('aria-expanded', String(!panel.hidden));
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#storageWidget')) $('#storagePanel').hidden = true;
  });

  $('#sidebarToggle').addEventListener('click', async function () {
    board.prefs.sidebarCollapsed = !board.prefs.sidebarCollapsed;
    applySidebar();
    await RoadmapStore.setPrefs({ sidebarCollapsed: board.prefs.sidebarCollapsed });
  });
  /* Si editás la leyenda en otra pestaña, esta se actualiza al volver */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });

  load();
})();
