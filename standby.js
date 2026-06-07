/* J&S Sun Shop — Mode veille (écran de garde)
   Affiche le visuel Actus en plein écran après une période d'inactivité.
   Réglable depuis l'admin de la page Actus (jss_standby_enabled / jss_standby_minutes).
   Le visuel provient de jss_actus_poster (défini dans actus.html). */
(function () {
  var K_EN = 'jss_standby_enabled', K_MIN = 'jss_standby_minutes', K_POSTER = 'jss_actus_poster';

  function enabled() { var v = localStorage.getItem(K_EN); return v === null ? true : v === '1'; }
  function minutes() { var m = parseFloat(localStorage.getItem(K_MIN)); return (m && m > 0) ? m : 10; }
  function poster()  { try { return JSON.parse(localStorage.getItem(K_POSTER)); } catch (e) { return null; } }

  var ov, imgEl, timer;

  function build() {
    ov = document.createElement('div');
    ov.id = 'jss-standby';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:none;' +
      'align-items:center;justify-content:center;cursor:none;';
    imgEl = document.createElement('img');
    imgEl.alt = 'Visuel Actus';
    imgEl.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
    var hint = document.createElement('div');
    hint.textContent = 'Touchez l\u2019\u00e9cran pour reprendre';
    hint.style.cssText = 'position:absolute;bottom:26px;left:0;right:0;text-align:center;' +
      'color:rgba(255,255,255,.42);font-family:\'DM Sans\',sans-serif;font-size:14px;letter-spacing:.12em;';
    ov.appendChild(imgEl);
    ov.appendChild(hint);
    document.body.appendChild(ov);
    ov.addEventListener('click', hide);
    ov.addEventListener('touchstart', hide, { passive: true });
  }

  function showing() { return ov && ov.style.display !== 'none'; }

  function show() {
    var p = poster();
    if (!p || !p.dataUrl) { schedule(); return; }   /* rien à afficher : on re-programme */
    imgEl.src = p.dataUrl;
    ov.style.display = 'flex';
  }

  function hide() { if (ov) ov.style.display = 'none'; schedule(); }

  function schedule() {
    clearTimeout(timer);
    if (!enabled()) return;
    timer = setTimeout(function () { if (enabled() && !showing()) show(); }, minutes() * 60000);
  }

  function activity() { if (showing()) { hide(); } else { schedule(); } }

  function init() {
    if (!document.body) return;
    build();
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach(function (ev) {
      window.addEventListener(ev, activity, { passive: true });
    });
    schedule();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
