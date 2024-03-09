var recetas =
{
    urlFormActn:'', urlBack:'', formcomi:[],
    table_rec_cons: null,
    table_rec_vari: null,
    inputk_product: null,
    replace_rect_c: true,
    minrowsRecConst: 10,

    init()
    {
        this.table_rec_cons = document.querySelector('#table_receta_constante');
        this.inputk_product = document.querySelector('#ik_producto');


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

        console.log(this.inputk_product);

        if (this.inputk_product && this.table_rec_cons)
        {
            this.table_rec_cons.setInputKey("codigo",this.inputk_product);
            this.table_rec_cons.setInputKey("descripcion",this.inputk_product);
            this.inputk_product.addEventListener('change', producto => this.agregarProductoRecetaConstante(producto));
        }

        if (check_flagu && ipt_flagutl) check_flagu.addEventListener('change', e => { this.set_ipt_check_value(ipt_flagutl, check_flagu) });
        if (check_flagl && ipt_flaglim) check_flagl.addEventListener('change', e => { this.set_ipt_check_value(ipt_flaglim, check_flagl) });
        if (check_viewp && ipt_visible) check_viewp.addEventListener('change', e => { this.set_ipt_check_value(ipt_visible, check_viewp) });

        if (form_cntnr) form_cntnr.addEventListener('submit', e => { this.create_update_product(e) });
        if (formacomision) formacomision.addEventListener('change', e => this.change_comision_field(formacomision));
        if (tipocomision) tipocomision.addEventListener('change', e => this.select_comision_type(tipocomision));
        if (ipt_utilmin && ipt_costoultimo) ipt_utilmin.addEventListener('keyup', e => this.calcule_utilidad(ipt_utilmin, ipt_costoultimo));

        if (ipt_unidad && ipt_factorb && ipt_unidadb && msg_factor)
        {
            ipt_unidad.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_unidadb.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_factorb.addEventListener('change', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
            ipt_factorb.addEventListener('keyup', e => { this.valide_factor(ipt_unidad,ipt_factorb,ipt_unidadb,msg_factor) });
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

    // =============== RECETA CONSTANTE
    searchProdRecetaConst()
    {
        this.replace_rect_c = false;
        if (this.inputk_product) this.inputk_product.searchText('',true);
    },
    agregarProductoRecetaConstante(producto)
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
            let list = this.getRecetaConstanteList();
            list.push(dataRow);
            this.table_rec_cons.DataArray = list;
            this.autoFillTableRecetaConstante();
        }
        
        this.replace_rect_c = true;
        this.refreshRepresentacion();
    },
    getRecetaConstanteList()
    {
        return this.table_rec_cons.DataArray.filter(data => data.elemento!=undefined);
    },
    refreshRepresentacion()
    {
        const cantidad_total = this.table_rec_cons.DataArray.reduce((total,obj) => total+Number(obj.cantidad??0), 0);
        this.table_rec_cons.DataArray.forEach((producto,index)=>{
            producto['representacion'] = Math.mul(Math.div((producto.cantidad??0),cantidad_total),100);
            if (producto['representacion'] == '0') producto['representacion'] = '';
            this.table_rec_cons.UpdateRow(index);
        });
    },
    autoFillTableRecetaConstante()
    {
        let length = this.table_rec_cons.DataArray.length;
        if (length < this.minrowsRecConst)
        {
            for (let i = length; i < length; i++) {
                this.table_rec_cons.DataArray.push({});
            }
        }
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    recetas.init();
});