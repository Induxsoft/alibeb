/**
 * <tag-man sync="id_del_textarea"></tag-man>
 *
 * Convierte un <textarea> (una opción por línea) en una interfaz de chips
 * editable con drag & drop, sin modificar la lógica que ya lee/escribe ese
 * textarea: se oculta, pero se mantiene 100% funcional y sincronizado en
 * ambas direcciones (textarea -> UI y UI -> textarea), incluyendo los
 * eventos nativos `input` y `change`.
 *
 * Atributos:
 *   sync          (obligatorio) id del <textarea> a sincronizar
 *   placeholder   texto del campo para agregar (default: "Agregar…")
 *   allow-empty   si está presente, permite líneas vacías como elementos
 *   readonly      si está presente, deshabilita edición/borrado/orden
 *
 * Propiedades / métodos públicos:
 *   tagMan.value            -> string (equivalente a textarea.value)
 *   tagMan.value = "a\nb"   -> reemplaza contenido
 *   tagMan.items            -> array de strings (copia)
 *   tagMan.addItem(text)
 *   tagMan.removeAt(index)
 *
 * Eventos:
 *   'tagman-change'  (bubbles, composed) detail: { value, items }
 *   además dispara 'input' y 'change' reales sobre el <textarea> sincronizado.
 */
