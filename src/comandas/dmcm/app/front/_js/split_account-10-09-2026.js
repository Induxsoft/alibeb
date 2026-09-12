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
    '.sp-close:hover{background:#111;color:#fff;}'
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

    function askDestination(ln) {
      if (typeof picker !== 'function') {
        throw new Error('split_account: falta pick_account (o config.picker)');
      }
      var accounts = (Array.isArray(config.accounts) ? config.accounts : [])
        .filter(function (a) { return a && String(a.key) !== accountId; });

      picker({
        keys: accounts,
        include_closed: config.include_closed === true || config.includeclosed === true,
        title: config.picker_title || 'Mover a...'
      }, function (target) {
        if (!target) return;                 // canceló la selección de destino
        commit(ln, target);
      });
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

      if (r && typeof r.then === 'function') {
        busy(true);
        r.then(function (ok) {
          busy(false);
          if (ok !== false) apply(ln, target);
        }, function () { busy(false); });
      } else if (r !== false) {
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
