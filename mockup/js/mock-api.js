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

  var STORE_KEY = "pali-mock-v7";

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
      turnPrice: 7000,          // estimado; lo carga el administrador
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
    var people = names.map(function (n, i) {
      /* La categoría es obligatoria: toda persona tiene una */
      return { id: "p" + (i + 1), firstName: n[0], lastName: n[1], phone: "11 5555-" + (1000 + i * 37), categoryId: categories[(i * 3) % 8].id, alias: i === 12 ? "Tincho" : "", createdAt: addDays(today(), -300 + i * 20) };
    });
    var s = {
      settings: defaultSettings(),
      courts: [
        { id: "c1", name: "Cancha 1", sport: "Paddle", active: true },
        { id: "c2", name: "Cancha 2", sport: "Paddle", active: true }
      ],
      categories: categories,
      people: people,
      bookings: [],
      seq: { booking: 1, person: people.length + 1, court: 3 }
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
              var pid = people[Math.floor(r() * people.length)].id;
              if (ids.indexOf(pid) < 0) ids.push(pid);
            }
            s.bookings.push({
              id: "b" + (s.seq.booking++), date: date, courtId: c.id, start: tm.start, end: tm.end,
              status: "active", source: "backoffice",
              participantIds: ids,
              amount: s.settings.turnPrice
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
  function ensure() { if (!state) { state = load(); save(); } return state; }

  /* Grilla del día a partir de los parámetros (la disponibilidad se calcula, no se guarda) */
  function buildTimes(settings) {
    var step = settings.slotMinutes;
    var last = toMin(settings.lastSlotStart);
    var minStart = toMin(settings.firstSlotNear) - step / 2;
    var out = [];
    for (var m = last; m >= minStart; m -= step) out.unshift({ start: toHHMM(m), end: toHHMM(m + step) });
    return out;
  }

  function personName(p) { return p ? p.firstName + " " + p.lastName : ""; }
  /* Cómo se muestra una persona al elegirla: "Juan Pérez" o, si tiene alias, "Juan Pérez (alias)" */
  function personLabel(p) { return p ? personName(p) + (p.alias ? " (" + p.alias + ")" : "") : ""; }
  /* Persona con el nombre de su categoría (opcional: "" si no tiene) */
  function pview(p) {
    var c = ensure().categories.filter(function (x) { return x.id === p.categoryId; })[0];
    return Object.assign({}, p, { category: c ? c.name : "", label: personLabel(p) });
  }
  function view(b) {
    var st = ensure();
    var court = st.courts.filter(function (c) { return c.id === b.courtId; })[0];
    var cap = st.settings.playersPerBooking;
    return Object.assign({}, b, {
      courtName: court ? court.name : "",
      capacity: cap,
      /* Estado calculado por cantidad de personas: 0 = free (Libre) · 1 a 3 = booked (Reservado) · 4 = full (Completo). cancelled se guarda */
      state: b.status === "cancelled" ? "cancelled" : (b.participantIds.length >= cap ? "full" : (b.participantIds.length >= 1 ? "booked" : "free")),
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
    util: { today: today, addDays: addDays, fmtDate: fmtDate, parseDate: parseDate, personName: personName, personLabel: personLabel },

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
      var taken = st.bookings.some(function (x) { return x.date === p.date && x.courtId === p.courtId && x.start === p.start && x.status === "active"; });
      if (taken) return fail("El turno ya está reservado");
      if (!p.personIds || !p.personIds.length) return fail("Para reservar hay que sumar al menos una persona. Un turno sin personas está Libre.");
      var end = toHHMM(toMin(p.start) + st.settings.slotMinutes);
      var b = {
        id: "b" + (st.seq.booking++), date: p.date, courtId: p.courtId, start: p.start, end: end,
        status: "active", source: p.source || "backoffice", participantIds: p.personIds || [],
        amount: st.settings.turnPrice
      };
      st.bookings.push(b); save(); return done(view(b));
    },
    /* POST /bookings/:id/participants (candidato) */
    addParticipant: function (id, personId) {
      var b = findBooking(id);
      if (b.participantIds.indexOf(personId) >= 0) return done(view(b));
      if (b.participantIds.length >= ensure().settings.playersPerBooking) return fail("El turno ya está completo");
      b.participantIds.push(personId);
      save(); return done(view(b));
    },
    /* DELETE /bookings/:id/participants/:personId (candidato) */
    /* Si se quita a la última persona, el turno queda en 0 personas = Libre: la reserva se libera y devuelve null */
    removeParticipant: function (id, personId) {
      var st = ensure(), b = findBooking(id);
      b.participantIds = b.participantIds.filter(function (x) { return x !== personId; });
      if (!b.participantIds.length) { st.bookings = st.bookings.filter(function (x) { return x.id !== id; }); save(); return done(null); }
      save(); return done(view(b));
    },
    /* POST /bookings/:id/cancel (candidato) */
    cancelBooking: function (id) { var b = findBooking(id); b.status = "cancelled"; save(); return done(view(b)); },

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
    /* GET /people/:id/history (candidato): en qué canchas jugó */
    getPersonHistory: function (personId) {
      var st = ensure();
      var list = st.bookings.filter(function (b) { return b.status === "active" && b.participantIds.indexOf(personId) >= 0; })
        .sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(view);
      return done(list);
    },

    /* Cobros · GET /income?granularity=&year= (candidato)
       Sin registro de pago por turno: suma turnos no cancelados hasta hoy × precio (estimado).
       granularity: day (últimos 7 días) | week (últimas 8 semanas) | month (12 meses del año) */
    getIncome: function (q) {
      var st = ensure();
      var paid = st.bookings.filter(function (b) { return b.status === "active" && b.date <= today(); });
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
        if (idx >= 0) values[idx] += b.amount;
      });
      return done({ granularity: q.granularity, labels: labels, keys: keys, values: values, total: values.reduce(function (a, b) { return a + b; }, 0) });
    },
    /* GET /income/summary (candidato): hoy, esta semana, este mes */
    getIncomeSummary: function () {
      var st = ensure(), t = today(), mon = mondayOf(t), ym = t.slice(0, 7);
      var sum = { today: 0, week: 0, month: 0 };
      st.bookings.forEach(function (b) {
        if (b.status !== "active") return;
        if (b.date === t) sum.today += b.amount;
        if (b.date >= mon && b.date <= t) sum.week += b.amount;
        if (b.date.slice(0, 7) === ym && b.date <= t) sum.month += b.amount;
      });
      return done(sum);
    },

    /* Solo del prototipo: vuelve a los datos de ejemplo */
    reset: function () { state = seed(); save(); return done(true); }
  };
})();
