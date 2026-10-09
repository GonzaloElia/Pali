/* ==========================================================================
   Pali · Roadmap — capa de datos (localStorage)
   Roadmap por fechas reales, acotado a un año (2026, MVP):
   - rows: filas del eje Y. Cada una pertenece a un tipo de fila (rowKinds).
   - boxes: cajitas con fecha de inicio y fin (YYYY-MM-DD, fin inclusive),
            asociadas a una fila y a una categoría (color + significado).
   - categories: leyenda editable (nombre, color, estilo sólido/punteado, significado).
   - rowKinds: tipos de fila editables (Hito, Vertiente de negocio).
   - prefs: vista (mes/semana/día) y sidebar plegado.
   Único punto de contacto con los datos. Expone `RoadmapStore` con Promesas,
   mismo patrón que mockup/js/mock-api.js.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_KEY = "pali-roadmap-v3";
  var LEGACY_KEY = "pali-roadmap-v2";
  var YEAR = 2026;

  var COLORS = ["brand", "forest", "mint", "coral", "mute", "ink"];
  var COLOR_LABELS = { brand: "Verde", forest: "Verde bosque", mint: "Menta", coral: "Coral", mute: "Gris", ink: "Negro" };
  var VIEWS = ["month", "week", "day"];

  /* ---------- fechas ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dayIndex(iso) {
    var p = String(iso).split("-");
    return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(YEAR, 0, 1)) / 86400000);
  }
  function fromIndex(i) {
    var d = new Date(Date.UTC(YEAR, 0, 1) + i * 86400000);
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }
  function daysInYear() { return (YEAR % 4 === 0 && YEAR % 100 !== 0) || YEAR % 400 === 0 ? 366 : 365; }
  function clampIndex(i) { return Math.max(0, Math.min(daysInYear() - 1, i)); }
  function clampDate(iso) { return fromIndex(clampIndex(dayIndex(iso))); }

  function uid(prefix) { return (prefix || "i") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function byOrder(a, b) { return a.order - b.order; }
  function nextOrder(list) { return list.length ? Math.max.apply(null, list.map(function (i) { return i.order; })) + 1 : 0; }

  /* ---------- estado por defecto ---------- */
  function defaultCategories() {
    return [
      { id: "cat-def", name: "Definido", color: "brand", style: "solid", meaning: "Alcance acordado por el equipo y planificado." },
      { id: "cat-hito", name: "Hito", color: "forest", style: "solid", meaning: "Fecha clave o entrega puntual (por ejemplo, salir en vivo)." },
      { id: "cat-prop", name: "Propuesta / a confirmar", color: "mute", style: "dashed", meaning: "Idea o propuesta que todavía no es decisión. Por eso el borde punteado." },
      { id: "cat-baja", name: "No prioritario / riesgo", color: "coral", style: "solid", meaning: "Fuera del MVP, de baja prioridad o con un riesgo a vigilar." }
    ];
  }
  function defaultRowKinds() {
    return [
      { id: "kind-hito", name: "Hito" },
      { id: "kind-vert", name: "Vertiente de negocio" }
    ];
  }
  function defaultState() {
    var rows = [
      { id: uid("r"), title: "Lanzamiento", kindId: "kind-hito", order: 0 },
      { id: uid("r"), title: "Backoffice", kindId: "kind-vert", order: 1 },
      { id: uid("r"), title: "Chatbot WhatsApp", kindId: "kind-vert", order: 2 },
      { id: uid("r"), title: "Comercial", kindId: "kind-vert", order: 3 }
    ];
    function box(row, title, desc, start, end, cat) {
      return { id: uid("b"), rowId: row.id, title: title, desc: desc, start: start, end: end, categoryId: cat, owner: "", progress: 0, notes: "", link: "" };
    }
    return {
      year: YEAR,
      rowKinds: defaultRowKinds(),
      categories: defaultCategories(),
      rows: rows,
      boxes: [
        box(rows[0], "Primer cliente en vivo", "2 canchas, pago presencial.", "2026-11-30", "2026-11-30", "cat-hito"),
        box(rows[1], "Agenda + Reservas", "Reservar en 2 clics, pago en caja.", "2026-10-05", "2026-10-30", "cat-def"),
        box(rows[1], "Personas y Cobros", "Buscador único e historial por cancha.", "2026-11-02", "2026-11-27", "cat-def"),
        box(rows[2], "Consulta de disponibilidad", "El chatbot consulta turnos antes de ofrecer.", "2026-10-19", "2026-11-27", "cat-prop"),
        box(rows[2], "Pago online", "Mercado Pago u otra app de cobros.", "2026-12-01", "2026-12-23", "cat-baja"),
        box(rows[3], "Comparación con Clubo", "Definir en qué nos diferenciamos.", "2026-10-12", "2026-10-23", "cat-prop")
      ],
      prefs: { view: "month", sidebarCollapsed: false },
      meta: { updatedAt: new Date().toISOString() }
    };
  }

  /* Migra el formato anterior (períodos Q1..Q4) a fechas reales */
  function migrateLegacy(old) {
    var state = defaultState();
    var periods = (old.periods || []).slice().sort(byOrder);
    var span = Math.floor(daysInYear() / Math.max(periods.length, 1));
    function periodStart(id) { var i = periods.findIndex(function (p) { return p.id === id; }); return fromIndex(clampIndex(Math.max(i, 0) * span)); }
    function periodEnd(id) { var i = periods.findIndex(function (p) { return p.id === id; }); return fromIndex(clampIndex((Math.max(i, 0) + 1) * span - 1)); }
    var colorToCat = { brand: "cat-def", forest: "cat-hito", mute: "cat-prop", coral: "cat-baja" };
    state.rows = (old.rows || []).map(function (r) { return { id: r.id, title: r.title, kindId: r.kind === "hito" ? "kind-hito" : "kind-vert", order: r.order }; });
    state.boxes = (old.boxes || []).map(function (b) {
      return { id: b.id, rowId: b.rowId, title: b.title, desc: b.desc || "", start: periodStart(b.startPeriodId), end: periodEnd(b.endPeriodId), categoryId: colorToCat[b.color] || "cat-def", owner: "", progress: 0, notes: "", link: "" };
    });
    return state;
  }

  function read() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        var legacy = localStorage.getItem(LEGACY_KEY);
        var s = legacy ? migrateLegacy(JSON.parse(legacy)) : defaultState();
        trySave(s);
        return s;
      }
      var parsed = JSON.parse(raw);
      if (!parsed.rows || !parsed.boxes || !parsed.categories) throw new Error("estado incompleto");
      parsed.rowKinds = parsed.rowKinds || defaultRowKinds();
      parsed.prefs = parsed.prefs || { view: "month", sidebarCollapsed: false };
      return parsed;
    } catch (e) {
      var fallback = defaultState();
      trySave(fallback);
      return fallback;
    }
  }

  /* ---------- capacidad ----------
     El navegador da ~5 millones de caracteres por origen (aprox. 5 MB).
     Las páginas abiertas con doble clic (file://) comparten ese espacio. */
  var QUOTA_CHARS = 5 * 1024 * 1024;
  var lastWriteFailed = false;

  function isQuotaError(e) {
    return !!e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014);
  }

  function write(state) {
    state.meta = state.meta || {};
    state.meta.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      lastWriteFailed = false;
    } catch (e) {
      if (!isQuotaError(e)) throw e;
      lastWriteFailed = true;
      var full = new Error("La memoria está llena: el último cambio no se guardó.");
      full.code = "QUOTA_FULL";
      throw full;
    }
  }

  /* Guarda sin cortar la lectura (el aviso de memoria llena queda marcado igual) */
  function trySave(state) { try { write(state); } catch (e) { /* lastWriteFailed ya quedó en true */ } }

  function usage() {
    var total = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      total += key.length + (localStorage.getItem(key) || "").length;
    }
    var own = (localStorage.getItem(STORE_KEY) || "").length;
    return {
      roadmapChars: own,
      totalChars: total,
      limitChars: QUOTA_CHARS,
      percent: (function (p) { return p > 0 && p < 0.1 ? p : Math.min(100, Math.round(p * 10) / 10); })((total / QUOTA_CHARS) * 100),
      full: lastWriteFailed
    };
  }

  function findById(list, id, label) {
    var item = list.find(function (x) { return x.id === id; });
    if (!item) throw new Error(label + " no encontrado");
    return item;
  }

  /* Ejecuta una mutación sobre el estado, lo guarda y devuelve una Promesa */
  function mutate(fn) {
    try {
      var state = read();
      var result = fn(state);
      write(state);
      return Promise.resolve(result === undefined ? true : clone(result));
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function normalizeRange(data) {
    var start = clampDate(data.start), end = clampDate(data.end || data.start);
    if (dayIndex(end) < dayIndex(start)) { var tmp = start; start = end; end = tmp; }
    data.start = start; data.end = end;
    return data;
  }

  var RoadmapStore = {
    YEAR: YEAR,
    COLORS: COLORS,
    COLOR_LABELS: COLOR_LABELS,
    VIEWS: VIEWS,
    date: { dayIndex: dayIndex, fromIndex: fromIndex, daysInYear: daysInYear, clampIndex: clampIndex, clampDate: clampDate },

    getBoard: function () {
      var state = read();
      return Promise.resolve({
        year: YEAR,
        rowKinds: clone(state.rowKinds),
        categories: clone(state.categories),
        rows: clone(state.rows).sort(byOrder),
        boxes: clone(state.boxes),
        prefs: clone(state.prefs)
      });
    },

    setPrefs: function (patch) { return mutate(function (s) { Object.assign(s.prefs, patch); return s.prefs; }); },

    /* ---------- filas ---------- */
    addRow: function (data) {
      return mutate(function (s) {
        var row = { id: uid("r"), title: data.title || "Nueva fila", kindId: data.kindId || (s.rowKinds[0] && s.rowKinds[0].id), order: nextOrder(s.rows) };
        s.rows.push(row);
        return row;
      });
    },
    updateRow: function (id, patch) { return mutate(function (s) { return Object.assign(findById(s.rows, id, "Fila"), patch); }); },
    moveRow: function (id, direction) {
      return mutate(function (s) {
        var list = s.rows.slice().sort(byOrder);
        var idx = list.findIndex(function (r) { return r.id === id; });
        var swap = idx + direction;
        if (idx === -1 || swap < 0 || swap >= list.length) return false;
        var tmp = list[idx].order; list[idx].order = list[swap].order; list[swap].order = tmp;
        return true;
      });
    },
    deleteRow: function (id) {
      return mutate(function (s) {
        s.rows = s.rows.filter(function (r) { return r.id !== id; });
        s.boxes = s.boxes.filter(function (b) { return b.rowId !== id; });
      });
    },

    /* ---------- tipos de fila ---------- */
    addRowKind: function (name) { return mutate(function (s) { var k = { id: uid("k"), name: name || "Nuevo tipo" }; s.rowKinds.push(k); return k; }); },
    updateRowKind: function (id, patch) { return mutate(function (s) { return Object.assign(findById(s.rowKinds, id, "Tipo"), patch); }); },
    deleteRowKind: function (id) {
      return mutate(function (s) {
        if (s.rowKinds.length <= 1) throw new Error("Tiene que quedar al menos un tipo de fila");
        s.rowKinds = s.rowKinds.filter(function (k) { return k.id !== id; });
        s.rows.forEach(function (r) { if (r.kindId === id) r.kindId = s.rowKinds[0].id; });
      });
    },

    /* ---------- categorías (leyenda de colores) ---------- */
    addCategory: function (data) {
      return mutate(function (s) {
        var c = { id: uid("c"), name: data.name || "Nueva categoría", color: data.color || "brand", style: data.style || "solid", meaning: data.meaning || "" };
        s.categories.push(c);
        return c;
      });
    },
    updateCategory: function (id, patch) { return mutate(function (s) { return Object.assign(findById(s.categories, id, "Categoría"), patch); }); },
    deleteCategory: function (id) {
      return mutate(function (s) {
        if (s.categories.length <= 1) throw new Error("Tiene que quedar al menos una categoría");
        s.categories = s.categories.filter(function (c) { return c.id !== id; });
        s.boxes.forEach(function (b) { if (b.categoryId === id) b.categoryId = s.categories[0].id; });
      });
    },

    /* ---------- cajitas ---------- */
    addBox: function (data) {
      return mutate(function (s) {
        var b = normalizeRange({
          id: uid("b"), rowId: data.rowId, title: data.title || "Sin título", desc: data.desc || "",
          start: data.start, end: data.end, categoryId: data.categoryId || s.categories[0].id,
          owner: data.owner || "", progress: +data.progress || 0, notes: data.notes || "", link: data.link || ""
        });
        s.boxes.push(b);
        return b;
      });
    },
    updateBox: function (id, patch) {
      return mutate(function (s) {
        var b = findById(s.boxes, id, "Cajita");
        Object.assign(b, patch);
        return normalizeRange(b);
      });
    },
    deleteBox: function (id) { return mutate(function (s) { s.boxes = s.boxes.filter(function (b) { return b.id !== id; }); }); },

    resetSampleData: function () {
      try { var s = defaultState(); write(s); return Promise.resolve(clone(s)); }
      catch (e) { return Promise.reject(e); }
    },
    getUsage: function () { return Promise.resolve(usage()); },
    exportState: function () { return Promise.resolve(clone(read())); },
    importState: function (data) {
      return mutate(function (s) {
        if (!data || !data.rows || !data.boxes || !data.categories) throw new Error("El archivo no es un roadmap válido");
        s.rows = data.rows; s.boxes = data.boxes; s.categories = data.categories;
        s.rowKinds = data.rowKinds || defaultRowKinds();
        s.boxes.forEach(normalizeRange);
      });
    }
  };

  window.RoadmapStore = RoadmapStore;
})();
