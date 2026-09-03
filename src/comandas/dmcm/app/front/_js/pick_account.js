/*!
 * pick_account.js — Diálogo de selección de una cuenta ya abierta (POS)
 * Autocontenido: sin dependencias, inyecta su propio CSS.
 * Independiente de select_account.js y join_accounts.js.
 *
 * Uso:
 *   pick_account({
 *     keys: [
 *       { sys_pk: 88, key: "M1",   status: "open",  amount: "$ 100.00" },
 *       { sys_pk: 89, key: "M1-A", status: "open",  amount: "$  40.00" },
 *       { sys_pk: 90, key: "M3",   status: "close", amount: "$ 615.00" },
 *       { sys_pk: null, key: "M7", status: "free",  amount: ""         }
 *     ],
 *     include_closed: false      // true = muestra también las cerradas
 *   }, function (e) {
 *     if (!e) return;            // cancelado
 *     e.sys_pk;                  // 88
 *     e.key;                     // "M1"
 *   });
 *
 * Qué se muestra:
 *   open   -> siempre, en azul.
 *   close  -> sólo si include_closed es true, en rojo.
 *   free   -> nunca: no hay cuenta que elegir.
 *
 * Cada fila de venta es un botón, incluidas subcuentas ("M1-A") y uniones
 * ("M5+M6", "M5+M6|A"). Un toque devuelve la cuenta y cierra el diálogo.
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'pa-dialog-css';

  var CSS = [
    '.pa-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;',
    'justify-content:center;z-index:2147483000;padding:16px;box-sizing:border-box;',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.pa-ov *{box-sizing:border-box;}',
    '.pa-dlg{background:#fff;border:2px solid #111;border-radius:6px;width:min(880px,100%);',
    'max-height:100%;display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 18px 50px rgba(0,0,0,.4);}',
    '.pa-hd{padding:12px 18px;font-size:17px;font-weight:700;color:#111;',
    'border-bottom:1px solid #ddd;}',
    '.pa-gridwrap{flex:1;min-height:0;overflow-y:auto;padding:18px;',
    '-webkit-overflow-scrolling:touch;}',
    '.pa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:16px;}',
    '.pa-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'gap:4px;height:80px;border:3px solid transparent;border-radius:4px;line-height:1.1;',
    'font-weight:800;color:#000;cursor:pointer;padding:4px 6px;overflow:hidden;',
    'font-family:inherit;}',
    '.pa-btn:focus-visible{outline:3px solid #111;outline-offset:2px;}',
    '.pa-k{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.pa-a{font-size:12px;font-weight:700;opacity:.75;}',
    '.pa-f1{font-size:26px;}.pa-f2{font-size:22px;}.pa-f3{font-size:18px;}',
    '.pa-f4{font-size:15px;}.pa-f5{font-size:13px;}',
    '.pa-open{background:#2ee6f5;}',
    '.pa-close{background:#ff1f1f;}',
    '.pa-empty{font-size:14px;color:#888;margin:0;padding:10px 2px;}',
    '.pa-ft{padding:12px 18px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;}',
    '.pa-cancel{padding:10px 26px;font-size:15px;font-weight:700;color:#111;background:#fff;',
    'border:2px solid #111;border-radius:4px;cursor:pointer;font-family:inherit;}',
    '.pa-cancel:hover{background:#111;color:#fff;}',
    '@media(max-width:640px){.pa-btn{height:70px;}',
    '.pa-f1{font-size:22px;}.pa-f2{font-size:19px;}.pa-f3{font-size:16px;}',
    '.pa-f4{font-size:14px;}.pa-f5{font-size:12px;}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  function normStatus(v) {
    v = String(v == null ? '' : v).toLowerCase().trim();
    if (v === 'closed' || v === 'cerrada' || v === 'cerrado') return 'close';
    if (v === 'abierta' || v === 'abierto' || v === 'opened') return 'open';
    if (v === 'libre' || v === 'disponible') return 'free';
    if (v === 'free' || v === 'open' || v === 'close') return v;
    return 'free';
  }

  function fontClass(key) {
    var n = String(key).length;
    if (n <= 3) return 'pa-f1';
    if (n <= 5) return 'pa-f2';
    if (n <= 8) return 'pa-f3';
    if (n <= 12) return 'pa-f4';
    return 'pa-f5';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function pick_account(config, callback) {
    config = config || {};
    callback = typeof callback === 'function' ? callback : function () {};

    // se acepta include_closed e includeclosed por comodidad del llamador
    var includeClosed = config.include_closed === true || config.includeclosed === true;
    var title = config.title || 'Seleccione una cuenta';
    var cancelLabel = config.cancel_label || 'Cancelar';
    var emptyLabel = config.empty_label ||
      (includeClosed ? 'No hay cuentas abiertas ni cerradas.' : 'No hay cuentas abiertas.');
    var items = Array.isArray(config.keys) ? config.keys : [];

    function visible(status) {
      if (status === 'open') return true;
      if (status === 'close') return includeClosed;
      return false;                      // free nunca se muestra
    }

    /* ---------- DOM ---------- */
    injectCSS();

    var overlay = el('div', 'pa-ov');
    var dlg = el('div', 'pa-dlg');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', title);
    dlg.appendChild(el('div', 'pa-hd', title));

    var gridWrap = el('div', 'pa-gridwrap');
    var grid = el('div', 'pa-grid');
    gridWrap.appendChild(grid);
    dlg.appendChild(gridWrap);

    var foot = el('div', 'pa-ft');
    var cancelBtn = el('button', 'pa-cancel', cancelLabel);
    cancelBtn.type = 'button';
    foot.appendChild(cancelBtn);
    dlg.appendChild(foot);
    overlay.appendChild(dlg);

    var first = null;

    items.forEach(function (it) {
      if (!it || it.key == null) return;
      var status = normStatus(it.status);
      if (!visible(status)) return;

      var reference = String(it.reference ?? it.referencia ?? "");
      var key = String(it.key);
      var b = el('button', 'pa-btn pa-' + status);
      b.type = 'button';
      b.setAttribute('aria-label', key + (it.amount ? ' ' + it.amount : ''));
      b.appendChild(el('span', 'pa-k ' + fontClass(key), key));
      if (it.amount) b.appendChild(el('span', 'pa-a', it.amount));
      b.onclick = function () { finish({ sys_pk: it.sys_pk, key, reference }); };

      if (!first) first = b;
      grid.appendChild(b);
    });

    if (!first) grid.appendChild(el('p', 'pa-empty', emptyLabel));

    /* ---------- cierre ---------- */
    var done = false;
    var lastFocus = document.activeElement;

    function finish(result) {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
      callback(result || null);
    }

    function onKey(ev) {
      if (ev.key === 'Escape' || ev.keyCode === 27) {
        ev.preventDefault();
        ev.stopPropagation();
        finish(null);
      }
    }

    cancelBtn.onclick = function () { finish(null); };
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);
    (first || cancelBtn).focus();

    return { close: function () { finish(null); } };
  }

  global.pick_account = pick_account;
  if (typeof module === 'object' && module.exports) module.exports = pick_account;
})(typeof window !== 'undefined' ? window : this);
