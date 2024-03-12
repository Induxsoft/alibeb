var recetas =
{
    urlFormActn:'', urlBack:'', formcomi:[],
    table_rec_cons: null,
    table_rec_vari: null,
    inputk_product: null,
    replace_rect_c: true,
    replace_rect_v: true,
    minrowsRecConst: 10,
    minrowsRecVarbl: 10,

    init()
    {
        this.table_rec_cons = document.querySelector('#table_receta_constante');
        this.table_rec_vari = document.querySelector('#table_receta_variable');
        this.inputk_product = document.querySelector('#ik_producto');
        this.inputk_product_reemplazo = document.querySelector('#ik_producto_reeplazo');
        this.inputk_grupos = document.querySelector('#ik_grupos');

        const check_flagu = document.querySelector('#check_flagutil');
        const check_flagl = document.querySelector('#check_flaglimites');
        const ipt_flagutl = document.querySelector('#ipt_flagutilidad');
        const ipt_flaglim = document.querySelector('#ipt_flaglimites');
        const check_viewp = document.querySelector('#check_view_pv');
        const ipt_visible = document.querySelector('#ipt_visible');
        const ipt_unidad = document.querySelector('input[name="unidad"]');
        const ipt_factorb = document.querySelector('input[name="factorb"]');
        const ipt_unidadb = document.querySelector('input[name="unidadB"]');
        const msg_factor = document.querySelector('#mesage_factor');
        const form_cntnr = document.querySelector('#form');
        const formacomision = document.querySelector('select[name="formacomision"]');
        const tipocomision = document.querySelector('select[name="tipocomision"]');
        const ipt_utilmin = document.querySelector('input[name="utilmin"]');
        const ipt_costoultimo = document.querySelector('input[name="costoultimo"]');
        const check_ingadic = document.querySelector('#check_ingadic');

        ['ipt_costomanoobra','ipt_costoindirecto'].forEach(id=>{
            const input = document.getElementById(id);
            if (input) input.addEventListener('keyup', () => this.setCosts());
        });

        this.setTableEvents();
        this.setTableConfigs();

        if (check_flagu && ipt_flagutl) check_flagu.addEventListener('change', e => { this.set_ipt_check_value(ipt_flagutl, check_flagu) });
        if (check_flagl && ipt_flaglim) check_flagl.addEventListener('change', e => { this.set_ipt_check_value(ipt_flaglim, check_flagl) });
        if (check_viewp && ipt_visible) check_viewp.addEventListener('change', e => { this.set_ipt_check_value(ipt_visible, check_viewp) });

        if (form_cntnr) form_cntnr.addEventListener('submit', e => this.create_update_product(e));
        if (formacomision) formacomision.addEventListener('change', e => this.change_comision_field(formacomision));
        if (tipocomision) tipocomision.addEventListener('change', e => this.select_comision_type(tipocomision));
        if (ipt_utilmin && ipt_costoultimo) ipt_utilmin.addEventListener('keyup', e => this.calcule_utilidad(ipt_utilmin, ipt_costoultimo));
        if (check_ingadic) check_ingadic.addEventListener('change', () => this.disableAdicional(!check_ingadic.checked) );

        if (ipt_unidad && ipt_factorb && ipt_unidadb && msg_factor)
        {
            ipt_unidad.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_unidadb.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_factorb.addEventListener('change', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_factorb.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
        }
    },

    // =============== TABLES EVENTS AND CONFIGS

    setTableEvents()
    {
        if (this.table_rec_cons)
        {
            const T = this.table_rec_cons;
            const E = T.EdiTable.Const.Events;
            T.Events[E.FieldUpdated] = (e) => { this.fieldUpdatedRecCon(e); }
        }
        if (this.table_rec_vari)
        {
            const T = this.table_rec_vari;
            const E = T.EdiTable.Const.Events;
            T.Events[E.FieldUpdated] = (e) => { this.fieldUpdatedRecVar(e); }
            T.Events[E.BeforeUpdateCell] = (e) => { this.BeforeUpdateCellRecVar(e); }
        }
    },
    setTableConfigs()
    {
        if (this.inputk_product && this.table_rec_cons)
        {
            this.table_rec_cons.onTdPaint = (td,idx,indexcol,field) => this.setCellColors(td,indexcol,this.table_rec_cons);
            this.table_rec_cons.setInputKey("codigo",this.inputk_product);
            this.table_rec_cons.setInputKey("descripcion",this.inputk_product);
            this.table_rec_cons.setInputKey("reemplazo",this.inputk_product_reemplazo);
            this.inputk_product.addEventListener('change', producto => this.addProdRecCon(producto));
            this.inputk_product_reemplazo.addEventListener('change', producto => this.addProdReemRecCon(producto));
            this.table_rec_cons._printRows();
        }
        if (this.inputk_grupos && this.table_rec_vari)
        {
            this.table_rec_vari.onTdPaint = (td,idx,indexcol,field) => this.setCellColors(td,indexcol,this.table_rec_vari);
            this.table_rec_vari.setInputKey("grupo_desc",this.inputk_grupos);
            this.inputk_grupos.addEventListener('change', grupo => this.addGrupoRecVar(grupo));
            this.table_rec_vari._printRows();
        }
    },

    // =============== GENERAL

    set_ipt_check_value(inputElement, checkElement)
    {
        inputElement.value = (checkElement.checked ? 1 : 0);
    },
    create_update_product(event)
    {
        event.preventDefault();

        const reqCall = control => 
        {
            let panel = control.closest('div[role="tabpanel"]');
            if (panel) {
                let tab = document.querySelector(`button[id="${panel.getAttribute('aria-labelledby')}"]`);
                if (tab) tab.click();
                control.focus();
            }
        }

        let data = main.getValues('form', true, reqCall);
        if (data==null) return;

        let d = {}
        Object.keys(data).forEach(k => {
            if (k.trim()!='') d[k]=data[k];
        });
        
        InduxsoftCrudlModel.InvokeService(this.urlFormActn, d,
            success => { window.location.href = this.urlBack; },
            failure => { alert('No fue posible guardar el producto.\n'+JSON.stringify(failure)); },
            "POST", false 
        );
    },
    valide_factor(unit1,factor,unit2,msg)
    {
        if (Number(factor.value) < 1) {
            msg.textContent = 'El factor debe ser mayor a 0';
            return;
        }
        if (unit1.value.trim()=='' || unit2.value.trim()=='') {
            msg.textContent = '';
            return;
        }
        if (unit1.value.trim() == unit2.value.trim()) {
            if (factor.value != 1) {
                msg.textContent = 'El factor no es correcto, debe ser 1';
                return;
            }
        }
        else {
            if (factor.value == 1) {
                msg.textContent = 'El factor no es correcto, debe ser diferente de 1';
                return;
            }
        }

        msg.textContent = `1 ${unit2.value} es equivalente a ${factor.value} ${unit1.value}`;
    },
    setCellColors(td,indexcol,table)
    {
        let coldef = table.Columns[indexcol];
        if (coldef && coldef.type.toLowerCase() == 'noeditable')
        {
            td.style.backgroundColor = '#FAFAFA';
            td.style.color = '#000';
        }
    },
    autoFillTable(table,rows)
    {
        let length = table.DataArray.length;
        if (length < rows) {
            for (let i = length; i < rows; i++) table.DataArray.push({});
        }
    },
    getTableList(table,valideField)
    {
        return table.DataArray.filter(data => data[valideField]!=undefined);
    },

    // =============== RECETA CONSTANTE

    searchProdRecCon()
    {
        this.replace_rect_c = false;
        if (this.inputk_product) this.inputk_product.searchText('%',true);
    },
    addProdRecCon(producto)
    {
        if (!producto) return;

        let dataRow = {
            sys_pk: 0,
            sys_recver: 0,
            elemento: producto.sys_pk,
            codigo: producto.codigo,
            descripcion: producto.descripcion,
            unidad: producto.unidad,
            cantidad: 1,
            costoultimo: producto.costoultimo,
            importe: producto.costoultimo,
            representacion: 100,
            cantdemasiado: 0,
            cantmucho: 0,
            cantpoco: 0,
            omitible: 'No'
        }

        if (this.replace_rect_c)
        {
            let idx = this.table_rec_cons.CurrentRowIndex();
            if (!this.table_rec_cons.DataArray[idx]) this.table_rec_cons.DataArray[idx] = {};
            this.table_rec_cons.DataArray[idx] = dataRow;
        }
        else
        {
            let list = this.getTableList(this.table_rec_cons, 'elemento');
            list.push(dataRow);
            this.table_rec_cons.DataArray = list;
        }
        
        this.replace_rect_c = true;
        this.autoFillTable(this.table_rec_cons,this.minrowsRecConst);
        this.table_rec_cons._printRows();
        this.calcsRecCon();
    },
    addProdReemRecCon(producto)
    {
        if (!producto) return;

        let idx = this.table_rec_cons.CurrentRowIndex();
        if (idx == -1) return;

        let data = this.table_rec_cons.DataArray[idx];
        if (data)
        {
            data['reemplazo'] = producto.descripcion;
            data['reemplazo_pk'] = producto.sys_pk;
            this.table_rec_cons.UpdateRow(idx);
        }
    },
    calcsRecCon()
    {
        const cantidad_total = this.table_rec_cons.DataArray.reduce((total,obj) => Math.add(total,Number(obj.cantidad??0)), 0);
        let importe_total = 0;
        this.table_rec_cons.DataArray.forEach((producto,index)=>{
            if (producto.elemento != undefined) {
                producto['representacion'] = Math.mul(Math.div(Number(producto.cantidad??0),cantidad_total),100);
                producto['importe'] = Math.mul(Number(producto.cantidad??0),Number(producto.costoultimo??0));
                importe_total += Number(producto.importe);
                this.table_rec_cons.UpdateRow(index);
            }
        });
        const RC_cdirecto = document.querySelector('#RC_cdirecto');
        if (RC_cdirecto) RC_cdirecto.value = importe_total;
        this.setCosts();
    },
    fieldUpdatedRecCon(e)
    {
        if (e.field == 'cantidad')
        {
            this.calcsRecCon();
        }
    },
    deleteProdRecCon()
    {
        this.table_rec_cons.DeleteCurrentRow();
    },

    // =============== RECETA VARIABLE

    searchProdRecVar()
    {
        this.replace_rect_v = false;
        if (this.inputk_grupos) this.inputk_grupos.searchText('%',true);
    },
    addGrupoRecVar(grupo)
    {
        if (!grupo) return;

        let dataRow = {
            sys_pk: 0,
            sys_recver: 0,
            grupo: grupo.grupo,
            grupo_desc: grupo.grupo_desc,
            descripcion: '',
            factor: 1,
            maximo: 1,
            minimo: 1,
            padicional: '0 - Ninguno',
            cdirectoprom: grupo.cdirectoprom,
            cmanoobraprom: grupo.cmanoobraprom,
            cindirectoprom: grupo.cindirectoprom,
            _cdirectoprom: grupo._cdirectoprom,
            _cmanoobraprom: grupo._cmanoobraprom,
            _cindirectoprom: grupo._cindirectoprom
        }

        if (this.replace_rect_v)
        {
            let idx = this.table_rec_vari.CurrentRowIndex();
            if (!this.table_rec_vari.DataArray[idx]) this.table_rec_vari.DataArray[idx] = {};
            this.table_rec_vari.DataArray[idx] = dataRow;
        }
        else
        {
            let list = this.getTableList(this.table_rec_vari, 'grupo');
            list.push(dataRow);
            this.table_rec_vari.DataArray = list;
        }
        
        this.replace_rect_v = true;
        this.autoFillTable(this.table_rec_vari,this.minrowsRecVarbl);
        this.table_rec_vari._printRows();
        this.calcsRecVar();
    },
    calcsRecVar()
    {
        let importe_total = 0;
        this.table_rec_vari.DataArray.forEach((grupo,index)=>{
            if (grupo.grupo != undefined) {
                const fac = Number(grupo.factor??1);
                const max = Number(grupo.maximo??1);
                const mul = Math.mul(fac, (max>0?max:1));
                grupo['cdirectoprom'] = Math.mul(mul,Number(grupo._cdirectoprom??0));
                grupo['cmanoobraprom'] = Math.mul(mul,Number(grupo._cmanoobraprom??0));
                grupo['cindirectoprom'] = Math.mul(mul,Number(grupo._cindirectoprom??0));
                this.table_rec_vari.UpdateRow(index);

                importe_total += grupo.cdirectoprom;
            }
        });
        const RV_costo = document.querySelector('#RV_costo');
        if (RV_costo) RV_costo.value = importe_total;
        this.setCosts();
    },
    fieldUpdatedRecVar(e)
    {
        if (e.field == 'factor' || e.field == 'maximo')
        {
            this.calcsRecVar();
        }
    },
    BeforeUpdateCellRecVar(e)
    {
        const T = this.table_rec_vari;
        let data = T.DataArray[T.RowIndexOfTd(e.td)];
        if (!data) return;

        switch(e.coldef.field)
        {
            case 'factor': { if (Number(e.text) < 1) { alert('Factor incorrecto'); e.cancel = true; } break; }
            case 'maximo': { if (Number(e.text) < Number(data.minimo??0)){ alert('El valor máximo debe ser mayor o igual al valor mínimo'); e.cancel = true } break; }
            case 'minimo': { 
                if (Number(e.text) < 0) { alert('El valor mínimo debe ser mayor o igual a cero'); e.cancel = true; }
                if (Number(e.text) > Number(data.maximo??0)) { alert('El valor mínimo debe ser menor o igual que el máximo'); e.cancel = true; }
                break;
            }
        }
    },
    deleteProdRecVar()
    {
        this.table_rec_vari.DeleteCurrentRow();
    },

    // =============== PRODUCCIÓN Y COSTOS

    setCosts()
    {
        const ipt_rc_total = document.querySelector('#RC_cdirecto');
        const ipt_rv_total = document.querySelector('#RV_costo');
        const ipt_cdirecto = document.querySelector('#ipt_costodirecto');
        const ipt_costotal = document.querySelector('#ipt_costototprod');
        const ipt_manoobra = document.querySelector('#ipt_costomanoobra');
        const ipt_indirect = document.querySelector('#ipt_costoindirecto');
        const costo_ultimo = document.querySelector('input[name="costoultimo"]');
        ipt_cdirecto.value = Math.add(Number(ipt_rc_total.value), Number(ipt_rv_total.value));
        ipt_costotal.value = Math.add(Number(ipt_cdirecto.value), Number(ipt_manoobra.value), Number(ipt_indirect.value));
        costo_ultimo.value = ipt_costotal.value;
    },

    // =============== PRECIOS

    change_comision_field(select)
    {
        const fcomi = select.value;

        const ipt_comision = document.querySelector('input[name="comision"]');
        const con_comision = document.querySelector('#comisiones_precio_container');
        const tab_comision = document.querySelector('#comisionprecio-tab');

        if (ipt_comision && con_comision && tab_comision)
        {
            ipt_comision.toggleAttribute('disabled', fcomi!='1');
            tab_comision.classList.toggle('d-none', fcomi!='2');

            ipt_comision.value = 0;
            con_comision.querySelectorAll('input').forEach(input => {
                input.value = 0;
            });

            if (fcomi=='2')
            {
                tab_comision.click();
            }
            else
            {
                const tab_prices = document.querySelector('#list_price-tab');
                if (tab_prices) tab_prices.click();
            }
        }
    },
    select_comision_type(select)
    {
        const select_forma = document.querySelector('select[name="formacomision"]');
        let type = select.value;
        let opts = [];

        switch (type)
        {
            case "0":
            { 
                opts = this.formcomi.filter(f => f.id == '0'); break; 
            }
            case "1":
            {
                opts = this.formcomi.filter(f => f.id == '1' || f.id == '2'); break; 
            }
            case "2":
            { 
                opts = this.formcomi.filter(f => f.id == '1' || f.id == '2' || f.id == '3'); break; 
            }
        }

        this.fill_select(select_forma, opts);
        this.change_comision_field(select_forma);
        select_forma.toggleAttribute('disabled', (type=='0'));
    },
    fill_select(select, options)
    {
        let template = ``;
        if (options && options.length > 0)
        {
            options.forEach((opt,i) => {
                template += `<option value="${opt.id}">${opt.const}</option>`;
            });
        }
        select.innerHTML = template;
    },
    calcule_utilidad(ipt_utilidad, ipt_costoultimo)
    {
        let utilidad = Number(ipt_utilidad.value);
        let precio = Number(ipt_costoultimo.value);
        let percent = Math.mul(precio,Math.div(utilidad, 100));

        let ipt_prices = document.querySelectorAll('.precio-util');
        
        ipt_prices.forEach(ipt =>{
            ipt.value = Math.add(precio, percent);
        });
    },
    disableAdicional(disable=true)
    {
        const inputs = document.querySelectorAll('.ipt-adicional');
        inputs.forEach(input=>input.toggleAttribute('disabled',disable));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    recetas.init();
});