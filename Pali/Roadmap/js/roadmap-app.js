/* Pali · Roadmap — interacción de la pantalla. Datos siempre vía RoadmapStore. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function say(msg) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(say.timer); say.timer = setTimeout(function () { t.hidden = true; }, 2200); }

  var D = RoadmapStore.date;
  var YEAR = RoadmapStore.YEAR;
  var TOTAL_DAYS = D.daysInYear();
  var MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  var MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];
  /* Ancho de un día en píxeles según la vista */
  var DAY_WIDTH = { month: 6, week: 14, day: 36 };
  var LANE_HEIGHT = 62;
  var DRAG_THRESHOLD = 4;

  var board = { rows: [], boxes: [], categories: [], rowKinds: [], prefs: { view: "month" } };
  var suppressClick = false;

  /* ---------- fechas ---------- */
  function dayWidth() { return DAY_WIDTH[board.prefs.view] || DAY_WIDTH.month; }
  function dateOf(index) { var p = D.fromIndex(index).split("-"); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function weekday(index) { var o = dateOf(index); return new Date(Date.UTC(o.y, o.m, o.d)).getUTCDay(); }
  function fmtShort(iso) { var p = iso.split("-"); return +p[2] + " " + MONTHS_SHORT[+p[1] - 1]; }
  function fmtRange(start, end) { return start === end ? fmtShort(start) : fmtShort(start) + " → " + fmtShort(end); }
  function daysBetween(start, end) { return D.dayIndex(end) - D.dayIndex(start) + 1; }
  function localTodayIso() { var t = new Date(); return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0"); }
  function todayIndex() { var iso = localTodayIso(); return +iso.slice(0, 4) === YEAR ? D.dayIndex(iso) : null; }
  function isoWeek(index) {
    var o = dateOf(index);
    var date = new Date(Date.UTC(o.y, o.m, o.d));
    var dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function categoryOf(id) { return board.categories.find(function (c) { return c.id === id; }) || board.categories[0] || { color: "brand", style: "solid", name: "" }; }
  function kindOf(id) { return board.rowKinds.find(function (k) { return k.id === id; }) || { name: "" }; }

  /* ---------- escala (cabecera de dos niveles) ---------- */
  function monthSegments() {
    var segs = [], start = 0;
    for (var i = 1; i <= TOTAL_DAYS; i++) {
      if (i === TOTAL_DAYS || dateOf(i).d === 1) { segs.push({ start: start, end: i - 1, month: dateOf(start).m }); start = i; }
    }
    return segs;
  }
  function weekSegments() {
    var segs = [], start = 0;
    for (var i = 1; i <= TOTAL_DAYS; i++) {
      if (i === TOTAL_DAYS || weekday(i) === 1) { segs.push({ start: start, end: i - 1 }); start = i; }
    }
    return segs;
  }

  function scaleHtml() {
    var w = dayWidth(), view = board.prefs.view, html = "", today = todayIndex();
    function cell(cls, start, end, label, title) {
      return '<div class="' + cls + '" style="left:' + start * w + 'px;width:' + (end - start + 1) * w + 'px"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + label + '</div>';
    }
    if (view === "month") {
      var quarters = [[0, 2], [3, 5], [6, 8], [9, 11]];
      var months = monthSegments();
      quarters.forEach(function (q, qi) {
        html += cell("tl-group", months[q[0]].start, months[q[1]].end, "Q" + (qi + 1) + " " + YEAR);
      });
      months.forEach(function (m) {
        var isToday = today !== null && today >= m.start && today <= m.end;
        html += cell("tl-unit" + (isToday ? " is-today" : ""), m.start, m.end, MONTHS[m.month].slice(0, 3));
      });
    } else if (view === "week") {
      monthSegments().forEach(function (m) { html += cell("tl-group", m.start, m.end, MONTHS[m.month]); });
      weekSegments().forEach(function (s) {
        var isToday = today !== null && today >= s.start && today <= s.end;
        html += cell("tl-unit" + (isToday ? " is-today" : ""), s.start, s.end, "S" + isoWeek(s.start), fmtShort(D.fromIndex(s.start)) + " → " + fmtShort(D.fromIndex(s.end)));
      });
    } else {
      monthSegments().forEach(function (m) { html += cell("tl-group", m.start, m.end, MONTHS[m.month] + " " + YEAR); });
      for (var i = 0; i < TOTAL_DAYS; i++) {
        var wd = weekday(i);
        var cls = "tl-unit" + (wd === 0 || wd === 6 ? " is-weekend" : "") + (i === today ? " is-today" : "");
        html += cell(cls, i, i, WEEKDAYS[wd] + " " + dateOf(i).d);
      }
    }
    if (today !== null) {
      html += '<div class="tl-today-flag" style="left:' + (today * w + w / 2) + 'px">Hoy · ' + esc(fmtShort(D.fromIndex(today))) + '</div>';
    }
    return html;
  }

  /* Líneas verticales de fondo de cada fila */
  function laneGridHtml() {
    var w = dayWidth(), view = board.prefs.view, html = "";
    if (view === "month") {
      monthSegments().forEach(function (m) { html += '<span style="left:' + m.start * w + 'px"></span>'; });
    } else if (view === "week") {
      weekSegments().forEach(function (s) { html += '<span style="left:' + s.start * w + 'px"></span>'; });
    } else {
      for (var i = 0; i < TOTAL_DAYS; i++) {
        var wd = weekday(i);
        html += '<span class="' + (wd === 0 || wd === 6 ? 'is-weekend' : '') + '" style="left:' + i * w + 'px;width:' + w + 'px"></span>';
      }
    }
    return html;
  }

  /* Reparte las cajitas de una fila en carriles para que no se pisen */
  function stackBoxes(boxes) {
    var sorted = boxes.slice().sort(function (a, b) { return D.dayIndex(a.start) - D.dayIndex(b.start); });
    var laneEnds = [];
    sorted.forEach(function (b) {
      var s = D.dayIndex(b.start), e = D.dayIndex(b.end);
      if (s === e) e = s + 6; // los hitos ocupan lugar para su etiqueta
      var lane = laneEnds.findIndex(function (end) { return end < s; });
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(e); } else { laneEnds[lane] = e; }
      b._lane = lane;
    });
    return Math.max(laneEnds.length, 1);
  }

  function boxHtml(box) {
    var w = dayWidth();
    var s = D.dayIndex(box.start), e = D.dayIndex(box.end);
    var cat = categoryOf(box.categoryId);
    var cls = "tl-box c-" + cat.color + (cat.style === "dashed" ? " is-dashed" : "");
    var top = 8 + box._lane * LANE_HEIGHT;
    var tip = box.title + " · " + fmtRange(box.start, box.end) + " · " + cat.name + (box.owner ? " · " + box.owner : "");
    if (s === e) {
      return '<div class="' + cls + ' is-milestone" data-box-id="' + box.id + '" title="' + esc(tip) + '" style="left:' + (s * w + w / 2 - 8) + 'px;top:' + top + 'px;width:16px">' +
        '<span class="diamond"></span><span class="tl-box-title">' + esc(box.title) + '</span></div>';
    }
    return '<div class="' + cls + '" data-box-id="' + box.id + '" title="' + esc(tip) + '" style="left:' + s * w + 'px;top:' + top + 'px;width:' + ((e - s + 1) * w - 2) + 'px">' +
      '<span class="handle handle--start" data-handle="start"></span>' +
      '<span class="tl-box-title">' + esc(box.title) + '</span>' +
      '<span class="tl-box-dates">' + esc(fmtRange(box.start, box.end)) + (box.owner ? ' · ' + esc(box.owner) : '') + '</span>' +
      (box.progress ? '<span class="tl-box-progress" style="width:' + box.progress + '%"></span>' : '') +
      '<span class="handle handle--end" data-handle="end"></span>' +
    '</div>';
  }

  /* ---------- render ---------- */
  async function loadAndRender() {
    board = await RoadmapStore.getBoard();
    render();
  }

  function render() {
    var w = dayWidth(), width = TOTAL_DAYS * w, grid = laneGridHtml();
    var html = '<div class="tl-head"><div class="tl-corner"><span>Roadmap</span><b>' + YEAR + '</b></div>' +
      '<div class="tl-scale" style="width:' + width + 'px">' + scaleHtml() + '</div></div>';

    board.rows.forEach(function (row, idx) {
      var rowBoxes = board.boxes.filter(function (b) { return b.rowId === row.id; });
      var lanes = stackBoxes(rowBoxes);
      var height = 16 + lanes * LANE_HEIGHT - (LANE_HEIGHT - 46);
      html += '<div class="tl-row" data-row-id="' + row.id + '">' +
        '<div class="tl-row-head">' +
          '<span class="row-kind-badge">' + esc(kindOf(row.kindId).name) + '</span>' +
          '<span class="tl-row-title">' + esc(row.title) + '</span>' +
          '<div class="tl-row-actions">' +
            '<button class="icon-btn" data-row-act="up" data-id="' + row.id + '" ' + (idx === 0 ? 'disabled' : '') + ' aria-label="Subir fila">↑</button>' +
            '<button class="icon-btn" data-row-act="down" data-id="' + row.id + '" ' + (idx === board.rows.length - 1 ? 'disabled' : '') + ' aria-label="Bajar fila">↓</button>' +
            '<button class="icon-btn" data-row-act="edit" data-id="' + row.id + '" aria-label="Editar fila">✎</button>' +
          '</div>' +
        '</div>' +
        '<div class="tl-lane" data-row-id="' + row.id + '" style="width:' + width + 'px;height:' + Math.max(height, 62) + 'px">' +
          '<div class="tl-lane-grid">' + grid + '</div>' +
          rowBoxes.map(boxHtml).join('') +
        '</div>' +
      '</div>';
    });

    html += '<div class="tl-add-row"><button type="button" data-act="add-row" title="Agregar una fila debajo"><span class="plus">+</span>Agregar fila</button></div>';

    var today = todayIndex();
    if (today !== null) {
      html += '<div class="tl-today" style="left:calc(var(--label-w) + ' + (today * w + w / 2) + 'px)"></div>';
    }

    $('#timeline').innerHTML = html;
    $('#timeline').style.width = 'calc(var(--label-w) + ' + width + 'px)';
    renderToday();
    renderStorage();
    $$('#viewSeg button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.view === board.prefs.view); });
    applySidebar();
  }

  /* ---------- indicador de memoria (siempre visible, arriba a la derecha) ----------
     La pastilla muestra cuánto se usa. Al tocarla se abre el detalle.
     Desde WARN_PERCENT se pone ámbar; si se llena, coral y el detalle se abre solo. */
  var WARN_PERCENT = 80;
  var storageFullFlag = false;     // un guardado falló por falta de lugar
  var storageLevelShown = 'ok';    // para abrir el detalle solo cuando el estado empeora

  function fmtSize(chars) {
    if (chars >= 1024 * 1024) return (chars / 1024 / 1024).toFixed(2) + ' MB';
    if (chars >= 1024) return (chars / 1024).toFixed(1) + ' KB';
    return chars + ' B';
  }
  function fmtPercent(p) { return p > 0 && p < 0.1 ? '<0,1%' : String(p).replace('.', ',') + '%'; }

  async function renderStorage() {
    var u = await RoadmapStore.getUsage();
    var full = storageFullFlag || u.full || u.percent >= 99.5;
    var level = full ? 'full' : (u.percent >= WARN_PERCENT ? 'warn' : 'ok');
    var widget = $('#storageWidget'), panel = $('#storagePanel'), pill = $('#storagePill');
    var barWidth = Math.max(u.percent, 0) + '%';

    widget.classList.toggle('is-warn', level === 'warn');
    widget.classList.toggle('is-full', level === 'full');

    pill.innerHTML = '<span class="pill-dot"></span><span>Memoria</span><span class="pill-caret" aria-hidden="true">▾</span>';

    var title = { ok: 'Memoria del navegador', warn: 'La memoria se está llenando', full: 'La memoria está llena' }[level];
    var message = {
      ok: 'Todo bien: hay lugar de sobra para seguir sumando cosas.',
      warn: 'Todavía podés seguir, pero conviene exportar una copia.',
      full: 'No se pueden sumar más cosas y el último cambio no se guardó. Para liberar espacio exportá una copia, borrá cajitas o notas largas, o restablecé los datos de ejemplo del prototipo.'
    }[level];

    panel.innerHTML =
      '<h4>' + title + '</h4>' +
      '<div class="meter"><span style="width:' + barWidth + '"></span></div>' +
      '<dl>' +
        '<dt>Usado en total</dt><dd>' + fmtSize(u.totalChars) + ' (' + fmtPercent(u.percent) + ')</dd>' +
        '<dt>De eso, el roadmap</dt><dd>' + fmtSize(u.roadmapChars) + '</dd>' +
        '<dt>Prototipo y otras páginas</dt><dd>' + fmtSize(Math.max(0, u.totalChars - u.roadmapChars)) + '</dd>' +
        '<dt>Disponible</dt><dd>' + fmtSize(Math.max(0, u.limitChars - u.totalChars)) + '</dd>' +
        '<dt>Límite aproximado</dt><dd>' + fmtSize(u.limitChars) + '</dd>' +
      '</dl>' +
      '<p>' + message + '</p>' +
      '<div class="row">' +
        '<button type="button" class="btn btn--sm' + (level === 'ok' ? '' : ' btn--primary') + '" data-storage-act="export">Exportar copia</button>' +
        (level === 'full' ? '<button type="button" class="btn btn--sm" data-storage-act="recheck">Volver a revisar</button>' : '') +
        '<button type="button" class="btn btn--sm btn--ghost" data-storage-act="close">Cerrar</button>' +
      '</div>';

    pill.title = 'Memoria: ' + fmtSize(u.totalChars) + ' de ~' + fmtSize(u.limitChars) + ' (' + fmtPercent(u.percent) + ')';
    var order = { ok: 0, warn: 1, full: 2 };
    if (order[level] > order[storageLevelShown]) toggleStoragePanel(true);
    storageLevelShown = level;
  }

  function toggleStoragePanel(open) {
    var panel = $('#storagePanel');
    var show = typeof open === 'boolean' ? open : panel.hidden;
    panel.hidden = !show;
    $('#storagePill').setAttribute('aria-expanded', String(show));
  }

  function isQuotaFull(err) { return err && err.code === 'QUOTA_FULL'; }

  function onStorageFull() {
    closeScrims();
    storageFullFlag = true;
    say('No se pudo guardar: la memoria está llena');
    loadAndRender();
    toggleStoragePanel(true);
    /* El botón vive en el encabezado: si quedó fuera de vista, se sube hasta él */
    var header = $('.page-header');
    if (header && header.getBoundingClientRect().bottom < 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderToday() {
    var iso = localTodayIso(), today = todayIndex();
    var pct = today === null ? (+iso.slice(0, 4) > YEAR ? 100 : 0) : Math.round(((today + 1) / TOTAL_DAYS) * 100);
    var left = today === null ? 0 : TOTAL_DAYS - today - 1;
    $('#todayChip').innerHTML = 'Hoy <b>' + esc(fmtShort(iso)) + '</b> · ' + pct + '% del año · ' + left + ' días para cerrar ' + YEAR;
    $('#yearFill').style.width = pct + '%';
  }

  /* ---------- arrastre de cajitas (mover, cambiar de fila, estirar) ---------- */
  var drag = null;

  function laneDayAt(lane, clientX) {
    var rect = lane.getBoundingClientRect();
    return D.clampIndex(Math.floor((clientX - rect.left) / dayWidth()));
  }

  function showTip(text, x, y) { var t = $('#dragTip'); t.textContent = text; t.style.left = (x + 14) + 'px'; t.style.top = (y + 14) + 'px'; t.hidden = false; }
  function hideTip() { $('#dragTip').hidden = true; }

  function onPointerDown(e) {
    var el = e.target.closest('.tl-box');
    if (!el || e.button !== 0) return;
    var box = board.boxes.find(function (b) { return b.id === el.dataset.boxId; });
    if (!box) return;
    var handle = e.target.closest('[data-handle]');
    drag = {
      el: el, box: box, mode: handle ? handle.dataset.handle : 'move',
      startX: e.clientX, startY: e.clientY, moved: false,
      origStart: D.dayIndex(box.start), origEnd: D.dayIndex(box.end),
      origLeft: el.offsetLeft, origTop: el.offsetTop, origWidth: el.offsetWidth,
      newStart: D.dayIndex(box.start), newEnd: D.dayIndex(box.end), rowId: box.rowId
    };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag) return;
    var dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    drag.el.classList.add('is-dragging');
    var w = dayWidth(), shift = Math.round(dx / w);
    var duration = drag.origEnd - drag.origStart;

    if (drag.mode === 'move') {
      var start = Math.max(0, Math.min(TOTAL_DAYS - 1 - duration, drag.origStart + shift));
      drag.newStart = start; drag.newEnd = start + duration;
      drag.el.style.left = (drag.origLeft + (start - drag.origStart) * w) + 'px';
      drag.el.style.top = (drag.origTop + dy) + 'px';
      var under = document.elementsFromPoint(e.clientX, e.clientY).find(function (n) { return n.classList && n.classList.contains('tl-lane'); });
      if (under) drag.rowId = under.dataset.rowId;
    } else if (drag.mode === 'start') {
      drag.newStart = Math.max(0, Math.min(drag.origEnd, drag.origStart + shift));
      drag.el.style.left = (drag.newStart * w) + 'px';
      drag.el.style.width = ((drag.origEnd - drag.newStart + 1) * w - 2) + 'px';
    } else {
      drag.newEnd = Math.min(TOTAL_DAYS - 1, Math.max(drag.origStart, drag.origEnd + shift));
      drag.el.style.width = ((drag.newEnd - drag.origStart + 1) * w - 2) + 'px';
    }
    var row = board.rows.find(function (r) { return r.id === drag.rowId; });
    showTip(fmtRange(D.fromIndex(drag.newStart), D.fromIndex(drag.newEnd)) + (drag.mode === 'move' && row ? ' · ' + row.title : ''), e.clientX, e.clientY);
  }

  async function onPointerUp() {
    if (!drag) return;
    var d = drag; drag = null;
    hideTip();
    if (!d.moved) { openBoxModal({ boxId: d.box.id }); return; }
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    await RoadmapStore.updateBox(d.box.id, { start: D.fromIndex(d.newStart), end: D.fromIndex(d.newEnd), rowId: d.rowId });
    say('Movida a ' + fmtRange(D.fromIndex(d.newStart), D.fromIndex(d.newEnd)));
    loadAndRender();
  }

  /* Clic en un espacio vacío de una fila: crea una cajita en ese día */
  function onTimelineClick(e) {
    if (suppressClick) return;
    var rowAct = e.target.closest('[data-row-act]');
    if (rowAct) { handleRowAction(rowAct.dataset.rowAct, rowAct.dataset.id); return; }
    if (e.target.closest('[data-act="add-row"]')) { openRowModal(null); return; }
    var lane = e.target.closest('.tl-lane');
    if (lane && !e.target.closest('.tl-box')) {
      var start = laneDayAt(lane, e.clientX);
      var defaultSpan = { month: 29, week: 13, day: 4 }[board.prefs.view] || 6;
      openBoxModal({ rowId: lane.dataset.rowId, start: D.fromIndex(start), end: D.fromIndex(D.clampIndex(start + defaultSpan)) });
    }
  }

  async function handleRowAction(act, id) {
    if (act === 'edit') { openRowModal(id); return; }
    await RoadmapStore.moveRow(id, act === 'up' ? -1 : 1);
    loadAndRender();
  }

  /* ---------- vista, sidebar y "hoy" ---------- */
  function scrollToToday(smooth) {
    var today = todayIndex();
    if (today === null) return;
    var wrap = $('#timelineWrap');
    var labelW = $('.tl-corner') ? $('.tl-corner').offsetWidth : 210;
    var target = today * dayWidth() - (wrap.clientWidth - labelW) / 3;
    wrap.scrollTo({ left: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' });
  }

  async function setView(view) {
    await RoadmapStore.setPrefs({ view: view });
    board.prefs.view = view;
    render();
    scrollToToday(false);
  }

  function applySidebar() {
    var collapsed = !!board.prefs.sidebarCollapsed;
    document.body.classList.toggle('is-full', collapsed);
    var btn = $('#sidebarToggle');
    btn.textContent = collapsed ? '›' : '‹';
    btn.setAttribute('aria-label', collapsed ? 'Mostrar barra lateral' : 'Ocultar barra lateral');
    btn.title = collapsed ? 'Mostrar barra lateral' : 'Pantalla completa';
  }

  async function toggleSidebar() {
    board.prefs.sidebarCollapsed = !board.prefs.sidebarCollapsed;
    applySidebar();
    await RoadmapStore.setPrefs({ sidebarCollapsed: board.prefs.sidebarCollapsed });
  }

  /* ---------- modales: utilidades ---------- */
  function openScrim(id) { $('#' + id).hidden = false; }
  function closeScrims() { $$('.scrim').forEach(function (s) { s.hidden = true; }); }
  function options(list, labelKey, selected) {
    return list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === selected ? ' selected' : '') + '>' + esc(x[labelKey]) + '</option>'; }).join('');
  }

  /* ---------- modal: cajita ---------- */
  function updateDurationHint() {
    var s = $('#boxStart').value, e = $('#boxEnd').value;
    if (!s || !e) { $('#boxDuration').textContent = ''; return; }
    var n = daysBetween(s, e);
    $('#boxDuration').textContent = n < 1 ? 'La fecha de fin es anterior al inicio: se van a invertir al guardar.' :
      n === 1 ? 'Dura 1 día: se va a mostrar como hito (rombo).' :
      'Dura ' + n + ' días (' + (n / 7).toFixed(1).replace('.0', '') + ' semanas).';
  }

  function openBoxModal(opts) {
    $('#boxForm').reset();
    $('#boxRow').innerHTML = options(board.rows, 'title', opts.rowId);
    $('#boxCategory').innerHTML = options(board.categories, 'name');
    $('#deleteBoxBtn').hidden = true;
    $('#boxProgressLabel').textContent = '0%';
    $('.more').open = false;

    if (opts.boxId) {
      var box = board.boxes.find(function (b) { return b.id === opts.boxId; });
      if (!box) return;
      $('#boxModalTitle').textContent = 'Editar cajita';
      $('#boxModalSub').textContent = fmtRange(box.start, box.end);
      $('#boxId').value = box.id;
      $('#boxTitle').value = box.title;
      $('#boxRow').value = box.rowId;
      $('#boxCategory').value = box.categoryId;
      $('#boxStart').value = box.start;
      $('#boxEnd').value = box.end;
      $('#boxDesc').value = box.desc || '';
      $('#boxOwner').value = box.owner || '';
      $('#boxProgress').value = box.progress || 0;
      $('#boxProgressLabel').textContent = (box.progress || 0) + '%';
      $('#boxLink').value = box.link || '';
      $('#boxNotes').value = box.notes || '';
      $('.more').open = !!(box.owner || box.progress || box.link || box.notes);
      $('#deleteBoxBtn').hidden = false;
    } else {
      $('#boxModalTitle').textContent = 'Nueva cajita';
      $('#boxModalSub').textContent = 'Elegí la fila, las fechas y la categoría.';
      $('#boxId').value = '';
      $('#boxStart').value = opts.start || localTodayIso();
      $('#boxEnd').value = opts.end || opts.start || localTodayIso();
    }
    updateDurationHint();
    openScrim('scrimBox');
    setTimeout(function () { $('#boxTitle').focus(); }, 30);
  }

  async function handleBoxSubmit(e) {
    e.preventDefault();
    var id = $('#boxId').value;
    var data = {
      title: $('#boxTitle').value.trim(),
      rowId: $('#boxRow').value,
      categoryId: $('#boxCategory').value,
      start: $('#boxStart').value,
      end: $('#boxEnd').value,
      desc: $('#boxDesc').value.trim(),
      owner: $('#boxOwner').value.trim(),
      progress: +$('#boxProgress').value,
      link: $('#boxLink').value.trim(),
      notes: $('#boxNotes').value.trim()
    };
    if (!data.title || !data.rowId || !data.start || !data.end) return;
    if (data.start.slice(0, 4) !== String(YEAR) || data.end.slice(0, 4) !== String(YEAR)) { say('Las fechas tienen que ser de ' + YEAR); return; }
    if (id) { await RoadmapStore.updateBox(id, data); say('Cajita actualizada'); }
    else { await RoadmapStore.addBox(data); say('Cajita creada'); }
    closeScrims();
    loadAndRender();
  }

  async function handleDeleteBox() {
    var id = $('#boxId').value;
    if (!id || !confirm('¿Eliminar esta cajita?')) return;
    await RoadmapStore.deleteBox(id);
    say('Cajita eliminada');
    closeScrims();
    loadAndRender();
  }

  /* ---------- modal: fila ---------- */
  function openRowModal(rowId) {
    $('#rowForm').reset();
    $('#rowKind').innerHTML = options(board.rowKinds, 'name');
    $('#deleteRowBtn').hidden = !rowId;
    if (rowId) {
      var row = board.rows.find(function (r) { return r.id === rowId; });
      if (!row) return;
      $('#rowModalTitle').textContent = 'Editar fila';
      $('#rowId').value = row.id;
      $('#rowTitle').value = row.title;
      $('#rowKind').value = row.kindId;
    } else {
      $('#rowModalTitle').textContent = 'Nueva fila';
      $('#rowId').value = '';
      var vert = board.rowKinds.find(function (k) { return /vertiente/i.test(k.name); });
      if (vert) $('#rowKind').value = vert.id;
    }
    openScrim('scrimRow');
    setTimeout(function () { $('#rowTitle').focus(); }, 30);
  }

  async function handleRowSubmit(e) {
    e.preventDefault();
    var id = $('#rowId').value;
    var data = { title: $('#rowTitle').value.trim(), kindId: $('#rowKind').value };
    if (!data.title) return;
    if (id) { await RoadmapStore.updateRow(id, data); say('Fila actualizada'); }
    else { await RoadmapStore.addRow(data); say('Fila agregada'); }
    closeScrims();
    loadAndRender();
  }

  async function handleDeleteRow() {
    var id = $('#rowId').value;
    if (!id || !confirm('¿Eliminar esta fila y todas sus cajitas?')) return;
    await RoadmapStore.deleteRow(id);
    say('Fila eliminada');
    closeScrims();
    loadAndRender();
  }

  /* ---------- editor de leyenda (categorías) ---------- */
  function renderLegendEditor() {
    $('#legendEditor').innerHTML = board.categories.map(function (c) {
      var swatches = RoadmapStore.COLORS.map(function (col) {
        return '<button type="button" class="c-' + col + (col === c.color ? ' is-on' : '') + '" data-cat-color="' + col + '" data-id="' + c.id + '" title="' + esc(RoadmapStore.COLOR_LABELS[col]) + '"></button>';
      }).join('');
      return '<div class="editor-item" data-id="' + c.id + '">' +
        '<div class="row">' +
          '<span class="legend-swatch c-' + esc(c.color) + (c.style === 'dashed' ? ' is-dashed' : '') + '"></span>' +
          '<input class="input grow" data-cat-field="name" data-id="' + c.id + '" value="' + esc(c.name) + '" placeholder="Nombre">' +
          '<button type="button" class="icon-btn danger" data-cat-del="' + c.id + '" aria-label="Eliminar categoría">×</button>' +
        '</div>' +
        '<textarea class="input" data-cat-field="meaning" data-id="' + c.id + '" placeholder="¿Qué significa?">' + esc(c.meaning) + '</textarea>' +
        '<div class="row between">' +
          '<div class="swatch-pick">' + swatches + '</div>' +
          '<div class="seg">' +
            '<button type="button" class="' + (c.style !== 'dashed' ? 'is-on' : '') + '" data-cat-style="solid" data-id="' + c.id + '">Sólido</button>' +
            '<button type="button" class="' + (c.style === 'dashed' ? 'is-on' : '') + '" data-cat-style="dashed" data-id="' + c.id + '">Punteado</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  async function refreshAfterEditor(editorRender) {
    board = await RoadmapStore.getBoard();
    render();
    editorRender();
  }

  async function onLegendEditorEvent(e) {
    var t = e.target;
    try {
      if (e.type === 'change' && t.dataset.catField) {
        var patch = {}; patch[t.dataset.catField] = t.value.trim();
        await RoadmapStore.updateCategory(t.dataset.id, patch);
      } else if (e.type === 'click' && t.dataset.catColor) {
        await RoadmapStore.updateCategory(t.dataset.id, { color: t.dataset.catColor });
      } else if (e.type === 'click' && t.dataset.catStyle) {
        await RoadmapStore.updateCategory(t.dataset.id, { style: t.dataset.catStyle });
      } else if (e.type === 'click' && t.dataset.catDel) {
        if (!confirm('¿Eliminar esta categoría? Sus cajitas pasan a la primera categoría.')) return;
        await RoadmapStore.deleteCategory(t.dataset.catDel);
      } else { return; }
      refreshAfterEditor(renderLegendEditor);
    } catch (err) { if (isQuotaFull(err)) onStorageFull(); else say(err.message); }
  }

  /* ---------- editor de tipos de fila ---------- */
  function renderKindsEditor() {
    $('#kindsEditor').innerHTML = board.rowKinds.map(function (k) {
      var count = board.rows.filter(function (r) { return r.kindId === k.id; }).length;
      return '<div class="editor-item"><div class="row">' +
        '<input class="input grow" data-kind-field="name" data-id="' + k.id + '" value="' + esc(k.name) + '">' +
        '<span class="chip">' + count + ' fila' + (count === 1 ? '' : 's') + '</span>' +
        '<button type="button" class="icon-btn danger" data-kind-del="' + k.id + '" aria-label="Eliminar tipo">×</button>' +
      '</div></div>';
    }).join('');
  }

  async function onKindsEditorEvent(e) {
    var t = e.target;
    try {
      if (e.type === 'change' && t.dataset.kindField) {
        await RoadmapStore.updateRowKind(t.dataset.id, { name: t.value.trim() || 'Sin nombre' });
      } else if (e.type === 'click' && t.dataset.kindDel) {
        if (!confirm('¿Eliminar este tipo? Sus filas pasan al primer tipo.')) return;
        await RoadmapStore.deleteRowKind(t.dataset.kindDel);
      } else { return; }
      refreshAfterEditor(renderKindsEditor);
    } catch (err) { if (isQuotaFull(err)) onStorageFull(); else say(err.message); }
  }

  /* ---------- exportar / importar ---------- */
  async function exportJson() {
    var state = await RoadmapStore.exportState();
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'pali-roadmap-' + localTodayIso() + '.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = async function () {
      try {
        await RoadmapStore.importState(JSON.parse(reader.result));
        say('Roadmap importado');
        loadAndRender();
      } catch (err) { if (isQuotaFull(err)) onStorageFull(); else say('No se pudo importar: ' + err.message); }
    };
    reader.readAsText(file);
  }

  /* ---------- eventos ---------- */
  function bindEvents() {
    /* Cualquier guardado que falle por memoria llena termina acá */
    window.addEventListener('unhandledrejection', function (e) {
      if (isQuotaFull(e.reason)) { e.preventDefault(); onStorageFull(); }
    });
    $('#storagePill').addEventListener('click', function () { toggleStoragePanel(); });
    $('#storagePanel').addEventListener('click', function (e) {
      var act = e.target.closest('[data-storage-act]');
      if (!act) return;
      if (act.dataset.storageAct === 'export') exportJson();
      if (act.dataset.storageAct === 'close') toggleStoragePanel(false);
      if (act.dataset.storageAct === 'recheck') { storageFullFlag = false; renderStorage(); }
    });
    /* Clic afuera cierra el detalle (salvo que esté llena) */
    document.addEventListener('click', function (e) {
      if (e.target.closest('#storageWidget')) return;
      if (!$('#storageWidget').classList.contains('is-full')) toggleStoragePanel(false);
    });

    var timeline = $('#timeline');
    timeline.addEventListener('pointerdown', onPointerDown);
    timeline.addEventListener('pointermove', onPointerMove);
    timeline.addEventListener('pointerup', onPointerUp);
    timeline.addEventListener('pointercancel', function () { drag = null; hideTip(); loadAndRender(); });
    timeline.addEventListener('click', onTimelineClick);

    $('#sidebarToggle').addEventListener('click', toggleSidebar);
    $$('#viewSeg button').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
    $('[data-act="go-today"]').addEventListener('click', function () { scrollToToday(true); });

    $('#boxForm').addEventListener('submit', handleBoxSubmit);
    $('#deleteBoxBtn').addEventListener('click', handleDeleteBox);
    $('#boxStart').addEventListener('change', function () {
      if ($('#boxEnd').value < this.value) $('#boxEnd').value = this.value;
      updateDurationHint();
    });
    $('#boxEnd').addEventListener('change', updateDurationHint);
    $('#boxProgress').addEventListener('input', function () { $('#boxProgressLabel').textContent = this.value + '%'; });
    $$('#quickDates button').forEach(function (b) {
      b.addEventListener('click', function () {
        var start = $('#boxStart').value || localTodayIso();
        $('#boxEnd').value = D.fromIndex(D.clampIndex(D.dayIndex(start) + (+b.dataset.dur) - 1));
        updateDurationHint();
      });
    });

    $('#rowForm').addEventListener('submit', handleRowSubmit);
    $('#deleteRowBtn').addEventListener('click', handleDeleteRow);

    $('[data-act="edit-legend"]').addEventListener('click', function () { renderLegendEditor(); openScrim('scrimLegend'); });
    $('#legendEditor').addEventListener('change', onLegendEditorEvent);
    $('#legendEditor').addEventListener('click', onLegendEditorEvent);
    $('[data-act="add-category"]').addEventListener('click', async function () {
      await RoadmapStore.addCategory({ name: 'Nueva categoría', color: 'ink', meaning: '' });
      refreshAfterEditor(renderLegendEditor);
    });

    $('[data-act="edit-kinds"]').addEventListener('click', function () { renderKindsEditor(); openScrim('scrimKinds'); });
    $('#kindsEditor').addEventListener('change', onKindsEditorEvent);
    $('#kindsEditor').addEventListener('click', onKindsEditorEvent);
    $('[data-act="add-kind"]').addEventListener('click', async function () {
      await RoadmapStore.addRowKind('Nuevo tipo');
      refreshAfterEditor(renderKindsEditor);
    });

    $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeScrims); });
    $$('.scrim').forEach(function (s) { s.addEventListener('click', function (e) { if (e.target === s) closeScrims(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeScrims(); });

    $('[data-act="export"]').addEventListener('click', exportJson);
    $('[data-act="import"]').addEventListener('click', function () { $('#importFile').click(); });
    $('#importFile').addEventListener('change', function () { if (this.files[0]) importJson(this.files[0]); this.value = ''; });
    $('[data-act="reset"]').addEventListener('click', async function () {
      if (!confirm('¿Restablecer el roadmap a los datos de ejemplo? Se pierden tus cambios (exportá antes si querés guardarlos).')) return;
      await RoadmapStore.resetSampleData();
      say('Datos de ejemplo restablecidos');
      await loadAndRender();
      scrollToToday(false);
    });

    /* La línea de hoy se actualiza sola si la página queda abierta */
    setInterval(function () { render(); }, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) render(); });
  }

  bindEvents();
  loadAndRender().then(function () { scrollToToday(false); });
})();
