/* FirmFlow marketing site — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- nav ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = $(".nav-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $$(".nav-links a, .nav-cta a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });

  /* ---------- reveal on scroll ---------- */
  var revs = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = e.target.getAttribute("data-reveal-delay") || 0;
          setTimeout(function () { e.target.classList.add("in"); }, +d);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero escalation ladder loop ---------- */
  (function heroLoop() {
    var chip = $("#heroChip"), paid = $("#heroPaid"), ladder = $("#heroLadder");
    if (!chip || !ladder) return;
    var items = $$("li", ladder);
    function reset() {
      chip.textContent = "Pending"; chip.className = "chip chip-pending";
      paid.classList.remove("show");
      items.forEach(function (li) { li.classList.remove("dim"); });
      var st = $(".ladder-state", items[2]);
      if (st) { st.textContent = "calling…"; st.className = "ladder-state active"; }
    }
    function play() {
      if (reduce) return;
      setTimeout(function () {
        var st = $(".ladder-state", items[2]);
        if (st) { st.textContent = "done"; st.className = "ladder-state done"; }
      }, 2600);
      setTimeout(function () {
        chip.textContent = "Paid"; chip.className = "chip chip-paid";
        items.forEach(function (li) { li.classList.add("dim"); });
        paid.classList.add("show");
      }, 3600);
      setTimeout(function () { reset(); }, 6600);
      setTimeout(play, 8200);
    }
    reset();
    setTimeout(play, 1800);
  })();

  /* ---------- automation timeline ---------- */
  (function timeline() {
    var nodes = $$(".tl-node"), cards = $$(".tl-card"),
      prog = $("#tlProgress"), dot = $("#tlDot");
    if (!nodes.length) return;
    var n = nodes.length, cur = 0, timer = null, auto = true;

    function set(i) {
      cur = i;
      nodes.forEach(function (nd, k) {
        nd.classList.toggle("is-active", k === i);
        nd.classList.toggle("done", k < i);
      });
      cards.forEach(function (c, k) { c.classList.toggle("is-active", k === i); });
      var pct = n === 1 ? 0 : (i / (n - 1)) * 100;
      if (prog) prog.style.width = pct + "%";
      if (dot) dot.style.left = pct + "%";
    }
    function next() { set((cur + 1) % n); }
    function start() { if (!reduce && auto) { stop(); timer = setInterval(next, 2600); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    nodes.forEach(function (nd, i) {
      nd.addEventListener("click", function () { auto = false; stop(); set(i); });
      nd.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); auto = false; stop(); set(i); }
      });
    });

    set(0);
    // start autoplay only when in view
    if ("IntersectionObserver" in window && !reduce) {
      var tio = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.3 });
      tio.observe($("#timeline"));
    }
  })();

  /* ---------- AI command bar ---------- */
  (function commandBar() {
    var typed = $("#termTyped"), cursor = $("#termCursor"),
      steps = $$("#termSteps li"), done = $("#termDone");
    if (!typed) return;
    var sentence = "Pull last year's organizer for the Patels, work out what they still owe, and send a request due Apr 1 with reminders.";
    var i = 0, t1;

    function clearSteps() {
      typed.textContent = "";
      steps.forEach(function (s) { s.classList.remove("on"); });
      done.classList.remove("show");
      if (cursor) cursor.style.display = "";
    }
    function runSteps(k) {
      if (k >= steps.length) {
        setTimeout(function () { done.classList.add("show"); }, 500);
        setTimeout(loop, 4200);
        return;
      }
      steps[k].classList.add("on");
      setTimeout(function () { runSteps(k + 1); }, 780);
    }
    function type() {
      if (i <= sentence.length) {
        typed.textContent = sentence.slice(0, i); i++;
        t1 = setTimeout(type, 26);
      } else {
        if (cursor) cursor.style.display = "none";
        setTimeout(function () { runSteps(0); }, 550);
      }
    }
    function loop() { clearSteps(); i = 0; type(); }

    if (reduce) {
      typed.textContent = sentence;
      steps.forEach(function (s) { s.classList.add("on"); });
      done.classList.add("show");
      if (cursor) cursor.style.display = "none";
      return;
    }
    if ("IntersectionObserver" in window) {
      var started = false;
      var cio = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting && !started) { started = true; loop(); }
        });
      }, { threshold: 0.4 });
      cio.observe($(".ai-demo"));
    } else { loop(); }
  })();

  /* ---------- white-label live preview ---------- */
  (function whiteLabel() {
    var input = $("#brandName"), sws = $$("#swatches .sw"),
      badge = $("#wlBadge"), name = $("#wlName"), title = $("#wlTitle"), av = $("#wlAv");
    if (!input) return;
    function initials(s) {
      var p = s.trim().split(/\s+/).filter(Boolean);
      if (!p.length) return "F";
      return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase();
    }
    function applyName() {
      var v = input.value || "Your Firm";
      name.textContent = v;
      title.textContent = v + " · Client Portal";
      var ini = initials(v);
      badge.textContent = ini; av.textContent = ini;
    }
    function applyColor(c) {
      // dark theme: brand solid + lighter tints for accent text/gradients
      document.body.style.setProperty("--brand", c);
      document.body.style.setProperty("--brand-bright", tint(c, 0.32));
      document.body.style.setProperty("--brand-strong", tint(c, 0.42));
    }
    // hex helpers
    function hex2rgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    function rgb2hex(r) { return "#" + r.map(function (x) { x = Math.max(0, Math.min(255, Math.round(x))); return ("0" + x.toString(16)).slice(-2); }).join(""); }
    function shade(h, amt) { var c = hex2rgb(h); return rgb2hex(c.map(function (x) { return x + (amt / 100) * 255; })); }
    function tint(h, f) { var c = hex2rgb(h); return rgb2hex(c.map(function (x) { return x + (255 - x) * f; })); }

    input.addEventListener("input", applyName);
    sws.forEach(function (b) {
      b.addEventListener("click", function () {
        sws.forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        applyColor(b.getAttribute("data-c"));
      });
    });
    applyName();
  })();

  /* ---------- stat count-up ---------- */
  (function stats() {
    var nums = $$(".stat-n");
    if (!nums.length) return;
    function run(el) {
      var target = +el.getAttribute("data-target");
      var suf = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suf; return; }
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var sio = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { run(e.target); sio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (el) { sio.observe(el); });
    } else { nums.forEach(run); }
  })();

})();
