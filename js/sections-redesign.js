/* ════════════════════════════════════════════════════════════
   sections-redesign.js
   Counter-up для hero-чисел в секциях "Как я работаю" + "Чем работаю"
   и живой таймер 00:40:00 для строки "Скорость и точность".
   Из handoff bundle Claude Design (2026-04-29).
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── counter-up через IntersectionObserver ──
  var counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';

        var target = parseFloat(el.dataset.target);
        var pad = parseInt(el.dataset.pad || '0', 10);
        var dur = 1100;
        var start = performance.now();

        var fmt = function (n) {
          var s = (target % 1 !== 0) ? n.toFixed(1) : Math.round(n).toString();
          return pad ? s.padStart(pad, '0') : s;
        };

        function step(t) {
          var p = Math.min(1, (t - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = fmt(target);
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach(function (c) { obs.observe(c); });
  } else {
    // Fallback для старых браузеров — сразу показать целевые числа
    counters.forEach(function (el) {
      var target = parseFloat(el.dataset.target);
      var pad = parseInt(el.dataset.pad || '0', 10);
      var s = (target % 1 !== 0) ? target.toFixed(1) : Math.round(target).toString();
      el.textContent = pad ? s.padStart(pad, '0') : s;
      el.dataset.counted = 'true';
    });
  }

  // ── живой таймер 00:40:00 ──
  var timerEl = document.getElementById('liveTimer');
  if (timerEl) {
    var total = 40 * 60; // секунд
    function tick() {
      var h = String(Math.floor(total / 3600)).padStart(2, '0');
      var m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
      var s = String(total % 60).padStart(2, '0');
      timerEl.textContent = h + ':' + m + ':' + s;
      total = total > 0 ? total - 1 : 40 * 60; // зацикливаем
    }
    tick();
    setInterval(tick, 1000);
  }
})();
