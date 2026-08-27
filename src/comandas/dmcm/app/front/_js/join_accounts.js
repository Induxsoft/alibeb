/*!
 * join_accounts.js — Diálogo de unión de cuentas para POS
 * Autocontenido: sin dependencias, inyecta su propio CSS.
 * Independiente de select_account.js (no comparte estilos ni helpers).
 *
 * Uso:
 *   join_accounts({
 *     keys: [
 *       { sys_pk: 88, key: "M1",   status: "open",  amount: "$ 100.00" },
 *       { sys_pk: 98, key: "M5",   status: "open",  amount: "$ 240.00" },
 *       { sys_pk: 99, key: "M5-A", status: "close", amount: "$  80.00" },
 *       { sys_pk: null, key: "M7", status: "free",  amount: ""         }
 *     ],
 *     min: 2,
 *     max: 2,
 *     allow_free: false,      // true = las mesas libres también se pueden unir
 *     delimiter: "-",
 *     delimiter_alt: "|",     // opcional
 *     concat_op: "+"          // opcional, "+" por omisión
 *   }, function (e) {
 *     if (!e) return;         // cancelado
 *     e.accounts;             // [{sys_pk:88,key:"M1"},{sys_pk:98,key:"M5"}]
 *     e.new_key;              // "M1+M5"
 *   });
 *
 * Elegibilidad:
 *   open / close -> unibles (cada fila de venta es un candidato, incluidas subcuentas).
 *   free         -> deshabilitada, salvo que allow_free sea true. En ese caso se puede
 *                   elegir y viaja en el callback con sys_pk = 0, para que el backend
 *                   sepa que ahí no hay venta que consolidar sino una clave que ocupar.
 *   claves con delimiter_alt ("M2+M3|A") -> deshabilitadas: unirlas rompería la notación.
 *
 * La nueva clave es la concatenación de las claves elegidas en el orden en que
 * se tocaron. Una unión existente se aplana: "M5+M6" + "M2" => "M5+M6+M2".
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'ja-dialog-css';

  var CSS = [
    '.ja-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;',
    'justify-content:center;z-index:2147483000;padding:16px;box-sizing:border-box;',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.ja-ov *{box-sizing:border-box;}',
    '.ja-dlg{background:#fff;border:2px solid #111;border-radius:6px;width:min(880px,100%);',
    'max-height:100%;display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 18px 50px rgba(0,0,0,.4);}',
    '.ja-hd{padding:12px 18px;font-size:17px;font-weight:700;color:#111;',
    'border-bottom:1px solid #ddd;}',
    '.ja-bd{display:flex;flex:1;min-height:0;}',
    '.ja-gridwrap{flex:1;min-width:0;overflow-y:auto;padding:18px;-webkit-overflow-scrolling:touch;}',
    '.ja-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:16px;}',
    '.ja-btn{position:relative;height:80px;border:3px solid transparent;border-radius:4px;',
    'line-height:1.1;font-weight:800;color:#000;cursor:pointer;padding:4px 6px;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap;font-family:inherit;}',
    '.ja-f1{font-size:26px;}.ja-f2{font-size:22px;}.ja-f3{font-size:18px;}',
    '.ja-f4{font-size:15px;}.ja-f5{font-size:13px;}',
    '.ja-free{background:#00e400;}',
    '.ja-open{background:#2ee6f5;}',
    '.ja-close{background:#ff1f1f;}',
    '.ja-btn:disabled{opacity:.35;cursor:not-allowed;}',
    '.ja-btn.ja-sel{border-color:#111;}',
    '.ja-num{position:absolute;top:4px;left:4px;width:24px;height:24px;border-radius:50%;',
    'background:#111;color:#fff;font-size:13px;line-height:24px;text-align:center;}',
    '.ja-side{width:250px;flex:none;border-left:1px solid #bbb;background:#fafafa;',
    'padding:16px;overflow-y:auto;}',
    '.ja-lbl{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;',
    'color:#777;margin:0 0 8px;}',
    '.ja-row{display:flex;justify-content:space-between;gap:10px;font-size:15px;',
    'font-weight:700;color:#111;padding:9px 2px;border-bottom:1px dashed #d5d5d5;}',
    '.ja-row.ja-r-close{color:#c00000;}',
    '.ja-prev{margin-top:16px;padding:10px;background:#fff;border:2px solid #111;',
    'border-radius:4px;font-size:15px;font-weight:800;word-break:break-all;}',
    '.ja-hint{font-size:13px;color:#888;line-height:1.45;margin:0;}',
    '.ja-ft{padding:12px 18px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;',
    'gap:10px;}',
    '.ja-cancel,.ja-go{padding:10px 26px;font-size:15px;font-weight:700;border:2px solid #111;',
    'border-radius:4px;cursor:pointer;font-family:inherit;}',
    '.ja-cancel{color:#111;background:#fff;}',
    '.ja-cancel:hover{background:#111;color:#fff;}',
    '.ja-go{color:#fff;background:#111;}',
    '.ja-go:disabled{opacity:.3;cursor:not-allowed;}',
    '@media(max-width:640px){.ja-bd{flex-direction:column;}',
    '.ja-side{width:auto;border-left:0;border-top:1px solid #bbb;max-height:38vh;}',
    '.ja-btn{height:66px;}',
    '.ja-f1{font-size:22px;}.ja-f2{font-size:19px;}.ja-f3{font-size:16px;}',
    '.ja-f4{font-size:14px;}.ja-f5{font-size:12px;}}'
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
    if (n <= 3) return 'ja-f1';
    if (n <= 5) return 'ja-f2';
    if (n <= 8) return 'ja-f3';
    if (n <= 12) return 'ja-f4';
    return 'ja-f5';
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function join_accounts(config, callback) {
    config = config || {};
    callback = typeof callback === 'function' ? callback : function () {};

    var concatOp = config.concat_op || '+';
    var delimiterAlt = config.delimiter_alt || '';   // vacío = sin notación de subcuenta unida
    var allowFree = config.allow_free === true;
    var min = Math.max(2, parseInt(config.min, 10) || 2);
    var max = Math.max(min, parseInt(config.max, 10) || min);
    var title = config.title || 'Unir cuentas';
    var cancelLabel = config.cancel_label || 'Cancelar';
    var joinLabel = config.join_label || 'Unir';
    var items = Array.isArray(config.keys) ? config.keys : [];

    function eligible(it) {
      if (normStatus(it.status) === 'free' && !allowFree) return false;
      if (delimiterAlt && String(it.key).indexOf(delimiterAlt) !== -1) return false;
      return true;
    }

    /* ---------- DOM ---------- */
    injectCSS();

    var overlay = el('div', 'ja-ov');
    var dlg = el('div', 'ja-dlg');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', title);
    dlg.appendChild(el('div', 'ja-hd', title));

    var body = el('div', 'ja-bd');
    var gridWrap = el('div', 'ja-gridwrap');
    var grid = el('div', 'ja-grid');
    var side = el('div', 'ja-side');
    gridWrap.appendChild(grid);
    body.appendChild(gridWrap);
    body.appendChild(side);
    dlg.appendChild(body);

    var foot = el('div', 'ja-ft');
    var cancelBtn = el('button', 'ja-cancel', cancelLabel);
    var goBtn = el('button', 'ja-go', joinLabel);
    cancelBtn.type = 'button';
    goBtn.type = 'button';
    foot.appendChild(cancelBtn);
    foot.appendChild(goBtn);
    dlg.appendChild(foot);
    overlay.appendChild(dlg);

    var selection = [];   // entradas elegidas, en orden de toque
    var cells = [];       // { item, btn, num }

    items.forEach(function (it) {
      if (!it || it.key == null) return;
      var key = String(it.key);
      var status = normStatus(it.status);
      var ok = eligible(it);

      var b = el('button', 'ja-btn ja-' + status + ' ' + fontClass(key));
      b.type = 'button';
      b.disabled = !ok;
      b.setAttribute('aria-label', key);

      var num = el('span', 'ja-num');
      num.style.display = 'none';
      b.appendChild(num);
      b.appendChild(el('span', null, key));

      var cell = { item: it, key: key, status: status, btn: b, num: num, ok: ok };
      if (ok) b.onclick = function () { toggle(cell); };
      cells.push(cell);
      grid.appendChild(b);
    });

    if (!cells.filter(function (c) { return c.ok; }).length) {
      grid.appendChild(el('p', 'ja-hint', 'No hay cuentas disponibles para unir.'));
    }

    function toggle(cell) {
      var i = selection.indexOf(cell);
      if (i !== -1) selection.splice(i, 1);
      else if (selection.length < max) selection.push(cell);
      refresh();
    }

    function newKey() {
      return selection.map(function (c) { return c.key; }).join(concatOp);
    }

    function refresh() {
      var full = selection.length >= max;

      cells.forEach(function (c) {
        var i = selection.indexOf(c);
        if (i !== -1) {
          c.btn.classList.add('ja-sel');
          c.num.textContent = String(i + 1);
          c.num.style.display = '';
          c.btn.disabled = false;
        } else {
          c.btn.classList.remove('ja-sel');
          c.num.style.display = 'none';
          c.btn.disabled = !c.ok || full;   // al llegar al máximo, el resto se apaga
        }
      });

      side.innerHTML = '';
      if (!selection.length) {
        side.appendChild(el('p', 'ja-hint',
          'Toque las cuentas que va a unir. Mínimo ' + min +
          (max > min ? ', máximo ' + max : '') + '.'));
      } else {
        side.appendChild(el('p', 'ja-lbl',
          'Selección (' + selection.length + ' de ' + max + ')'));
        selection.forEach(function (c, i) {
          var row = el('div', 'ja-row' + (c.status === 'close' ? ' ja-r-close' : ''));
          row.appendChild(el('span', null, (i + 1) + '  ' + c.key));
          row.appendChild(el('span', null, c.item.amount || ''));
          side.appendChild(row);
        });
        var prev = el('div', 'ja-prev');
        prev.appendChild(el('div', 'ja-lbl', 'Nueva clave'));
        prev.appendChild(el('div', null, newKey()));
        side.appendChild(prev);
      }

      goBtn.disabled = selection.length < min;
    }

    refresh();

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
    goBtn.onclick = function () {
      if (selection.length < min) return;
      finish({
        accounts: selection.map(function (c) {
          return { sys_pk: c.status === 'free' ? 0 : c.item.sys_pk, key: c.key };
        }),
        new_key: newKey()
      });
    };

    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);

    var firstOk = cells.filter(function (c) { return c.ok; })[0];
    (firstOk ? firstOk.btn : cancelBtn).focus();

    return { close: function () { finish(null); } };
  }

  global.join_accounts = join_accounts;
  if (typeof module === 'object' && module.exports) module.exports = join_accounts;
})(typeof window !== 'undefined' ? window : this);
