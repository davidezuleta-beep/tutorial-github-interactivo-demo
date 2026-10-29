(function () {
  "use strict";

  var T = window.TUTORIAL;
  var ICON = window.ICONOS || {};
  var pasos = T.pasos;
  var total = pasos.length;
  var $ = function (id) { return document.getElementById(id); };

  var el = {};
  ["intro", "player", "done", "introTitle", "introText", "introList", "doneTitle", "doneText", "doneList",
   "progressFill", "progressLabel", "modules", "stageWrap", "stage", "canvas", "spot", "hit", "cursor",
   "toast", "tip", "tipMeta", "tipText", "tipHint", "backBtn", "repeatBtn", "playBtn", "practiceBtn",
   "restartBtn", "simNote", "startDemoBtn", "startPracticeBtn", "againPracticeBtn", "againDemoBtn",
   "editor", "editorOut"
  ].forEach(function (k) { el[k] = $(k); });

  var editing = /[?&]editar=1/.test(location.search);
  var idx = -1;              // -1 = bienvenida, 0..total-1 = pasos, total = final
  var mode = "practica";     // "demo" | "practica"
  var playing = false;
  var busy = false;
  var flowTimers = [], autoTimers = [];
  var view = null;           // { name, key, root, scroller }
  var scale = 1;
  var targetEl = null;
  var scrolling = false;

  // ---------- utilidades ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>"); }
  function plain(s) { return String(s).replace(/\*+/g, ""); }
  function later(fn, ms) { flowTimers.push(setTimeout(fn, ms)); }
  function auto(fn, ms) { autoTimers.push(setTimeout(fn, ms)); }
  function clearFlow() { flowTimers.forEach(clearTimeout); flowTimers = []; }
  function clearAuto() { autoTimers.forEach(clearTimeout); autoTimers = []; }
  function modulo(id) { for (var i = 0; i < T.modulos.length; i++) if (T.modulos[i].id === id) return i; return 0; }
  function narrow() { return window.matchMedia("(max-width: 700px)").matches; }
  function place(node, x, y, w, h) {
    node.style.left = x + "px"; node.style.top = y + "px";
    if (w != null) { node.style.width = w + "px"; node.style.height = h + "px"; }
  }

  // Tamaño de la "ventana" simulada de GitHub (se escala para caber en pantalla)
  function dims() { return narrow() ? { w: 768, h: 640, key: "sm" } : { w: 1024, h: 600, key: "lg" }; }

  // ---------- construcción de vistas ----------
  function icon(name, cls) {
    var p = ICON[name];
    if (!p) return "";
    return '<svg class="oc' + (cls ? " " + cls : "") + '" viewBox="0 0 16 16" aria-hidden="true">' + p + "</svg>";
  }
  function expand(node) {
    var parts = node.querySelectorAll("[data-parcial]");
    Array.prototype.forEach.call(parts, function (ph) {
      var tpl = document.getElementById("parcial-" + ph.getAttribute("data-parcial"));
      if (!tpl) return;
      var frag = tpl.content.cloneNode(true);
      expand(frag);
      if (ph.classList.contains("gh-md")) { ph.removeAttribute("data-parcial"); ph.appendChild(frag); }
      else ph.replaceWith(frag);
    });
    Array.prototype.forEach.call(node.querySelectorAll("i[data-ic]"), function (i) {
      var span = document.createElement("span");
      span.style.display = "contents";
      span.innerHTML = icon(i.getAttribute("data-ic"), i.className);
      i.replaceWith(span);
    });
  }
  function buildView(name) {
    var d = dims();
    var tpl = document.getElementById("vista-" + name);
    var frag = tpl.content.cloneNode(true);
    expand(frag);
    el.canvas.innerHTML = "";
    el.canvas.appendChild(frag);
    var root = el.canvas.firstElementChild;
    root.style.width = d.w + "px";
    root.style.height = d.h + "px";
    root.setAttribute("data-base", root.className);
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Réplica de la interfaz de GitHub");
    el.stage.style.setProperty("--vw", d.w);
    el.stage.style.setProperty("--vh", d.h);
    view = { name: name, key: d.key, root: root, scroller: root.querySelector(".gh-scroll") };
    el.canvas.classList.add("fading");
    void el.canvas.offsetWidth;
    el.canvas.classList.remove("fading");
    fit();
  }
  function fit() {
    if (!view) return;
    scale = el.stage.clientWidth / dims().w;
    el.canvas.style.transform = "scale(" + scale + ")";
  }

  // ---------- precarga de textos ----------
  el.introTitle.textContent = T.titulo;
  el.introText.textContent = T.subtitulo;
  el.doneTitle.textContent = T.final.titulo;
  el.doneText.textContent = T.final.texto;
  T.modulos.forEach(function (m, i) {
    [el.introList, el.doneList].forEach(function (list) {
      var li = document.createElement("li"); li.textContent = m.nombre; list.appendChild(li);
    });
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="label">' + esc(m.nombre) + "</span>";
    b.setAttribute("aria-label", "Ir al módulo " + (i + 1) + ": " + m.nombre);
    b.addEventListener("click", function () {
      for (var k = 0; k < total; k++) if (pasos[k].modulo === m.id) { go(k); return; }
    });
    el.modules.appendChild(b);
  });

  // ---------- navegación ----------
  function show(which) {
    el.intro.hidden = which !== "intro";
    el.player.hidden = which !== "player";
    el.done.hidden = which !== "done";
  }
  function setProgress(n, label) {
    el.progressFill.style.width = (n / total * 100) + "%";
    el.progressLabel.textContent = label;
  }
  function go(i) {
    clearFlow(); clearAuto();
    busy = false;
    idx = i;
    if (i < 0) { show("intro"); setProgress(0, "0 de " + total); return; }
    if (i >= total) {
      show("done"); setProgress(total, "Completado"); playing = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    show("player");
    renderStep();
  }

  function setMode(m, play) {
    mode = m;
    playing = m === "demo" && play !== false;
    el.cursor.classList.toggle("on", m === "demo");
    updateModeUI();
  }
  function updateModeUI() {
    if (mode === "demo") {
      el.playBtn.textContent = playing ? "⏸ Pausar demo" : "▶ Continuar demo";
      el.practiceBtn.hidden = false;
      el.simNote.textContent = "Demo automática: observa cómo se hace. Puedes pausarla o practicar tú mismo.";
    } else {
      el.playBtn.textContent = "▶ Ver demo";
      el.practiceBtn.hidden = true;
      el.simNote.textContent = "Simulación: haz clic donde indica el globo. Nada de lo que hagas aquí cambia GitHub.";
    }
  }

  // ---------- render de un paso ----------
  function renderStep() {
    var p = pasos[idx];
    var mi = modulo(p.modulo);
    setProgress(idx, "Paso " + (idx + 1) + " de " + total);
    Array.prototype.forEach.call(el.modules.children, function (b, k) {
      b.classList.toggle("current", k === mi);
      b.classList.toggle("complete", k < mi);
      if (k === mi) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });

    var sameView = view && view.name === p.vista && view.key === dims().key && el.canvas.firstElementChild === view.root;
    if (!sameView) buildView(p.vista);

    // Estado de la pantalla (menús abiertos, campos rellenos…)
    view.root.className = view.root.getAttribute("data-base") + (p.estado ? " " + p.estado : "");
    Array.prototype.forEach.call(view.root.querySelectorAll("input"), function (inp) { inp.value = ""; inp.classList.remove("focus"); });
    Object.keys(p.rellenar || {}).forEach(function (sel) {
      var f = view.root.querySelector(sel);
      if (f) { if ("value" in f) f.value = p.rellenar[sel]; else f.textContent = p.rellenar[sel]; }
    });

    el.tipMeta.innerHTML = "<b>Paso " + (idx + 1) + " de " + total + "</b> · " + esc(T.modulos[mi].nombre);
    el.tipText.innerHTML = md(p.instruccion);
    el.tipHint.hidden = true;
    el.toast.hidden = true;
    el.spot.className = "spot";
    el.hit.setAttribute("aria-label", plain(p.instruccion));
    el.backBtn.disabled = idx === 0;
    updateModeUI();

    targetEl = view.root.querySelector(p.objetivo);
    if (!sameView && view.scroller) view.scroller.scrollTop = 0;
    hideMarkers(true);
    ensureVisible(targetEl, sameView, function () {
      hideMarkers(false);
      layout();
      later(layout, 200);
      if (mode === "demo" && playing) scheduleAuto();
      else if (mode === "practica" && !narrow()) el.hit.focus({ preventScroll: true });
    });
  }

  function hideMarkers(h) {
    el.spot.style.visibility = h ? "hidden" : "visible";
    el.tip.classList.toggle("hide", h);
    el.hit.style.display = h ? "none" : "block";
  }

  // Desplaza la página simulada para que el objetivo quede a la vista
  function ensureVisible(node, smooth, done) {
    var sc = view && view.scroller;
    if (!node || !sc || !sc.contains(node)) { done(); return; }
    var sr = sc.getBoundingClientRect(), nr = node.getBoundingClientRect();
    var top = (nr.top - sr.top) / scale + sc.scrollTop;
    var h = nr.height / scale, vh = sc.clientHeight;
    var margin = 40;
    // deja espacio debajo si el objetivo abre un menú
    var extra = node.closest(".gh-vis-wrap, .right") ? 160 : 0;
    if (top >= sc.scrollTop + margin && top + h + extra <= sc.scrollTop + vh - margin) { done(); return; }
    var dest = Math.max(0, Math.min(top - (vh - h - extra) / 2, sc.scrollHeight - vh));
    if (!smooth) { sc.scrollTop = dest; done(); return; }
    var from = sc.scrollTop, t0 = null, dur = 550;
    scrolling = true;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1);
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      sc.scrollTop = from + (dest - from) * e;
      if (k < 1) requestAnimationFrame(step); else { scrolling = false; done(); }
    })(performance.now());
  }

  // ---------- geometría ----------
  function layout() {
    if (idx < 0 || idx >= total || !view) return;
    if (view.key !== dims().key) { renderStep(); return; }
    fit();
    if (!targetEl) return;
    var s = el.stage.getBoundingClientRect(), r = targetEl.getBoundingClientRect();
    var sw = el.stage.clientWidth, sh = el.stage.clientHeight;
    var x = r.left - s.left, y = r.top - s.top, w = r.width, h = r.height, pad = 4;
    var sx = Math.max(x - pad, 2), sy = Math.max(y - pad, 2);
    var sr = Math.min(x + w + pad, sw - 2), sb = Math.min(y + h + pad, sh - 2);
    place(el.spot, sx, sy, sr - sx, sb - sy);

    var hw = Math.max(w + 8, 40), hh = Math.max(h + 8, 40);
    place(el.hit, Math.min(Math.max(x + w / 2 - hw / 2, 0), sw - hw), Math.min(Math.max(y + h / 2 - hh / 2, 0), sh - hh), hw, hh);

    positionTip(sx, sy, sr - sx, sb - sy, sw, sh);
  }

  function positionTip(x, y, w, h, sw, sh) {
    var tip = el.tip;
    tip.classList.remove("below", "above", "left", "right");
    if (narrow()) return;
    var oy = el.stage.offsetTop;
    var tw = tip.offsetWidth, th = tip.offsetHeight, gap = 16, m = 10;
    var cx = x + w / 2, cy = y + h / 2, side, tx, ty;
    var fits = {
      below: y + h + gap + th <= sh - m, above: y - gap - th >= m,
      right: x + w + gap + tw <= sw - m, left: x - gap - tw >= m
    };
    var pref = { abajo: "below", arriba: "above", derecha: "right", izquierda: "left" }[pasos[idx].globo];
    side = pref && fits[pref] ? pref : fits.below ? "below" : fits.above ? "above" : fits.right ? "right" : fits.left ? "left" : "above";

    if (side === "below" || side === "above") {
      tx = Math.min(Math.max(cx - tw / 2, m), sw - tw - m);
      ty = side === "below" ? y + h + gap : y - gap - th;
      tip.style.setProperty("--ax", Math.min(Math.max(cx - tx, 18), tw - 18) + "px");
    } else {
      ty = Math.min(Math.max(cy - th / 2, m), sh - th - m);
      tx = side === "right" ? x + w + gap : x - gap - tw;
      tip.style.setProperty("--ay", Math.min(Math.max(cy - ty, 18), th - 18) + "px");
    }
    tip.classList.add(side);
    place(tip, tx, ty + oy);
  }

  window.addEventListener("resize", function () { if (!scrolling) layout(); });
  if (window.ResizeObserver) new ResizeObserver(function () { if (!scrolling) layout(); }).observe(el.stage);

  // ---------- interacción ----------
  el.hit.addEventListener("click", function (e) {
    e.stopPropagation();
    if (editing || busy || scrolling) return;
    clearAuto();
    success();
  });
  el.stage.addEventListener("click", function (e) {
    if (editing || busy || scrolling || idx < 0 || idx >= total) return;
    if (e.target.closest && e.target.closest(".hit")) return;
    miss(e);
  });

  function miss(e) {
    var p = pasos[idx];
    el.tipHint.innerHTML = "<strong>Pista:</strong> " + md(p.pista);
    el.tipHint.hidden = false;
    el.tipHint.classList.remove("flash"); void el.tipHint.offsetWidth; el.tipHint.classList.add("flash");
    el.spot.classList.remove("miss"); void el.spot.offsetWidth; el.spot.classList.add("miss");
    dot("miss-dot", e.clientX, e.clientY);
    layout();
  }
  function dot(cls, clientX, clientY) {
    var r = el.stage.getBoundingClientRect();
    var d = document.createElement("span");
    d.className = cls;
    d.style.left = (clientX - r.left) + "px";
    d.style.top = (clientY - r.top) + "px";
    el.stage.appendChild(d);
    setTimeout(function () { d.remove(); }, 650);
  }

  function success() {
    var p = pasos[idx];
    busy = true;
    el.tipHint.hidden = true;
    el.spot.classList.add("ok");
    if (p.escribir && targetEl && "value" in targetEl) {
      targetEl.classList.add("focus");
      el.hit.style.display = "none";
      var i = 0;
      (function tick() {
        targetEl.value = p.escribir.slice(0, ++i);
        if (i < p.escribir.length) later(tick, 90); else later(next, 650);
      })();
    } else if (p.copiar) {
      copy(p.copiar);
      view.root.classList.add("copiado");
      el.toast.textContent = "✓ URL copiada: " + p.copiar;
      el.toast.hidden = false;
      later(next, 2100);
    } else {
      later(next, 380);
    }
  }
  function next() { go(idx + 1); }

  function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).catch(function () {});
    } catch (err) { /* sin portapapeles: la simulación continúa */ }
  }

  // ---------- demo automática ----------
  function scheduleAuto() {
    clearAuto();
    var p = pasos[idx];
    var read = Math.min(1300 + plain(p.instruccion).length * 26, 3800);
    auto(function () {
      if (!targetEl) return;
      var s = el.stage.getBoundingClientRect(), r = targetEl.getBoundingClientRect();
      var cx = r.left - s.left + r.width / 2, cy = r.top - s.top + r.height / 2;
      el.cursor.style.left = cx + "px";
      el.cursor.style.top = cy + "px";
      auto(function () {
        el.cursor.classList.add("press");
        dot("ripple", s.left + cx, s.top + cy);
        auto(function () {
          el.cursor.classList.remove("press");
          if (!busy) success();
        }, 160);
      }, 850);
    }, read);
  }

  // ---------- controles ----------
  el.startDemoBtn.addEventListener("click", function () { setMode("demo"); go(0); });
  el.startPracticeBtn.addEventListener("click", function () { setMode("practica"); go(0); });
  el.againDemoBtn.addEventListener("click", function () { setMode("demo"); go(0); });
  el.againPracticeBtn.addEventListener("click", function () { setMode("practica"); go(0); });
  el.backBtn.addEventListener("click", function () { go(idx - 1); });
  el.repeatBtn.addEventListener("click", function () { go(idx); });
  el.restartBtn.addEventListener("click", function () { playing = false; go(-1); });
  el.playBtn.addEventListener("click", function () {
    if (mode !== "demo") { setMode("demo"); if (!busy) scheduleAuto(); return; }
    playing = !playing;
    updateModeUI();
    if (playing) { if (!busy) scheduleAuto(); } else clearAuto();
  });
  el.practiceBtn.addEventListener("click", function () {
    clearAuto();
    setMode("practica");
    if (!busy) go(idx);
  });

  // ---------- modo edición (?editar=1) ----------
  if (editing) {
    el.editor.hidden = false;
    el.stage.classList.add("editing");
    el.hit.style.pointerEvents = "none";
    el.canvas.addEventListener("mousemove", function (e) {
      var n = e.target, label = "";
      while (n && n !== el.canvas) {
        if (n.id) { label = "#" + n.id; break; }
        n = n.parentElement;
      }
      el.editorOut.textContent = label || "(sin id: añade id=\"…\" al elemento en index.html)";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" && idx < total - 1) go(idx + 1);
      if (e.key === "ArrowLeft" && idx > 0) go(idx - 1);
    });
    setMode("practica");
    go(0);
  } else {
    updateModeUI();
    go(-1);
  }
})();
