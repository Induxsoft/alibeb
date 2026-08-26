/*!
 * select_account.js — Diálogo de selección/apertura de cuentas para POS
 * Autocontenido: sin dependencias, inyecta su propio CSS.
 *
 * Uso:
 *   select_account({
 *     keys: [
 *       { key: "M1",   status: "free",  amount: "$ 0.00"   },
 *       { key: "M2",   status: "open",  amount: "$ 1745.00"},
 *       { key: "M2-A", status: "open",  amount: "$ 786.00" },
 *       { key: "M3",   status: "close", amount: "$ 320.00" }
 *     ],
 *     delimiter: "-",
 *     delimiter_alt: "|",        // opcional
 *     concat_op: "+",            // opcional
 *     subaccount_label: "+Subcuenta"
 *   }, function (e) {
 *     if (!e) return;            // cancelado
 *     console.log(e.selectedkey); // "M1" | "M2-B" | "M5+M6|A" | ...
 *   });
 *
 * Separador de subcuenta:
 *   Si la clave contiene concat_op (cuentas unidas, p.ej. "M5+M6") se usa
 *   delimiter_alt para separar la letra: "M5+M6|A". En cualquier otro caso
 *   se usa delimiter: "M1-A". Si no se define concat_op, siempre se usa delimiter.
 *
 * Reglas:
 *   free  (verde) -> clic devuelve la clave y cierra.
 *   open  (azul)  -> clic muestra el panel: subcuentas existentes (solo lectura)
 *                    + botón "+Subcuenta". La subcuenta nueva se devuelve y cierra.
 *   close (rojo)  -> clic solo muestra el panel informativo. No se puede elegir.
 *   El padre nunca es seleccionable si ya está abierto o cerrado.
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'sa-dialog-css';

  var CSS = [
    '.sa-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;',
    'justify-content:center;z-index:2147483000;padding:16px;box-sizing:border-box;',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.sa-ov *{box-sizing:border-box;}',
    '.sa-dlg{background:#fff;border:2px solid #111;border-radius:6px;width:min(880px,100%);',
    'max-height:100%;display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 18px 50px rgba(0,0,0,.4);}',
    '.sa-hd{padding:12px 18px;font-size:17px;font-weight:700;color:#111;',
    'border-bottom:1px solid #ddd;}',
    '.sa-bd{display:flex;flex:1;min-height:0;}',
    '.sa-gridwrap{flex:1;min-width:0;overflow-y:auto;padding:18px;-webkit-overflow-scrolling:touch;}',
    '.sa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:16px;}',
    '.sa-btn{height:80px;border:3px solid transparent;border-radius:4px;line-height:1.1;',
    'font-weight:800;color:#000;cursor:pointer;padding:4px 6px;overflow:hidden;',
    'text-overflow:ellipsis;white-space:nowrap;font-family:inherit;}',
    '.sa-f1{font-size:26px;}.sa-f2{font-size:22px;}.sa-f3{font-size:18px;}',
    '.sa-f4{font-size:15px;}.sa-f5{font-size:13px;}',
    '.sa-btn:focus-visible{outline:3px solid #111;outline-offset:2px;}',
    '.sa-free{background:#00e400;}',
    '.sa-open{background:#2ee6f5;}',
    '.sa-close{background:#ff1f1f;}',
    '.sa-btn.sa-sel{border-color:#111;}',
    '.sa-side{width:250px;flex:none;border-left:1px solid #bbb;background:#fafafa;',
    'padding:16px;overflow-y:auto;}',
    '.sa-add{width:100%;padding:11px 8px;font-size:15px;font-weight:700;color:#111;',
    'background:#fff;border:2px solid #111;border-radius:4px;cursor:pointer;',
    'margin-bottom:14px;font-family:inherit;}',
    '.sa-add:hover{background:#111;color:#fff;}',
    '.sa-row{display:flex;justify-content:space-between;gap:10px;font-size:15px;',
    'font-weight:700;color:#111;padding:9px 2px;border-bottom:1px dashed #d5d5d5;}',
    '.sa-row.sa-r-close{color:#c00000;}',
    '.sa-lbl{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;',
    'color:#777;margin:0 0 8px;}',
    '.sa-hint{font-size:13px;color:#888;line-height:1.45;margin:0;}',
    '.sa-ft{padding:12px 18px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;}',
    '.sa-cancel{padding:10px 26px;font-size:15px;font-weight:700;color:#111;background:#fff;',
    'border:2px solid #111;border-radius:4px;cursor:pointer;font-family:inherit;}',
    '.sa-cancel:hover{background:#111;color:#fff;}',
    '@media(max-width:640px){.sa-bd{flex-direction:column;}',
    '.sa-side{width:auto;border-left:0;border-top:1px solid #bbb;max-height:38vh;}',
    '.sa-btn{height:66px;}',
    '.sa-f1{font-size:22px;}.sa-f2{font-size:19px;}.sa-f3{font-size:16px;}',
    '.sa-f4{font-size:14px;}.sa-f5{font-size:12px;}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- letras de subcuenta: 1->A ... 26->Z, 27->AA ---------- */
  function indexToLetters(n) {
    var s = '';
    while (n > 0) {
      var r = (n - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
  function lettersToIndex(s) {
    var n = 0;
    s = String(s).toUpperCase();
    for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n;
  }

  function normStatus(v) {
    v = String(v == null ? '' : v).toLowerCase().trim();
    if (v === 'closed' || v === 'cerrada' || v === 'cerrado') return 'close';
    if (v === 'abierta' || v === 'abierto' || v === 'opened') return 'open';
    if (v === 'libre' || v === 'disponible') return 'free';
    if (v === 'free' || v === 'open' || v === 'close') return v;
    return 'free';
  }

  // Escala el tamaño de letra según lo larga que sea la clave.
  function fontClass(key) {
    var n = String(key).length;
    if (n <= 3) return 'sa-f1';
    if (n <= 5) return 'sa-f2';
    if (n <= 8) return 'sa-f3';
    if (n <= 12) return 'sa-f4';
    return 'sa-f5';
  }

  function el(tag, cls, text) {    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function select_account(config, callback) {
    config = config || {};
    callback = typeof callback === 'function' ? callback : function () {};

    var delimiter = config.delimiter || '-';
    var concatOp = config.concat_op || '';
    var delimiterAlt = config.delimiter_alt || delimiter;
    var addLabel = config.subaccount_label || '+Subcuenta';

    // Las cuentas unidas (contienen concat_op) separan la letra con delimiter_alt.
    function sepFor(key) {
      return (concatOp && String(key).indexOf(concatOp) !== -1) ? delimiterAlt : delimiter;
    }
    var title = config.title || 'Seleccione una cuenta';
    var cancelLabel = config.cancel_label || 'Cancelar';
    var items = Array.isArray(config.keys) ? config.keys : [];

    /* ---------- separar cuentas padre de subcuentas ---------- */
    // Es subcuenta si lo que sigue al último delimitador son solo letras (A, B, AA...).
    var parents = [];          // orden de aparición
    var map = {};              // key -> { key, status, amount, subs: [] }

    function ensureParent(key, status, amount) {
      if (!map[key]) {
        map[key] = { key: key, status: normStatus(status), amount: amount || '', subs: [] };
        parents.push(map[key]);
      } else if (status != null) {
        map[key].status = normStatus(status);
        if (amount) map[key].amount = amount;
      }
      return map[key];
    }

    items.forEach(function (it) {
      if (!it || it.key == null) return;
      var key = String(it.key);
      var sep = sepFor(key);
      var pos = key.lastIndexOf(sep);
      var suffix = pos > 0 ? key.slice(pos + sep.length) : '';
      var isSub = pos > 0 && /^[A-Za-z]{1,3}$/.test(suffix);

      // Con delimiter_alt solo se admite una aparición: lo que va antes es la
      // clave unida completa. Si hubiera otra, la clave se toma como padre.
      if (isSub && sep === delimiterAlt && key.slice(0, pos).indexOf(sep) !== -1) isSub = false;

      if (isSub) {
        var pkey = key.slice(0, pos);
        // El padre puede no venir en el arreglo: se asume abierto.
        var p = map[pkey] || ensureParent(pkey, 'open', '');
        p.subs.push({
          key: key,
          letter: suffix.toUpperCase(),
          status: normStatus(it.status),
          amount: it.amount || ''
        });
      } else {
        ensureParent(key, it.status, it.amount);
      }
    });

    parents.forEach(function (p) {
      p.subs.sort(function (a, b) { return lettersToIndex(a.letter) - lettersToIndex(b.letter); });
    });

    function nextLetter(p) {
      var max = 0;
      p.subs.forEach(function (s) {
        var i = lettersToIndex(s.letter);
        if (i > max) max = i;           // siguiente tras la mayor, sin reutilizar huecos
      });
      return indexToLetters(max + 1);
    }

    /* ---------- DOM ---------- */
    injectCSS();

    var overlay = el('div', 'sa-ov');
    var dlg = el('div', 'sa-dlg');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', title);

    dlg.appendChild(el('div', 'sa-hd', title));

    var body = el('div', 'sa-bd');
    var gridWrap = el('div', 'sa-gridwrap');
    var grid = el('div', 'sa-grid');
    var side = el('div', 'sa-side');
    gridWrap.appendChild(grid);
    body.appendChild(gridWrap);
    body.appendChild(side);
    dlg.appendChild(body);

    var foot = el('div', 'sa-ft');
    var cancelBtn = el('button', 'sa-cancel', cancelLabel);
    cancelBtn.type = 'button';
    foot.appendChild(cancelBtn);
    dlg.appendChild(foot);

    overlay.appendChild(dlg);

    var selected = null;
    var buttons = [];

    parents.forEach(function (p) {
      var b = el('button', 'sa-btn sa-' + p.status + ' ' + fontClass(p.key), p.key);
      b.type = 'button';
      b.setAttribute('aria-label', p.key);
      b.onclick = function () {
        if (p.status === 'free') { finish({ selectedkey: p.key }); return; }
        selected = p;
        buttons.forEach(function (x) { x.classList.remove('sa-sel'); });
        b.classList.add('sa-sel');
        renderSide(p);
      };
      buttons.push(b);
      grid.appendChild(b);
    });

    if (!parents.length) {
      grid.appendChild(el('p', 'sa-hint', 'No hay cuentas configuradas.'));
    }

    function renderSide(p) {
      side.innerHTML = '';
      if (!p) {
        side.appendChild(el('p', 'sa-hint',
          'Toque una cuenta verde para abrirla, o una azul para agregarle una subcuenta.'));
        return;
      }

      if (p.status === 'open') {
        var add = el('button', 'sa-add', addLabel);
        add.type = 'button';
        add.onclick = function () {
          finish({ selectedkey: p.key + sepFor(p.key) + nextLetter(p) });
        };
        side.appendChild(add);
      }

      if (p.subs.length) {
        side.appendChild(el('p', 'sa-lbl', 'Subcuentas de ' + p.key));
        p.subs.forEach(function (s) {
          var row = el('div', 'sa-row' + (s.status === 'close' ? ' sa-r-close' : ''));
          row.appendChild(el('span', null, s.letter));
          row.appendChild(el('span', null, s.amount));
          side.appendChild(row);
        });
      } else {
        side.appendChild(el('p', 'sa-lbl', p.status === 'close' ? 'Cuenta cerrada' : 'Cuenta abierta'));
        var t = el('div', 'sa-row');
        t.appendChild(el('span', null, p.key));
        t.appendChild(el('span', null, p.amount || ''));
        side.appendChild(t);
      }
    }

    renderSide(null);

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
    (buttons[0] || cancelBtn).focus();

    return { close: function () { finish(null); } };
  }

  global.select_account = select_account;
  if (typeof module === 'object' && module.exports) module.exports = select_account;
})(typeof window !== 'undefined' ? window : this);
