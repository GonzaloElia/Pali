/* ==========================================================================
   Pali · Menú lateral (única fuente de verdad)
   Para cambiar el orden o el nombre de una pestaña se edita SOLO la lista NAV.
   Cada página declara cuál es la actual con <aside class="sidebar" data-nav="agenda">.
   ========================================================================== */
(function () {
  "use strict";

  /* Pantallas del backoffice, en el orden en que se muestran. Los nombres son provisorios. */
  var NAV = [
    { key: "cobros",        href: "cobros.html",        label: "Cobros" },
    { key: "agenda",        href: "agenda.html",        label: "Agenda" },
    { key: "personas",      href: "personas.html",      label: "Personas" },
    { key: "reservas",      href: "reservas.html",      label: "Reservas" },
    { key: "configuracion", href: "configuracion.html", label: "Configuración" }
  ];
  var MAP = { key: "index", href: "index.html", label: "Mapa de flujos", n: "00" };
  var GALLERY = { key: "components", href: "components.html", label: "Componentes", n: "06" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function item(it, current) {
    return '<a class="nav-item' + (it.key === current ? " is-active" : "") + '" href="' + it.href + '"><span class="n">' + it.n + "</span>" + esc(it.label) + "</a>";
  }

  var side = document.currentScript && document.currentScript.parentNode;
  if (!side || !side.classList.contains("sidebar")) return;
  var current = side.getAttribute("data-nav"), set = side.getAttribute("data-nav-set") || "screens";
  var screens = NAV.map(function (s, i) { return { key: s.key, href: s.href, label: s.label, n: pad(i + 1) }; });
  var items = set === "all" ? [MAP].concat(screens, [GALLERY]) : set === "meta" ? [MAP, GALLERY] : screens;
  var html = '<nav class="nav-list">' + items.map(function (it) { return item(it, current); }).join("") + "</nav>";
  document.currentScript.insertAdjacentHTML("beforebegin", html);
})();