(function () {
  if (customElements.get('tag-man')) return;

  const TEMPLATE = `
    <style>
      :host{
        display:block;
        --tm-border: var(--tag-man-border, #d9d5c9);
        --tm-border-strong: var(--tag-man-border-strong, #185fa5);
        --tm-surface: var(--tag-man-surface, #ffffff);
        --tm-text: var(--tag-man-text, #2c2c2a);
        --tm-text-muted: var(--tag-man-text-muted, #6b6a63);
        --tm-chip-bg: var(--tag-man-chip-bg, #e6f1fb);
        --tm-chip-text: var(--tag-man-chip-text, #0c447c);
        --tm-focus-ring: var(--tag-man-focus-ring, rgba(24,95,165,.15));
        font-family: var(--tag-man-font, inherit);
      }
      .wrap{
        box-sizing:border-box;
        background:var(--tm-surface);
        border:1px solid var(--tm-border);
        border-radius:8px;
        padding:.5rem;
        display:flex;
        flex-wrap:wrap;
        gap:.35rem;
        align-items:center;
        min-height:44px;
        transition:border-color .15s ease, box-shadow .15s ease;
      }
      .wrap.is-focused{
        border-color:var(--tm-border-strong);
        box-shadow:0 0 0 3px var(--tm-focus-ring);
      }
      .wrap.is-readonly .new{ display:none; }

      .chip{
        display:flex;
        align-items:center;
        gap:.35rem;
        background:var(--tm-chip-bg);
        color:var(--tm-chip-text);
        border:1px solid transparent;
        border-radius:6px;
        padding:.28rem .28rem .28rem .6rem;
        font-size:.85rem;
        line-height:1.2;
        cursor:grab;
        user-select:none;
        max-width:100%;
        box-sizing:border-box;
      }
      .chip[draggable="false"]{ cursor:default; }
      .chip:active{cursor:grabbing;}
      .chip.is-dragging{opacity:.4;}
      .chip.is-dragover{outline:2px dashed var(--tm-border-strong); outline-offset:1px;}
      .chip.is-editing{
        background:var(--tm-surface);
        border-color:var(--tm-border-strong);
        padding:.14rem .28rem .14rem .45rem;
      }
      .chip-text{
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        max-width:260px;
      }
      .chip-input{
        border:none;
        outline:none;
        background:transparent;
        font:inherit;
        color:var(--tm-text);
        min-width:40px;
        padding:.14rem 0;
      }
      .chip-remove{
        border:none;
        background:transparent;
        color:var(--tm-chip-text);
        opacity:.55;
        cursor:pointer;
        width:16px;
        height:16px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        line-height:1;
        padding:0;
        flex:none;
      }
      .chip-remove:hover{opacity:1; background:rgba(0,0,0,.06);}

      .new{
        border:none;
        outline:none;
        background:transparent;
        font:inherit;
        font-size:.85rem;
        color:var(--tm-text);
        flex:1 1 100px;
        min-width:100px;
        padding:.32rem .15rem;
      }
      .new::placeholder{color:var(--tm-text-muted);}
    </style>
    <div class="wrap" part="wrapper">
      <input type="text" class="new" part="input">
    </div>
  `;

  class TagMan extends HTMLElement {
    static get observedAttributes() {
      return ['sync', 'placeholder', 'allow-empty', 'readonly'];
    }

    constructor() {
      super();
      this._items = [];
      this._textarea = null;
      this._dragIndex = null;
      this._suppressExternal = false;
      this._attachRetries = 0;

      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = TEMPLATE;
      this._wrap = root.querySelector('.wrap');
      this._newInput = root.querySelector('.new');

      this._onExternalChange = this._onExternalChange.bind(this);
    }

    connectedCallback() {
      this._newInput.placeholder = this.getAttribute('placeholder') || 'Agregar…';
      this._applyReadonly();
      this._bindStaticEvents();
      this._attachToTextarea();
    }

    disconnectedCallback() {
      if (this._textarea) {
        this._textarea.removeEventListener('input', this._onExternalChange);
      }
      if (this._observer) this._observer.disconnect();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'sync') this._attachToTextarea();
      if (name === 'placeholder') this._newInput.placeholder = newVal || 'Agregar…';
      if (name === 'readonly') this._applyReadonly();
    }

    _applyReadonly() {
      const ro = this.hasAttribute('readonly');
      this._wrap.classList.toggle('is-readonly', ro);
    }

    // ---- localizar y enganchar el textarea referenciado por "sync" ----
    _attachToTextarea() {
      const id = this.getAttribute('sync');
      if (!id) return;

      if (this._textarea) {
        this._textarea.removeEventListener('input', this._onExternalChange);
        this._textarea = null;
      }
      if (this._observer) { this._observer.disconnect(); this._observer = null; }

      const found = document.getElementById(id);
      if (found) {
        this._bindTextarea(found);
        return;
      }

      // El textarea puede no existir aún (fragment insertado async).
      // Observamos el documento hasta que aparezca.
      this._observer = new MutationObserver(() => {
        const el = document.getElementById(id);
        if (el) {
          this._observer.disconnect();
          this._observer = null;
          this._bindTextarea(el);
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    }

    _bindTextarea(el) {
      this._textarea = el;
      el.style.display = 'none';
      el.setAttribute('data-tag-man-synced', '');
      el.addEventListener('input', this._onExternalChange);
      this._items = this._parseTextarea();
      this._render(true);
    }

    _onExternalChange() {
      if (this._suppressExternal) return;
      this._items = this._parseTextarea();
      this._render(true);
    }

    _parseTextarea() {
      if (!this._textarea) return [];
      const allowEmpty = this.hasAttribute('allow-empty');
      return this._textarea.value
        .split('\n')
        .map(l => l.replace(/\r$/, ''))
        .filter(l => allowEmpty || l.trim() !== '');
    }

    // ---- sincronización UI -> textarea ----
    _syncToTextarea() {
      if (!this._textarea) return;
      const value = this._items.join('\n');
      if (this._textarea.value === value) return;
      this._suppressExternal = true;
      this._textarea.value = value;
      this._textarea.dispatchEvent(new Event('input', { bubbles: true }));
      this._textarea.dispatchEvent(new Event('change', { bubbles: true }));
      this._suppressExternal = false;

      this.dispatchEvent(new CustomEvent('tagman-change', {
        bubbles: true,
        composed: true,
        detail: { value, items: this._items.slice() },
      }));
    }

    _render(skipSync) {
      this._wrap.querySelectorAll('.chip').forEach(el => el.remove());
      const readonly = this.hasAttribute('readonly');

      this._items.forEach((text, index) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.draggable = !readonly;
        chip.dataset.index = index;

        const label = document.createElement('span');
        label.className = 'chip-text';
        label.textContent = text;
        label.title = text;
        chip.appendChild(label);

        if (!readonly) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'chip-remove';
          remove.innerHTML = '&times;';
          remove.setAttribute('aria-label', 'Eliminar');
          remove.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeAt(index);
          });
          chip.appendChild(remove);

          chip.addEventListener('dblclick', () => this._editChip(chip, index));
          chip.addEventListener('dragstart', (e) => this._onDragStart(e, index));
          chip.addEventListener('dragover', (e) => this._onDragOver(e, chip));
          chip.addEventListener('dragleave', () => chip.classList.remove('is-dragover'));
          chip.addEventListener('drop', (e) => this._onDrop(e, index));
          chip.addEventListener('dragend', () => this._onDragEnd());
        }

        this._wrap.insertBefore(chip, this._newInput);
      });

      if (!skipSync) this._syncToTextarea();
    }

    _editChip(chip, index) {
      if (this.hasAttribute('readonly') || chip.classList.contains('is-editing')) return;
      chip.classList.add('is-editing');
      const label = chip.querySelector('.chip-text');
      const currentText = this._items[index];

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'chip-input';
      input.value = currentText;
      input.style.width = Math.max(40, currentText.length * 7) + 'px';

      label.replaceWith(input);
      input.focus();
      input.select();

      const commit = () => {
        const val = input.value.trim();
        if (val === '') {
          this.removeAt(index);
        } else {
          this._items[index] = val;
          this._render();
        }
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); this._render(); }
      });
      input.addEventListener('blur', commit);
    }

    _onDragStart(e, index) {
      this._dragIndex = index;
      e.currentTarget.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
    }

    _onDragOver(e, chip) {
      e.preventDefault();
      chip.classList.add('is-dragover');
    }

    _onDrop(e, targetIndex) {
      e.preventDefault();
      e.currentTarget.classList.remove('is-dragover');
      if (this._dragIndex === null || this._dragIndex === targetIndex) return;
      const [moved] = this._items.splice(this._dragIndex, 1);
      this._items.splice(targetIndex, 0, moved);
      this._dragIndex = null;
      this._render();
    }

    _onDragEnd() {
      this._wrap.querySelectorAll('.chip').forEach(c => {
        c.classList.remove('is-dragging', 'is-dragover');
      });
      this._dragIndex = null;
    }

    _bindStaticEvents() {
      this._newInput.addEventListener('keydown', (e) => {
        if (this.hasAttribute('readonly')) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addItem(this._newInput.value);
          this._newInput.value = '';
        }
        if (e.key === 'Backspace' && this._newInput.value === '' && this._items.length) {
          this.removeAt(this._items.length - 1);
        }
      });

      this._newInput.addEventListener('paste', (e) => {
        if (this.hasAttribute('readonly')) return;
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text.includes('\n')) {
          e.preventDefault();
          text.split('\n').forEach(line => this.addItem(line));
        }
      });

      this._newInput.addEventListener('focus', () => this._wrap.classList.add('is-focused'));
      this._newInput.addEventListener('blur', () => this._wrap.classList.remove('is-focused'));
    }

    // ---- API pública ----
    addItem(text) {
      const allowEmpty = this.hasAttribute('allow-empty');
      const val = allowEmpty ? text : text.trim();
      if (!allowEmpty && val === '') return;
      this._items.push(val);
      this._render();
    }

    removeAt(index) {
      this._items.splice(index, 1);
      this._render();
    }

    get items() {
      return this._items.slice();
    }

    get value() {
      return this._items.join('\n');
    }

    set value(v) {
      this._items = String(v || '')
        .split('\n')
        .filter(l => this.hasAttribute('allow-empty') || l.trim() !== '');
      this._render();
    }
  }

  customElements.define('tag-man', TagMan);
})();
