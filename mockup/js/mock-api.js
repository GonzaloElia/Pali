/* ==========================================================================
   Pali · Capa de datos simulada (mock API)
   --------------------------------------------------------------------------
   Es el ÚNICO archivo JS del prototipo. Toda la interfaz y la interacción
   viven en el HTML (JavaScript dentro de cada página). Las pantallas NUNCA tocan los datos directo:
   hablan con `PaliApi`, que hoy responde con datos de ejemplo guardados en el
   navegador (localStorage) para que los flujos se conecten entre pantallas.

   Cuando se definan los endpoints, cada método se reemplaza por un fetch()
   con la misma firma y la misma forma de respuesta. Las pantallas no cambian.
   Todos los métodos devuelven Promesas, igual que lo haría la red.

   Los endpoints de cada método son CANDIDATOS (propuesta), no están definidos.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_KEY = "pali-mock-v10";

  /* ---------- utilidades de fecha y hora ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseDate(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parseDate(s); d.setDate(d.getDate() + n); return fmtDate(d); }
  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function toHHMM(m) { return pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60); }
  function today() { return fmtDate(new Date()); }
  function mondayOf(s) { var d = parseDate(s); var wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return fmtDate(d); }
  function norm(s) { return (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* Generador pseudoaleatorio con semilla: los datos de ejemplo son siempre los mismos */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- estado ---------- */
  var state = null;

  function defaultSettings() {
    return {
      sport: "Paddle",
      slotMinutes: 90,          // parámetro: hoy 1 h 30 min
      lastSlotStart: "22:30",   // el último turno empieza 22:30
      firstSlotNear: "11:00",   // el primer turno cae cerca de las 11:00
      playersPerBooking: 4,     // parámetro: personas para que un turno esté completo (paddle = 4)
      trackPayments: false,     // este club cobra en caja: el prototipo no registra quién abonó
      historyMonths: 4,         // historial visible de cada jugador: últimos N meses (ventana móvil). A confirmar
      editWindowDays: 14,       // parámetro: hasta cuántos días atrás se puede modificar un turno (dos semanas). A confirmar
      playerPrice: 7000,        // precio por jugador por turno (estimado); lo carga el administrador. Turno completo = playerPrice × playersPerBooking
      currency: "ARS"
    };
  }

  function seed() {
    var r = rng(2026);
    var names = [
      ["Martín", "Gómez"], ["Lucía", "Fernández"], ["Santiago", "Rossi"], ["Camila", "Herrera"],
      ["Nicolás", "Paz"], ["Valentina", "Ortiz"], ["Joaquín", "Molina"], ["Sofía", "Benítez"],
      ["Tomás", "Acosta"], ["Julieta", "Ríos"], ["Facundo", "Silva"], ["Agustina", "Navarro"],
      ["Martín", "Gómez"]   // mismo nombre y apellido que el primero: se distingue por el alias
    ];
    /* Categorías: lista cerrada (enum) que depende del club y del deporte. Hoy, paddle: 1ra a 8va */
    var categories = ["1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va"].map(function (n, i) {
      return { id: "cat" + (i + 1), sport: "Paddle", name: n, order: i + 1 };
    });
    /* Más personas de ejemplo (137 en total) para probar la paginación de la tabla de Personas */
    var firsts = ["Matías","Lucas","Federico","Ignacio","Franco","Gonzalo","Diego","Pablo","Sebastián","Maximiliano","Emiliano","Bruno","Andrés","Ramiro","Leandro","Ezequiel","Mariano","Hernán","Damián","Rodrigo","Carolina","Florencia","Paula","Micaela","Daniela","Romina","Luciana","Natalia","Marina","Carla","Belén","Antonella","Victoria","Milagros","Rocío","Candela","Noelia","Gabriela","Verónica","Mercedes"];
    var lasts = ["Pérez","Rodríguez","López","Martínez","Díaz","Sánchez","Romero","Álvarez","Torres","Ruiz","Ramírez","Flores","Castro","Vega","Medina","Suárez","Giménez","Peralta","Sosa","Cabrera","Aguirre","Luna","Ibáñez","Domínguez","Correa","Figueroa","Maldonado","Cáceres","Ledesma","Arias","Moreno","Bravo","Campos","Franco","Godoy","Quiroga","Rojas","Villalba","Méndez","Bustos"];
    for (var k = 0; k < 124; k++) names.push([firsts[(k * 7) % firsts.length], lasts[(k * 11 + Math.floor(k / 40)) % lasts.length]]);
    var people = names.map(function (n, i) {
      /* La categoría es obligatoria: toda persona tiene una */
      return { id: "p" + (i + 1), firstName: n[0], lastName: n[1], phone: "11 5555-" + (1000 + i * 37), categoryId: categories[(i * 3 + Math.floor(i / 8)) % 8].id, alias: i === 12 ? "Tincho" : "", createdAt: addDays(today(), -300 + (i * 20) % 295) };
    });
    var s = {
      settings: defaultSettings(),
      /* Promos y descuentos: precio especial para un rango de turnos (ejemplo: el de las 22:30) */
      priceRules: [
        { id: "pr1", name: "Promo último turno", kind: "fixed", value: 5000, from: "22:30", to: "22:30", weekdays: [], validFrom: "", validTo: "", active: true }
      ],
      courts: [
        { id: "c1", name: "Cancha 1", sport: "Paddle", active: true },
        { id: "c2", name: "Cancha 2", sport: "Paddle", active: true }
      ],
      categories: categories,
      people: people,
      bookings: [],
      seq: { booking: 1, person: people.length + 1, court: 3, rule: 2 }
    };
    var times = buildTimes(s.settings);
    var t0 = today();
    for (var off = -400; off <= 7; off++) {
      var date = addDays(t0, off);
      s.courts.forEach(function (c) {
        times.forEach(function (tm) {
          if (r() < 0.38) {
            var past = off < 0;
            var n = r() < 0.45 ? 4 : 1 + Math.floor(r() * 3);   // 1 a 3 personas = Reservado; 4 = Completo (con 0 el turno está Libre)
            var ids = [];
            while (ids.length < n) {
              var pid = people[Math.floor(r() * 115)].id;   // las últimas personas cargadas todavía no jugaron
              if (ids.indexOf(pid) < 0) ids.push(pid);
            }
            s.bookings.push({
              id: "b" + (s.seq.booking++), date: date, courtId: c.id, start: tm.start, end: tm.end,
              status: "active", source: "backoffice",
              participantIds: ids,
              playerPrice: s.settings.playerPrice
            });
          }
        });
      });
    }
    return s;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* sin storage: se usa memoria */ }
    return seed();
  }
  function save() {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
  }
  function ensure() {
    if (!state) {
      state = load();
      /* migración del prototipo: la ventana de edición pasó de 6 días a dos semanas (12/10) */
      if (state.settings && (state.settings.editWindowDays === undefined || state.settings.editWindowDays === 6)) state.settings.editWindowDays = 14;
      /* datos de ejemplo: los turnos pasados en Reservado se dan por finalizados, salvo algunos de los últimos días,
         que quedan pendientes para mostrar la tarea del administrador */
      if (!state.flags || !state.flags.finalizedSeed) {
        var lim = addDays(today(), -4), k = 0;
        state.bookings.forEach(function (b) {
          if (b.status !== "active" || !b.participantIds.length || !hasEnded(b) || isFull(b)) return;
          if (b.date >= lim && (k++ % 5 === 0)) return;
          b.finalized = true;
        });
        state.flags = Object.assign({}, state.flags, { finalizedSeed: true });
      }
      save();
    }
    return state;
  }

  /* Grilla del día a partir de los parámetros (la disponibilidad se calcula, no se guarda) */
  function buildTimes(settings) {
    var step = settings.slotMinutes;
    var last = toMin(settings.lastSlotStart);
    var minStart = toMin(settings.firstSlotNear) - step / 2;
    var out = [];
    for (var m = last; m >= minStart; m -= step) out.unshift({ start: toHHMM(m), end: toHHMM(m + step) });
    return out;
  }

  /* Precio por jugador de un turno: el base, o el de la promo activa que aplique (gana la de menor precio) */
  function ruleApplies(r, date, start) {
    if (!r.active) return false;
    if (r.validFrom && date < r.validFrom) return false;
    if (r.validTo && date > r.validTo) return false;
    var wd = (parseDate(date).getDay() + 6) % 7;   // 0 = lunes
    if (r.weekdays.length && r.weekdays.indexOf(wd) < 0) return false;
    var m = toMin(start);
    return m >= toMin(r.from) && m <= toMin(r.to);
  }
  function priceFor(st, date, start) {
    var base = st.settings.playerPrice, best = { price: base, rule: null };
    st.priceRules.forEach(function (r) {
      if (!ruleApplies(r, date, start)) return;
      var p = r.kind === "fixed" ? r.value : Math.round(base * (1 - r.value / 100));
      if (p < best.price) best = { price: p, rule: r };
    });
    return best;
  }

  function personName(p) { return p ? p.firstName + " " + p.lastName : ""; }
  /* Cómo se muestra una persona al elegirla: "Juan Pérez" o, si tiene alias, "Juan Pérez (alias)" */
  function personLabel(p) { return p ? personName(p) + (p.alias ? " (" + p.alias + ")" : "") : ""; }
  /* Persona con el nombre de su categoría (opcional: "" si no tiene) */
  function pview(p) {
    var c = ensure().categories.filter(function (x) { return x.id === p.categoryId; })[0];
    return Object.assign({}, p, { category: c ? c.name : "", label: personLabel(p) });
  }
  /* Turnos pasados: se pueden modificar hasta editWindowDays días atrás (14 por defecto: dos semanas) */
  function editWindow() { var w = ensure().settings.editWindowDays; return w === undefined || w === null ? 14 : Number(w); }
  /* Historial visible: desde hace N meses (mismo día, ajustado a fin de mes). Lo anterior no se consulta, para que el sistema no se vuelva lento. */
  function historyFrom() {
    var n = ensure().settings.historyMonths; n = n === undefined || n === null ? 4 : Number(n);
    var d = new Date(), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() - n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return fmtDate(d);
  }
  function isLocked(date) { return date < addDays(today(), -editWindow()); }
  function assertEditable(b) { if (isLocked(b.date)) throw new Error("Este turno es de una fecha que ya no se puede modificar."); }
  /* Completo = cupo lleno (4 o más personas) o marcado como completado por el administrador. Solo los Completos suman en Cobros */
  /* Un turno "ya se jugó" cuando pasó su hora de fin (de 14:00 a 15:00: a las 15:01). Si termina a las 00:00, cuenta como el día siguiente */
  function hasEnded(b) {
    var t = today(); if (b.date < t) return true; if (b.date > t) return false;
    var s = toMin(b.start), e = toMin(b.end); if (e <= s) return false;
    var n = new Date(); return n.getHours() * 60 + n.getMinutes() >= e;
  }
  /* Finalizado: el turno ya se jugó y se cobró. Pasa solo desde Completo al terminar el horario,
     o a mano desde Reservado si el turno ya se jugó (lo decide el administrador). Solo los Finalizados suman en Cobros. */
  function isDone(b) { return b.status === "active" && b.participantIds.length >= 1 && hasEnded(b) && (b.finalized || isFull(b)); }
  function isFull(b) { return b.status === "active" && b.participantIds.length >= 1 && (b.completed || b.participantIds.length >= ensure().settings.playersPerBooking); }
  function view(b) {
    var st = ensure();
    var court = st.courts.filter(function (c) { return c.id === b.courtId; })[0];
    var cap = st.settings.playersPerBooking;
    return Object.assign({}, b, {
      courtName: court ? court.name : "",
      capacity: cap,
      /* Estado calculado por cantidad de personas: 0 = free (Libre) · 1 a 3 = booked (Reservado) · 4 = full (Completo). cancelled se guarda */
      completed: !!b.completed, locked: isLocked(b.date),
      ended: hasEnded(b), finalized: !!b.finalized,
      state: b.status === "cancelled" ? "cancelled" : (isDone(b) ? "done" : isFull(b) ? "full" : (b.participantIds.length >= 1 ? "booked" : "free")),
      participants: b.participantIds.map(function (id) {
        var p = st.people.filter(function (x) { return x.id === id; })[0];
        return p ? { id: p.id, name: personLabel(p), phone: p.phone, category: pview(p).category } : null;
      }).filter(Boolean)
    });
  }
  function findBooking(id) {
    var b = ensure().bookings.filter(function (x) { return x.id === id; })[0];
    if (!b) throw new Error("Reserva inexistente");
    return b;
  }
  function done(v) { return Promise.resolve(JSON.parse(JSON.stringify(v === undefined ? null : v))); }
  function fail(msg) { return Promise.reject(new Error(msg)); }

  /* ---------- API pública ---------- */
  window.PaliApi = {
    util: { historyFrom: historyFrom, isLocked: isLocked, editWindow: editWindow, today: today, addDays: addDays, fmtDate: fmtDate, parseDate: parseDate, personName: personName, personLabel: personLabel },

    /* Configuración · GET /settings (candidato) */
    getSettings: function () { return done(ensure().settings); },
    /* PATCH /settings (candidato) */
    updateSettings: function (patch) {
      var st = ensure(); Object.assign(st.settings, patch); save(); return done(st.settings);
    },

    /* Categorías · GET /categories?sport= (candidato). Lista cerrada según club y deporte */
    listCategories: function (q) {
      var st = ensure(), sport = (q && q.sport) || st.settings.sport;
      return done(st.categories.filter(function (c) { return c.sport === sport; }).sort(function (a, b) { return a.order - b.order; }));
    },

    /* Canchas · GET /courts (candidato) */
    listCourts: function () { return done(ensure().courts); },
    /* Grilla de horarios para unos parámetros (sin guardarlos) · uso: vista previa en Configuración */
    previewGrid: function (patch) { var st = ensure(); return done(buildTimes(Object.assign({}, st.settings, patch || {}))); },

    /* Promos · GET /price-rules (candidato) */
    listPriceRules: function () { return done(ensure().priceRules); },
    /* POST /price-rules · PATCH /price-rules/:id (candidato) */
    savePriceRule: function (r) {
      var st = ensure(), base = st.settings.playerPrice;
      if (!r.from || !r.to) return fail("Falta completar los turnos desde y hasta");
      if (toMin(r.from) > toMin(r.to)) return fail("El turno final no puede ser anterior al inicial");
      if (r.kind === "fixed" && !(r.value >= 0 && r.value < base)) return fail("El precio promo tiene que ser menor al precio por jugador");
      if (r.kind === "percent" && !(r.value > 0 && r.value <= 100)) return fail("El descuento tiene que estar entre 1 y 100");
      var rule = { id: r.id || "pr" + (st.seq.rule++), name: r.name || "", kind: r.kind, value: r.value, from: r.from, to: r.to,
                   weekdays: r.weekdays || [], validFrom: r.validFrom || "", validTo: r.validTo || "", active: r.active !== false };
      var i = st.priceRules.map(function (x) { return x.id; }).indexOf(rule.id);
      if (i >= 0) st.priceRules[i] = rule; else st.priceRules.push(rule);
      save(); return done(rule);
    },
    /* PATCH /price-rules/:id { active } (candidato) */
    setPriceRuleActive: function (id, active) {
      var r = ensure().priceRules.filter(function (x) { return x.id === id; })[0];
      if (!r) return fail("Promo inexistente");
      r.active = !!active; save(); return done(r);
    },
    /* DELETE /price-rules/:id (candidato). Las reservas ya hechas conservan el precio con el que se hicieron */
    deletePriceRule: function (id) {
      var st = ensure(); st.priceRules = st.priceRules.filter(function (x) { return x.id !== id; }); save(); return done(true);
    },
    /* GET /prices?date= (candidato): precio por jugador y del turno completo para cada horario de un día */
    previewPrices: function (q) {
      var st = ensure(), n = st.settings.playersPerBooking;
      return done(buildTimes(st.settings).map(function (tm) {
        var pr = priceFor(st, q.date, tm.start);
        return { start: tm.start, end: tm.end, price: pr.price, total: pr.price * n, rule: pr.rule ? (pr.rule.name || "Promo " + pr.rule.from) : null };
      }));
    },

    /* PATCH /courts/:id { active } (candidato). Una cancha inactiva no aparece en la agenda ni la sugiere el chatbot */
    setCourtActive: function (id, active) {
      var st = ensure(), c = st.courts.filter(function (x) { return x.id === id; })[0];
      if (!c) return fail("Cancha inexistente");
      c.active = !!active; save(); return done(c);
    },
    /* POST /courts (candidato) */
    addCourt: function (name) {
      var st = ensure();
      var c = { id: "c" + (st.seq.court++), name: name, sport: st.settings.sport, active: true };
      st.courts.push(c); save(); return done(c);
    },

    /* Agenda · GET /availability?date=YYYY-MM-DD (candidato)
       Devuelve filas por horario, con una celda por cancha: free | booked (incompleto) | full (completo) */
    listSlots: function (q) {
      var st = ensure();
      var courts = st.courts.filter(function (c) { return c.active; });
      var rows = buildTimes(st.settings).map(function (tm) {
        return {
          start: tm.start, end: tm.end,
          cells: courts.map(function (c) {
            var b = st.bookings.filter(function (x) {
              return x.date === q.date && x.courtId === c.id && x.start === tm.start && x.status === "active";
            })[0];
            return { courtId: c.id, state: !b ? "free" : view(b).state, booking: (b && view(b).state !== "free") ? view(b) : null };
          })
        };
      });
      return done({ date: q.date, courts: courts, rows: rows });
    },
    /* Reservas · GET /bookings?status=&from=&to= (candidato) */
    listBookings: function (q) {
      q = q || {};
      var st = ensure();
      var list = st.bookings.filter(function (b) {
        if (q.status === "cancelled" && b.status !== "cancelled") return false;
        if (view(b).state === "free") return false;
        if (q.status === "incomplete" && view(b).state !== "booked") return false;
        if (q.status === "full" && view(b).state !== "full") return false;
        if (q.from && b.date < q.from) return false;
        if (q.to && b.date > q.to) return false;
        return true;
      }).sort(function (a, b) { return a.date === b.date ? (a.start < b.start ? -1 : 1) : (a.date < b.date ? -1 : 1); });
      return done(list.map(view));
    },
    /* GET /bookings/:id (candidato) */
    getBooking: function (id) { return done(view(findBooking(id))); },
    /* POST /bookings (candidato) */
    createBooking: function (p) {
      var st = ensure();
      if (isLocked(p.date)) return fail("Esta fecha ya no se puede modificar.");
      var taken = st.bookings.some(function (x) { return x.date === p.date && x.courtId === p.courtId && x.start === p.start && x.status === "active"; });
      if (taken) return fail("El turno ya está reservado");
      if (!p.personIds || !p.personIds.length) return fail("Para reservar hay que sumar al menos una persona. Un turno sin personas está Libre.");
      var end = toHHMM(toMin(p.start) + st.settings.slotMinutes);
      var b = {
        id: "b" + (st.seq.booking++), date: p.date, courtId: p.courtId, start: p.start, end: end,
        status: "active", source: p.source || "backoffice", participantIds: p.personIds || [], completed: !!p.completed,
        playerPrice: priceFor(st, p.date, p.start).price,   // precio por jugador al reservar (con promo si aplica)
        priceRule: priceFor(st, p.date, p.start).rule ? priceFor(st, p.date, p.start).rule.name || "Promo" : null
      };
      st.bookings.push(b); save(); return done(view(b));
    },
    /* POST /bookings/:id/participants (candidato) */
    addParticipant: function (id, personId) {
      var b = findBooking(id);
      try { assertEditable(b); } catch (e) { return fail(e.message); }
      if (b.participantIds.indexOf(personId) >= 0) return done(view(b));
      /* Sin tope: con 4 o más personas el turno figura Completo, pero se pueden seguir sumando (turnos de 6, por ejemplo) */
      b.participantIds.push(personId);
      save(); return done(view(b));
    },
    /* DELETE /bookings/:id/participants/:personId (candidato) */
    /* Si se quita a la última persona, el turno queda en 0 personas = Libre: la reserva se libera y devuelve null */
    removeParticipant: function (id, personId) {
      var st = ensure(), b = findBooking(id);
      try { assertEditable(b); } catch (e) { return fail(e.message); }
      b.completed = false; b.finalized = false;   // si alguien se baja, el turno vuelve a Reservado (se puede sumar otra persona)
      b.participantIds = b.participantIds.filter(function (x) { return x !== personId; });
      if (!b.participantIds.length) { st.bookings = st.bookings.filter(function (x) { return x.id !== id; }); save(); return done(null); }
      save(); return done(view(b));
    },
    /* POST /bookings/:id/cancel (candidato) */
    cancelBooking: function (id) { var b = findBooking(id); try { assertEditable(b); } catch (e) { return fail(e.message); } b.status = "cancelled"; save(); return done(view(b)); },
    /* POST /bookings/:id/complete { completed } (candidato): el administrador marca un turno Reservado como Completo (o lo devuelve a Reservado) */
    /* POST /bookings/:id/finalize (candidato): el administrador pasa a Finalizado un turno Reservado que ya se jugó y no se completó */
    finalizeBooking: function (id) {
      var b = findBooking(id);
      try { assertEditable(b); } catch (e) { return fail(e.message); }
      if (!b.participantIds.length) return fail("Un turno sin personas está Libre.");
      if (!hasEnded(b)) return fail("Solo se puede finalizar un turno que ya se jugó.");
      b.finalized = true; save(); return done(view(b));
    },
    /* GET /bookings/pending-finalize (candidato): turnos que ya se jugaron, quedaron en Reservado y todavía se pueden editar */
    listPendingFinalize: function () {
      var st = ensure();
      var list = st.bookings.filter(function (b) { return b.status === "active" && b.participantIds.length >= 1 && hasEnded(b) && !isDone(b) && !isLocked(b.date); })
        .sort(function (a, b) { return a.date === b.date ? (a.start < b.start ? -1 : 1) : (a.date < b.date ? -1 : 1); });
      return done(list.map(view));
    },
    setBookingCompleted: function (id, completed) {
      var b = findBooking(id);
      try { assertEditable(b); } catch (e) { return fail(e.message); }
      if (completed && !b.participantIds.length) return fail("Un turno sin personas está Libre.");
      b.completed = !!completed; save(); return done(view(b));
    },

    /* Personas · GET /people?q= (candidato). Buscador único por nombre y apellido */
    searchPeople: function (q) {
      var n = norm(q);
      var list = ensure().people.filter(function (p) { return !n || norm(personLabel(p)).indexOf(n) >= 0; });
      return done(list.slice(0, 8).map(pview));
    },
    listPeople: function () { return done(ensure().people.map(pview)); },
    /* POST /people (candidato). Nombre y apellido seguro; teléfono a confirmar; categoría obligatoria y alias opcional.
       El alias distingue a dos personas con el mismo nombre y apellido; se puede crear sin él. */
    createPerson: function (p) {
      var st = ensure();
      var missing = [["firstName", "Nombre"], ["lastName", "Apellido"], ["phone", "Teléfono"], ["categoryId", "Categoría"]].filter(function (f) { return !(p[f[0]] || "").toString().trim(); }).map(function (f) { return f[1]; });
      if (missing.length) return fail("Falta completar: " + missing.join(", ") + ". Son campos obligatorios.");
      var person = { id: "p" + (st.seq.person++), firstName: p.firstName, lastName: p.lastName, phone: p.phone || "", categoryId: p.categoryId, alias: (p.alias || "").trim(), createdAt: today() };
      st.people.push(person); save(); return done(pview(person));
    },
    /* GET /people/:id (candidato): el perfil completo, para editarlo */
    getPerson: function (id) {
      var p = ensure().people.filter(function (x) { return x.id === id; })[0];
      return p ? done(pview(p)) : fail("Persona inexistente");
    },
    /* PATCH /people/:id (candidato): edita nombre, apellido, alias, teléfono y categoría */
    updatePerson: function (id, patch) {
      var st = ensure(), p = st.people.filter(function (x) { return x.id === id; })[0];
      if (!p) return fail("Persona inexistente");
      var req = { firstName: "Nombre", lastName: "Apellido", phone: "Teléfono", categoryId: "Categoría" };
      var miss = Object.keys(req).filter(function (k) { return (k in patch) && !(patch[k] || "").toString().trim(); }).map(function (k) { return req[k]; });
      if (miss.length) return fail("Falta completar: " + miss.join(", ") + ". Son campos obligatorios.");
      ["firstName", "lastName", "alias", "phone", "categoryId"].forEach(function (k) { if (k in patch) p[k] = patch[k]; });
      save(); return done(pview(p));
    },
    /* Tabla de jugadores · GET /people/stats?categoryId=&courtId=&from=&to=&q=&page=&pageSize= (candidato)
       Por persona: veces que jugó (turnos activos hasta hoy), última vez y veces por cancha.
       Con filtro de cancha o período solo quedan quienes jugaron en ese filtro. */
    listPlayers: function (q) {
      q = q || {};
      var st = ensure(), t = today(), stats = {};
      var hf = historyFrom();   // solo se cuenta lo de la ventana de historial; la última vez sí mira todo
      st.bookings.forEach(function (b) {
        if (b.status !== "active" || b.date > t) return;
        if (q.courtId && b.courtId !== q.courtId) return;
        b.participantIds.forEach(function (pid) {
          var s = stats[pid] || (stats[pid] = { plays: 0, last: "", courts: {} });
          if (b.date > s.last) s.last = b.date;
          if (b.date < hf || (q.from && b.date < q.from)) return;
          s.plays++;
          s.courts[b.courtId] = (s.courts[b.courtId] || 0) + 1;
        });
      });
      /* Contador del mes: turnos en estado FINALIZADO de este mes en los que participó la persona. No depende de los filtros de la tabla. */
      var now = new Date(), nowHHMM = pad(now.getHours()) + ":" + pad(now.getMinutes()), ym = t.slice(0, 7), month = {};
      st.bookings.forEach(function (b) {
        if (b.status !== "active" || b.date.slice(0, 7) !== ym) return;
        if (!isDone(b)) return;
        b.participantIds.forEach(function (pid) { month[pid] = (month[pid] || 0) + 1; });
      });
      var filtering = !!(q.courtId || q.from);
      var nq = norm(q.q || "");
      var list = st.people.filter(function (p) {
        return (!q.categoryId || p.categoryId === q.categoryId) && (!filtering || stats[p.id]) && (!nq || norm(personLabel(p)).indexOf(nq) >= 0);
      }).map(function (p) {
        var s = stats[p.id] || { plays: 0, last: "", courts: {} }, v = pview(p);
        v.plays = s.plays; v.monthPlays = month[p.id] || 0; v.lastPlayed = s.last || null;
        v.courts = Object.keys(s.courts).map(function (cid) {
          var c = st.courts.filter(function (x) { return x.id === cid; })[0];
          return { courtId: cid, courtName: c ? c.name : "", count: s.courts[cid] };
        }).sort(function (a, b) { return a.courtName < b.courtName ? -1 : 1; });
        return v;
      });
      list.sort(function (a, b) { return b.monthPlays - a.monthPlays || b.plays - a.plays || (personLabel(a) < personLabel(b) ? -1 : 1); });
      /* Paginación: devuelve solo la página pedida, no todo junto. pageSize permitido: 10, 20, 50 o 100 */
      var size = [10, 20, 50, 100].indexOf(Number(q.pageSize)) >= 0 ? Number(q.pageSize) : 10;
      var pages = Math.max(1, Math.ceil(list.length / size));
      var page = Math.min(Math.max(1, Number(q.page) || 1), pages);
      return done({ items: list.slice((page - 1) * size, page * size), total: list.length, page: page, pageSize: size, totalPages: pages });
    },
    /* GET /people/:id/summary (candidato): totales HISTÓRICOS del jugador (no dependen de la ventana de 4 meses):
       veces que jugó, última vez y veces por cancha. En producción salen de totales guardados, no de recorrer todos los turnos. */
    getPersonSummary: function (personId) {
      var st = ensure(), t = today(), plays = 0, last = null, by = {};
      st.bookings.forEach(function (b) {
        if (b.status !== "active" || b.date > t || b.participantIds.indexOf(personId) < 0) return;
        plays++; by[b.courtId] = (by[b.courtId] || 0) + 1;
        if (!last || b.date > last.date || (b.date === last.date && b.start > last.start)) last = b;
      });
      var courts = Object.keys(by).map(function (cid) { var c = st.courts.filter(function (x) { return x.id === cid; })[0]; return { courtId: cid, courtName: c ? c.name : "", count: by[cid] }; }).sort(function (a, b) { return a.courtName < b.courtName ? -1 : 1; });
      return done({ plays: plays, last: last ? { date: last.date, start: last.start, end: last.end } : null, courts: courts });
    },
    /* GET /people/:id/history (candidato): lista de turnos de la ventana visible (últimos 4 meses). Lo anterior no se muestra. { playedOnly: true } deja solo los turnos hasta hoy */
    getPersonHistory: function (personId, opts) {
      var st = ensure(), only = opts && opts.playedOnly, t = today();
      var hf = historyFrom();
      var list = st.bookings.filter(function (b) { return b.status === "active" && b.participantIds.indexOf(personId) >= 0 && b.date >= hf && (!only || b.date <= t); })
        .sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(view);
      return done(list);
    },

    /* Cobros · GET /income?granularity=&year= (candidato)
       Sin registro de pago: suma, por cada turno no cancelado hasta hoy, las personas anotadas × el precio por jugador (estimado).
       granularity: day (últimos 7 días) | week (últimas 8 semanas) | month (12 meses del año) */
    getIncome: function (q) {
      var st = ensure();
      var paid = st.bookings.filter(function (b) { return isDone(b); });   // solo turnos Finalizados (ya jugados y cobrados)
      var labels = [], keys = [], t = today(), i;
      var MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      if (q.granularity === "day") {
        for (i = 6; i >= 0; i--) { var d = addDays(t, -i); keys.push(d); labels.push(d.slice(8) + "/" + d.slice(5, 7)); }
      } else if (q.granularity === "week") {
        var mon = mondayOf(t);
        for (i = 7; i >= 0; i--) { var w = addDays(mon, -7 * i); keys.push(w); labels.push(w.slice(8) + "/" + w.slice(5, 7)); }
      } else {
        for (i = 0; i < 12; i++) { keys.push(q.year + "-" + pad(i + 1)); labels.push(MES[i]); }
      }
      var values = keys.map(function () { return 0; });
      paid.forEach(function (b) {
        var key = q.granularity === "day" ? b.date : q.granularity === "week" ? mondayOf(b.date) : b.date.slice(0, 7);
        var idx = keys.indexOf(key);
        if (idx >= 0) values[idx] += b.participantIds.length * b.playerPrice;
      });
      /* Ocupación (propuesta, a confirmar): turnos con al menos 1 persona anotada sobre los turnos disponibles de las canchas activas,
         contando solo los días del período que ya pasaron (hasta hoy). null si el período todavía no empezó. */
      var perDay = buildTimes(st.settings).length * st.courts.filter(function (c) { return c.active; }).length;
      var occupancy = keys.map(function (k) {
        var from = q.granularity === "month" ? k + "-01" : k;
        var to = q.granularity === "day" ? k : q.granularity === "week" ? addDays(k, 6) : (function () { var y = Number(k.slice(0, 4)), m = Number(k.slice(5, 7)); return k + "-" + pad(new Date(y, m, 0).getDate()); })();
        if (from > t) return null;
        if (to > t) to = t;
        var days = Math.round((parseDate(to) - parseDate(from)) / 86400000) + 1;
        var used = st.bookings.filter(function (b) { return b.status === "active" && b.participantIds.length >= 1 && b.date >= from && b.date <= to; }).length;
        return perDay && days > 0 ? Math.min(100, Math.round(used / (perDay * days) * 100)) : null;
      });
      return done({ granularity: q.granularity, labels: labels, keys: keys, values: values, occupancy: occupancy, total: values.reduce(function (a, b) { return a + b; }, 0) });
    },
    /* GET /income/summary (candidato): hoy, esta semana, este mes */
    getIncomeSummary: function () {
      var st = ensure(), t = today(), mon = mondayOf(t), ym = t.slice(0, 7);
      var sum = { today: 0, week: 0, month: 0, prevToday: 0, prevWeek: 0, prevMonth: 0 };
      /* Comparación con el período anterior en el mismo tramo transcurrido: ayer, la semana pasada hasta el mismo día
         y el mes pasado hasta el mismo día del mes (propuesta, a confirmar) */
      var yest = addDays(t, -1), prevMon = addDays(mon, -7), prevSame = addDays(t, -7);
      var py = Number(ym.slice(0, 4)), pm = Number(ym.slice(5, 7)) - 1; if (pm === 0) { pm = 12; py--; }
      var prevYm = py + "-" + pad(pm), dom = t.slice(8);
      st.bookings.forEach(function (b) {
        if (!isDone(b)) return;   // solo turnos Finalizados
        var amt = b.participantIds.length * b.playerPrice;   // cada persona anotada paga el precio por jugador
        if (b.date === t) sum.today += amt;
        if (b.date === yest) sum.prevToday += amt;
        if (b.date >= mon && b.date <= t) sum.week += amt;
        if (b.date >= prevMon && b.date <= prevSame) sum.prevWeek += amt;
        if (b.date.slice(0, 7) === ym && b.date <= t) sum.month += amt;
        if (b.date.slice(0, 7) === prevYm && b.date.slice(8) <= dom) sum.prevMonth += amt;
      });
      return done(sum);
    },

    /* Solo del prototipo: vuelve a los datos de ejemplo */
    reset: function () { state = seed(); save(); return done(true); }
  };
})();
