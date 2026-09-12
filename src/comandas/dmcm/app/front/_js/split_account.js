/*!
 * split_account.js — Diálogo de división de cuenta para POS
 * Inyecta su propio CSS. Depende de pick_account.js para elegir el destino
 * (o de un config.picker propio con la misma firma).
 *
 * Uso:
 *   split_account({
 *     reference: "A9948822",
 *     id: "M12",
 *     detail: [
 *       { quantity: 1, descrip: "Ensalada Cesar", amount: "$ 245.00", sys_pk: 87 },
 *       { quantity: 2, descrip: "Ord. tacos",     amount: "$ 184.00", sys_pk: 88 }
 *     ],
 *     accounts: [ ... ],        // mismo formato que pick_account
 *     include_closed: false     // se pasa tal cual a pick_account
 *   }, function (e) {
 *     if (!e) return;           // el diálogo se cerró
 *     e.reference;              // "A9948822"
 *     e.from;                   // "M12"
 *     e.to;                     // { sys_pk: 98, key: "M5" }
 *     e.item;                   // { sys_pk: 88, descrip: "Ord. tacos",
 *                               //   quantity: 1, amount: "$ 92.00" }
 *   });
 *
 * El callback se dispara UNA VEZ POR MOVIMIENTO, en el momento en que ocurre,
 * y una última vez con null al cerrar el diálogo.
 *
 * Puede rechazar un movimiento devolviendo false, o una promesa que resuelva
 * false o que sea rechazada. Mientras la promesa esté pendiente el diálogo se
 * bloquea. Si no devuelve nada, el movimiento se da por bueno.
 *
 * amount es el total de la partida. El unitario se deriva dividiendo entre
 * quantity al abrir, y se usa para recalcular la línea y el importe movido.
 * Se asume punto decimal y coma de miles; para evitar el parseo puede mandar
 * el unitario numérico en la propiedad "unit".
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'sp-dialog-css';

  var CSS = [
    '.sp-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;',
    'justify-content:center;z-index:2147483000;padding:16px;box-sizing:border-box;',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.sp-ov *{box-sizing:border-box;}',
    '.sp-dlg{background:#fff;border:2px solid #111;border-radius:6px;width:min(460px,100%);',
    'max-height:100%;display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 18px 50px rgba(0,0,0,.4);}',
    '.sp-dlg.sp-busy{opacity:.6;pointer-events:none;}',
    '.sp-hd{padding:16px 18px 12px;}',
    '.sp-ref{font-size:19px;font-weight:800;color:#111;line-height:1.25;}',
    '.sp-id{font-size:19px;font-weight:800;color:#111;line-height:1.25;}',
    '.sp-list{flex:1;min-height:120px;overflow-y:auto;padding:6px 14px 14px;',
    '-webkit-overflow-scrolling:touch;}',
    '.sp-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;',
    'padding:12px 12px;margin-bottom:8px;background:#fff;border:2px solid transparent;',
    'border-radius:4px;font-family:inherit;font-size:16px;font-weight:700;color:#111;',
    'cursor:pointer;}',
    '.sp-item:hover,.sp-item:focus-visible{border-color:#111;outline:none;}',
    '.sp-q{flex:none;min-width:22px;text-align:right;}',
    '.sp-d{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.sp-a{flex:none;}',
    '.sp-empty{font-size:14px;color:#888;padding:14px 12px;margin:0;}',
    '.sp-moved{border-top:1px solid #ddd;margin:6px 12px 0;padding:10px 0 0;}',
    '.sp-lbl{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;',
    'color:#888;margin:0 0 6px;}',
    '.sp-mrow{display:flex;justify-content:space-between;gap:10px;font-size:13px;',
    'font-weight:700;color:#555;padding:4px 0;}',
    '.sp-ft{padding:12px 18px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;}',
    '.sp-close{padding:10px 30px;font-size:15px;font-weight:700;color:#111;background:#fff;',
    'border:2px solid #111;border-radius:4px;cursor:pointer;font-family:inherit;}',
    '.sp-close:hover{background:#111;color:#fff;}',
    '.sp-dest-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;',
    'justify-content:center;z-index:2147483001;padding:16px;box-sizing:border-box;',
    'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}',
    '.sp-dest-dlg{background:#fff;border:2px solid #111;border-radius:6px;width:min(880px,100%);',
    'max-height:100%;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.4);}',
    '.sp-dest-hd{padding:12px 18px;font-size:17px;font-weight:700;color:#111;border-bottom:1px solid #ddd;}',
    '.sp-dest-bd{display:flex;flex:1;min-height:0;}',
    '.sp-dest-gridwrap{flex:1;min-width:0;overflow-y:auto;padding:18px;}',
    '.sp-dest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:16px;}',
    '.sp-dest-btn{height:80px;border:3px solid transparent;border-radius:4px;line-height:1.1;font-weight:800;',
    'color:#000;cursor:pointer;padding:4px 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:inherit;}',
    '.sp-dest-btn:focus-visible{outline:3px solid #111;outline-offset:2px;}',
    '.sp-dest-open{background:#2ee6f5;}.sp-dest-close{background:#ff1f1f;}',
    '.sp-dest-side{width:250px;flex:none;border-left:1px solid #bbb;background:#fafafa;padding:16px;overflow-y:auto;}',
    '.sp-dest-row{display:flex;justify-content:space-between;gap:10px;font-size:15px;font-weight:700;color:#111;padding:9px 2px;border-bottom:1px dashed #d5d5d5;}',
    '.sp-dest-lbl{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#777;margin:0 0 8px;}',
    '.sp-dest-ft{padding:12px 18px;border-top:1px solid #ddd;display:flex;justify-content:flex-end;}',
    '.sp-dest-add{padding:10px 18px;font-size:15px;font-weight:700;color:#111;background:#fff;border:2px solid #111;border-radius:4px;cursor:pointer;font-family:inherit;margin-right:8px;}',
    '.sp-dest-add:hover{background:#111;color:#fff;}',
    '@media(max-width:640px){.sp-dest-bd{flex-direction:column;}.sp-dest-side{width:auto;border-left:0;border-top:1px solid #bbb;max-height:38vh;}.sp-dest-btn{height:66px;}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.appendChild(document.createTextNode(CSS));
    (document.head || document.documentElement).appendChild(s);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function parseAmount(v) {
    if (typeof v === 'number') return v;
    var t = String(v == null ? '' : v).replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    var n = parseFloat(t);
    return isNaN(n) ? 0 : n;
  }

  function makeFormatter(sample) {
    var m = String(sample == null ? '' : sample).match(/^[^0-9-]*/);
    var prefix = m ? m[0] : '';
    return function (n) {
      var p = n.toFixed(2).split('.');
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return prefix + p.join('.');
    };
  }

  function split_account(config, callback) {
    config = config || {};
    callback = typeof callback === 'function' ? callback : function () {};

    var reference = config.reference == null ? '' : String(config.reference);
    var accountId = config.id == null ? '' : String(config.id);
    var closeLabel = config.close_label || 'Cerrar';
    var emptyLabel = config.empty_label || 'No queda nada en esta cuenta.';
    var picker = typeof config.picker === 'function' ? config.picker : global.pick_account;

    var lines = (Array.isArray(config.detail) ? config.detail : [])
      .filter(function (d) { return d && (parseInt(d.quantity, 10) || 0) > 0; })
      .map(function (d) {
        var qty = parseInt(d.quantity, 10) || 0;
        var unit = (typeof d.unit === 'number') ? d.unit : (parseAmount(d.amount) / (qty || 1));
        return {
          src: d,
          sys_pk: d.sys_pk,
          descrip: d.descrip == null ? '' : String(d.descrip),
          qty: qty,
          unit: unit,
          fmt: makeFormatter(d.amount),
          row: null
        };
      });

    var moved = [];   // { descrip, key }

    /* ---------- DOM ---------- */
    injectCSS();

    var overlay = el('div', 'sp-ov');
    var dlg = el('div', 'sp-dlg');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'Dividir cuenta ' + accountId);

    var hd = el('div', 'sp-hd');
    hd.appendChild(el('div', 'sp-ref', reference));
    hd.appendChild(el('div', 'sp-id', accountId));
    dlg.appendChild(hd);

    var list = el('div', 'sp-list');
    dlg.appendChild(list);

    var movedBox = el('div', 'sp-moved');
    movedBox.style.display = 'none';
    dlg.appendChild(movedBox);

    var foot = el('div', 'sp-ft');
    var closeBtn = el('button', 'sp-close', closeLabel);
    closeBtn.type = 'button';
    foot.appendChild(closeBtn);
    dlg.appendChild(foot);
    overlay.appendChild(dlg);

    function render() {
      list.innerHTML = '';
      var any = false;

      lines.forEach(function (ln) {
        if (ln.qty <= 0) return;
        any = true;
        var b = el('button', 'sp-item');
        b.type = 'button';
        b.appendChild(el('span', 'sp-q', String(ln.qty)));
        b.appendChild(el('span', 'sp-d', ln.descrip));
        b.appendChild(el('span', 'sp-a', ln.fmt(ln.unit * ln.qty)));
        b.setAttribute('aria-label',
          ln.qty + ' ' + ln.descrip + ' ' + ln.fmt(ln.unit * ln.qty) + ', mover una unidad');
        b.onclick = function () { askDestination(ln); };
        list.appendChild(b);
      });

      if (!any) list.appendChild(el('p', 'sp-empty', emptyLabel));

      movedBox.innerHTML = '';
      if (moved.length) {
        movedBox.style.display = '';
        movedBox.appendChild(el('p', 'sp-lbl', 'Movido'));
        moved.forEach(function (m) {
          var r = el('div', 'sp-mrow');
          r.appendChild(el('span', null, '1  ' + m.descrip));
          r.appendChild(el('span', null, '\u2192  ' + m.key));
          movedBox.appendChild(r);
        });
      } else {
        movedBox.style.display = 'none';
      }
    }

    function busy(on) {
      if (on) dlg.className = 'sp-dlg sp-busy';
      else dlg.className = 'sp-dlg';
    }


    /* ---------- selector de destino integrado ----------
       Se usa cuando no se proporciona un picker personalizado. Permite crear
       subcuentas sin depender de cambios en pick_account.js. */
    var createdAccounts = {}; // key -> { sys_pk, key, status, amount, reference }
    var destOverlay = null;
    var destLastFocus = null;
    var destDone = false;

    function normStatus(v) {
      v = String(v == null ? '' : v).toLowerCase().trim();
      if (v === 'closed' || v === 'cerrada' || v === 'cerrado') return 'close';
      if (v === 'abierta' || v === 'abierto' || v === 'opened') return 'open';
      if (v === 'libre' || v === 'disponible') return 'free';
      if (v === 'free' || v === 'open' || v === 'close') return v;
      return 'free';
    }

    function accountSepFor(key) {
      var op = config.concat_op || '';
      return (op && String(key).indexOf(op) !== -1)
        ? (config.delimiter_alt || config.delimiter || '-')
        : (config.delimiter || '-');
    }

    function lettersToIndexLocal(s) {
      var n = 0;
      s = String(s).toUpperCase();
      for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
      return n;
    }

    function indexToLettersLocal(n) {
      var s = '';
      while (n > 0) {
        var r = (n - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    }

    function nextSubaccountKey(parentKey) {
      var sep = accountSepFor(parentKey);
      var max = 0;

      function inspect(key) {
        key = String(key);
        var pos = key.lastIndexOf(sep);
        if (pos <= 0 || key.slice(0, pos) !== parentKey) return;
        var suffix = key.slice(pos + sep.length);
        if (/^[A-Za-z]{1,3}$/.test(suffix)) {
          max = Math.max(max, lettersToIndexLocal(suffix));
        }
      }

      (Array.isArray(config.accounts) ? config.accounts : []).forEach(function (a) {
        if (a && a.key != null) inspect(a.key);
      });
      Object.keys(createdAccounts).forEach(inspect);

      return parentKey + sep + indexToLettersLocal(max + 1);
    }

    function closeDestination() {
      if (!destOverlay) return;
      document.removeEventListener('keydown', onDestKey, true);
      if (destOverlay.parentNode) destOverlay.parentNode.removeChild(destOverlay);
      if (destLastFocus && destLastFocus.focus) {
        try { destLastFocus.focus(); } catch (e) {}
      }
      destOverlay = null;
    }

    function onDestKey(ev) {
      if (ev.key === 'Escape' || ev.keyCode === 27) {
        ev.preventDefault();
        ev.stopPropagation();
        closeDestination();
      }
    }

    function openDestinationPicker(ln) {
      destLastFocus = document.activeElement;
      var title = config.picker_title || 'Mover a...';
      var includeClosed = config.include_closed === true || config.includeclosed === true;
      var accounts = [];

      (Array.isArray(config.accounts) ? config.accounts : []).forEach(function (a) {
        if (!a || a.key == null || String(a.key) === accountId) return;
        accounts.push({
          sys_pk: a.sys_pk == null ? null : a.sys_pk,
          key: String(a.key),
          status: normStatus(a.status),
          amount: a.amount || '',
          reference: a.reference == null ? (a.referencia || '') : a.reference
        });
      });

      Object.keys(createdAccounts).forEach(function (key) {
        if (String(key) === accountId) return;
        var ca = createdAccounts[key];
        if (!accounts.some(function (a) { return a.key === key; })) accounts.push(ca);
      });

      var ov = el('div', 'sp-dest-ov');
      var d = el('div', 'sp-dest-dlg');
      d.setAttribute('role', 'dialog');
      d.setAttribute('aria-modal', 'true');
      d.setAttribute('aria-label', title);

      d.appendChild(el('div', 'sp-dest-hd', title));

      var bd = el('div', 'sp-dest-bd');
      var gw = el('div', 'sp-dest-gridwrap');
      var grid = el('div', 'sp-dest-grid');
      var side = el('div', 'sp-dest-side');
      gw.appendChild(grid);
      bd.appendChild(gw);
      bd.appendChild(side);
      d.appendChild(bd);

      var ft = el('div', 'sp-dest-ft');
      var add = el('button', 'sp-dest-add', '+Subcuenta');
      var cancel = el('button', 'sp-close', closeLabel);
      add.type = cancel.type = 'button';
      ft.appendChild(add);   // +Subcuenta primero (izquierda)
      ft.appendChild(cancel); // Cancelar después (derecha)
      d.appendChild(ft);
      ov.appendChild(d);
      document.body.appendChild(ov);
      destOverlay = ov;
      destDone = false;

      var selected = null;
      var btns = [];

      function renderSide(a) {
        side.innerHTML = '';
        if (!a) {
          side.appendChild(el('p', 'sp-empty', 'Seleccione una cuenta de destino.'));
          return;
        }
        side.appendChild(el('p', 'sp-dest-lbl', 'Cuenta seleccionada'));
        var r = el('div', 'sp-dest-row');
        r.appendChild(el('span', null, a.key));
        r.appendChild(el('span', null, a.amount || ''));
        side.appendChild(r);
      }

      function choose(a, b) {
        if (a.status === 'free' || (a.status === 'close' && !includeClosed)) return;
        selected = a;
        btns.forEach(function (x) { x.classList.remove('sp-dest-sel'); });
        if (b) b.classList.add('sp-dest-sel');
        renderSide(a);
      }

      accounts.forEach(function (a) {
        if (a.status !== 'open' && !(a.status === 'close' && includeClosed)) return;
        var b = el('button', 'sp-dest-btn sp-dest-' + a.status, a.key);
        b.type = 'button';
        b.onclick = function () {
          choose(a, b);
          if (a.status === 'open' || (a.status === 'close' && includeClosed)) {
            // Igual que pick_account: seleccionar la cuenta completa y cerrar.
            var target = {
              sys_pk: a.sys_pk,
              key: a.key,
              reference: a.reference
            };
            closeDestination();
            commit(ln, target);
          }
        };
        btns.push(b);
        grid.appendChild(b);
      });

      if (!btns.length) grid.appendChild(el('p', 'sp-empty', 'No hay cuentas disponibles.'));

      add.onclick = function () {
        // Se basa en la cuenta padre (accountId) que se está dividiendo, no en
        // una selección previa: un clic crea la subcuenta y mueve el ítem.
        var key = nextSubaccountKey(accountId);
        var a = {
          sys_pk: null,
          key: key,
          status: 'open',
          amount: '',
          reference: ''
        };
        createdAccounts[key] = a;

        var target = {
          sys_pk: a.sys_pk,
          key: a.key,
          reference: a.reference
        };
        closeDestination();
        commit(ln, target);
      };

      cancel.onclick = closeDestination;
      document.addEventListener('keydown', onDestKey, true);
      renderSide(null);
      (btns[0] || cancel).focus();
    }

    function askDestination(ln) {
      openDestinationPicker(ln);
    }

    function commit(ln, target) {
      var payload = {
        reference: reference,
        from: accountId,
        to: { sys_pk: target.sys_pk, key: target.key, reference: target.reference },
        item: {
          sys_pk: ln.sys_pk,
          orden: ln.src.orden,
          dorden: ln.src.dorden,
          dventa: ln.src.dventa,
          descrip: ln.descrip,
          quantity: 1,
          amount: ln.fmt(ln.unit)
        }
      };

      var r;
      try { r = callback(payload); } catch (err) { r = false; }

      function accepted(result) {
        if (result === false) return false;

        // Para una subcuenta recién creada (sys_pk:null), el backend puede devolver
        // el sys_pk asignado. Se conserva para los siguientes detail.
        var sysPk = null;
        if (result && typeof result === 'object' && result.sys_pk != null) {
          sysPk = result.sys_pk;
        } else if (typeof result === 'number' || typeof result === 'string') {
          sysPk = result;
        }

        if (sysPk != null && createdAccounts[target.key]) {
          createdAccounts[target.key].sys_pk = sysPk;
          target.sys_pk = sysPk;
        }

        return true;
      }

      if (r && typeof r.then === 'function') {
        busy(true);
        r.then(function (result) {
          busy(false);
          if (accepted(result)) apply(ln, target);
        }, function () { busy(false); });
      } else if (accepted(r)) {
        apply(ln, target);
      }
    }

    function apply(ln, target) {
      ln.qty -= 1;
      moved.push({ descrip: ln.descrip, key: target.key });
      render();
    }

    /* ---------- cierre ---------- */
    var done = false;
    var lastFocus = document.activeElement;

    function finish() {
      if (done) return;
      done = true;
      document.removeEventListener('keydown', onKey, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
      callback(null);
    }

    function onKey(ev) {
      if (ev.key === 'Escape' || ev.keyCode === 27) {
        ev.preventDefault();
        ev.stopPropagation();
        finish();
      }
    }

    closeBtn.onclick = finish;
    document.addEventListener('keydown', onKey, true);
    render();
    document.body.appendChild(overlay);
    closeBtn.focus();

    return { close: finish };
  }

  global.split_account = split_account;
  if (typeof module === 'object' && module.exports) module.exports = split_account;
})(typeof window !== 'undefined' ? window : this);
