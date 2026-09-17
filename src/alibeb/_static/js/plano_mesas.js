var pm = {
    dmnsmesas: null,
    tblzonas: null,

    mesas: [],       // todas las mesas cargadas (de todas las zonas)
    zonaActualId: null, // sys_pk de la zona seleccionada (null = ninguna)
    mesaSeleccionadaId: null,

    // -------------------- Inicialización --------------------

    init()
    {
        this.dmnsmesas = document.getElementById('dmns-mesas');
        this.tblzonas = document.getElementById('tbl-zonas');

        this.initTablaDeZonas();
        this.pintarMesas();
    },

    initTablaDeZonas()
    {
        if (!this.tblzonas) return;

        const table = this.tblzonas;
        const events = table.EdiTable.Const.Events;

        table.AutoAddRow = false;
        table.AutoDelRow = false;

        table.Events[events.EnterCell] = (e) => {
            let index = table.CurrentRowIndex();
            let row = table.DataArray[index];

            if (row && row.sys_pk !== this.zonaActualId) {
                this.zonaActualId = row.sys_pk;
                this.mesaSeleccionadaId = null;
                this.pintarMesas();
            }
        };

        this.seleccionarPrimerZona();
    },

    seleccionarPrimerZona()
    {
        // Preselecciona la primera zona si existe.
        this.zonaActualId = this.tblzonas.DataArray.length > 0 ? this.tblzonas.DataArray[0].sys_pk : null;
        if (this.zonaActualId) this.tblzonas.NavTo(0,0);
    },

    // -------------------- Mesas: pintado --------------------

    mesasDeZonaActual()
    {
        if (this.zonaActualId == null) return [];
        return this.mesas.filter(m => m.izona == this.zonaActualId);
    },

    pintarMesa(data)
    {
        const div = document.createElement('div');
        div.className = 'pm-mesa';
        div.dataset.id = data.sys_pk;
        div.title = data.mesero ? `Mesero: ${data.mesero}` : '';
        div.textContent = data.id;

        if (data.sys_pk === this.mesaSeleccionadaId) {
            div.classList.add('selected');
        }

        // Si ya tiene posición asignada (iteración futura), se ubica de forma absoluta.
        if (data.x != null && data.y != null) {
            div.style.left = data.x + 'px';
            div.style.top = data.y + 'px';
            if (data.w) div.style.width = data.w + 'px';
            if (data.h) div.style.height = data.h + 'px';
        }

        div.addEventListener('click', () => this.seleccionarMesa(data.sys_pk));

        this.dmnsmesas.appendChild(div);
    },

    pintarMesas()
    {
        this.dmnsmesas.innerHTML = '';

        const lista = this.mesasDeZonaActual();

        // Sin coordenadas asignadas todavía -> usar layout de flujo (grid simple).
        const usaFlujo = lista.every(m => m.x == null || m.y == null);
        this.dmnsmesas.classList.toggle('pm-flow-layout', usaFlujo);

        lista.forEach(o => this.pintarMesa(o));
    },

    seleccionarMesa(sysPk)
    {
        this.mesaSeleccionadaId = (this.mesaSeleccionadaId === sysPk) ? null : sysPk;
        this.pintarMesas();
    },

    // -------------------- Utilidades --------------------

    // Procesa la respuesta de un fetch: si no es ok, intenta leer el JSON
    // del error y usar su "message"; si no viene, usa fallbackMsg.
    handleResponse(r, fallbackMsg)
    {
        if (r.ok) return r.json().catch(() => null);

        return r.json()
            .catch(() => null)
            .then(body => {
                const msg = (body && body.message) ? body.message : fallbackMsg;
                throw new Error(msg);
            });
    },

    // -------------------- Mesas: alta / baja --------------------

    agregarMesa()
    {
        if (this.zonaActualId == null) {
            alert('Selecciona una zona antes de agregar una mesa.');
            return;
        }

        const id = prompt('ID de la mesa:');
        if (!id) return;

        fetch(`./?_target=dmnsmesa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ id: id, izona: this.zonaActualId })
        })
        .then(r => this.handleResponse(r, 'No fue posible crear la mesa.'))
        .then(nueva => {
            this.mesas.push(nueva);
            this.pintarMesas();
        })
        .catch(err => alert(err.message));
    },

    eliminarMesaSeleccionada()
    {
        if (this.mesaSeleccionadaId == null) {
            alert('Selecciona una mesa para eliminar.');
            return;
        }
        this.eliminarMesa(this.mesaSeleccionadaId);
    },

    eliminarMesa(sysPk)
    {
        if (!confirm('¿Eliminar la mesa seleccionada?')) return;

        fetch(`./${sysPk}/?_target=dmnsmesa`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        })
        .then(r => this.handleResponse(r, 'No fue posible eliminar la mesa.'))
        .then(() => {
            this.mesas = this.mesas.filter(m => m.sys_pk != sysPk);
            if (this.mesaSeleccionadaId === sysPk) this.mesaSeleccionadaId = null;
            this.pintarMesas();
        })
        .catch(err => alert(err.message));
    },

    // -------------------- Generar mesas (modal) --------------------

    confirmarGenerarMesas()
    {
        if (this.zonaActualId == null) {
            alert('Selecciona una zona antes de generar mesas.');
            return;
        }

        const prefijo = document.getElementById('gm-prefijo').value;
        const posfijo = document.getElementById('gm-posfijo').value;
        const inicio = parseInt(document.getElementById('gm-inicio').value, 10);
        const fin = parseInt(document.getElementById('gm-fin').value, 10);
        const formato = document.getElementById('gm-formato').value;

        if (isNaN(inicio) || isNaN(fin) || fin < inicio) {
            alert('Revisa los valores de Inicio y Fin.');
            return;
        }

        fetch(`./?_target=dmnsmesa&_action=generar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                izona: this.zonaActualId,
                prefijo: prefijo,
                posfijo: posfijo,
                inicio: inicio,
                fin: fin,
                formato: formato
            })
        })
        .then(r => this.handleResponse(r, 'No fue posible generar las mesas.'))
        .then(resultado => {
            (resultado.creadas || []).forEach(m => this.mesas.push(m));
            this.pintarMesas();
            tools.hideModal('modal-generar-mesas');
        })
        .catch(err => alert(err.message));
    },

    // -------------------- Zonas: alta / baja --------------------

    agregarZona()
    {
        const id = prompt('ID de la zona:');
        if (!id) return;

        fetch(`./?_target=dmnszona`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(r => this.handleResponse(r, 'No fue posible crear la zona.'))
        .then(nueva => {
            this.tblzonas.DataArray.push(nueva);
            this.tblzonas._printRows();

            // Si es la primera zona, se selecciona automáticamente.
            if (this.tblzonas.DataArray.length === 1) {
                this.zonaActualId = nueva.sys_pk;
                this.pintarMesas();
            }
        })
        .catch(err => alert(err.message));
    },

    eliminarZonaSeleccionada()
    {
        const idx = this.tblzonas.CurrentRowIndex ? this.tblzonas.CurrentRowIndex() : -1;
        if (idx == null || idx < 0) {
            alert('Selecciona una zona para eliminar.');
            return;
        }
        const row = this.tblzonas.DataArray[idx];
        this.eliminarZona(row.sys_pk);
    },

    eliminarZona(sysPk)
    {
        if (!confirm('¿Eliminar la zona seleccionada?\nSe borrarán todas las mesas relacionadas.')) return;

        fetch(`./${sysPk}/?_target=dmnszona`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        })
        .then(r => this.handleResponse(r, 'No fue posible eliminar la zona (verifica que no tenga mesas asociadas).'))
        .then(() => {
            const index = this.tblzonas.DataArray.findIndex(o => o.sys_pk == sysPk);
            if (index > -1) this.tblzonas.DeleteRow(index);
            if (this.zonaActualId === sysPk) this.seleccionarPrimerZona();
            this.pintarMesas();
        })
        .catch(err => alert(err.message));
    },

    // -------------------- Panel de zonas (responsive) --------------------

    toggleZonas()
    {
        document.getElementById('dmns-zonas').classList.toggle('pm-visible');
    }
}

document.addEventListener('DOMContentLoaded', () => { pm.init() });