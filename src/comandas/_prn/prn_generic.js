
var prn_generic=
{
    print_arqueo(data,callbackinterval=null)
    {
        let eposprn = getPrinter(); // 👈 nuevo

        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);

        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============")
        let prefix="$ ";

        eposprn.setAlign(1)
        eposprn.printText(data.title??"");

        eposprn.setAlign(0)
        eposprn.printText(divider_full);

        eposprn.printText(data.text_corte??"");
        eposprn.printText(data.text_del??"");
        eposprn.printText(data.text_al??"");
        eposprn.printText(data.text_caja??"");
        eposprn.printText(data.text_cajero??"");
        eposprn.printText(data.fecha??"");

        eposprn.printText(divider_full);

        eposprn.setAlign(1)
        eposprn.printText(data.text_venta??"");
        eposprn.setAlign(0)
        
        let _detalle=data.venta_detalle??{};
        let venta_detalle=_detalle.detalle??[];

        for (let i = 0; i < venta_detalle.length; i++) 
        {
            const row = venta_detalle[i];
            eposprn.printText(TextBetween(row.referencia??"",row.text_status??""));
        }

        eposprn.printText(spacing_left);
        eposprn.printText(TextBetween(_detalle.text_total??"",_detalle.str_total??""));
        eposprn.printText(TextBetween(_detalle.text_credito??"",_detalle.str_credito??""));
        eposprn.printText(TextBetween(_detalle.text_contado??"",_detalle.str_contado??""));
        
        eposprn.printText(spacing_left);
        eposprn.printText(TextBetween(_detalle.text_total??"",_detalle.str_total??""));
        eposprn.printText(TextBetween(_detalle.text_propina??"",_detalle.str_propinas??""));
        eposprn.printText(spacing_left);

        eposprn.printText(TextBetween(_detalle.text_ingreso_caja??"",_detalle.str_ingreso_caja??""));
        
        eposprn.printText(_detalle.text_footer??"");

        eposprn.printText("\n");

        // POR LINEAS
        
        let lineas = data.lineas??[];
        if(lineas.length > 0)
        {
            eposprn.printText(divider_full);
            eposprn.setAlign(1); //1 -> center
            eposprn.printText("- LINEAS -");
            eposprn.setAlign(0); //1 -> center
        }
        for (let i = 0; i < lineas.length; i++) 
        {
            const line = lineas[i];
            eposprn.printText(TextBetween(line.descripcion,views.format(line.total,controller.decimals,".",",",prefix)));
        }
        if(lineas.length > 0)
        {
            eposprn.printText("\n");
        }
        // ==============

        let divisa_movcaja=data.divisa_movcaja??[];
        let text_ingreso=data.text_ingreso??""
        let text_egreso=data.text_egreso??""
        let text_saldoinicial=data.text_saldoinicial??""
        let divisa_predet=data.divisa_predet??0;
        
        if(divisa_movcaja.length < 1)
        {
            saldo_inicial=data.saldo_inicial??0;
            eposprn.printText(TextBetween(text_saldoinicial,views.format(saldo_inicial,controller.decimals,".",",",prefix)));
        }
        else
        {
            eposprn.setAlign(1); //1 -> center
            eposprn.printText("- POR DIVISA -");
            eposprn.setAlign(0); //1 -> center
        }

        for (let i = 0; i < divisa_movcaja.length; i++) 
        {
            const row = divisa_movcaja[i];
            
            let ingresos_categoria=row.ingresos_categoria??[];
            let egresos_categoria=row.egresos_categoria??[];
            let formas_ing_pagos=row.formas_ing_pagos??{};
            let divisa=row.idivisa??0;
            let saldo_inicial=row.saldo_inicial??0;

            eposprn.printText(divider_full);
            eposprn.printText(row.descripcion??"");
            eposprn.printText(divider_full);

            eposprn.setAlign(1); //1 -> center
            eposprn.printText(text_ingreso);
            eposprn.setAlign(0); 

            eposprn.printText("\n");
            eposprn.printText(TextBetween(text_saldoinicial,views.format(saldo_inicial,controller.decimals,".",",",prefix)));

            total_ingreso= 0

            for (let a = 0; a < ingresos_categoria.length; a++) 
            {
                const ic = ingresos_categoria[a];
                let total=ic.total??0;
                
                if(divisa != divisa_predet)
                {
                    total=total * (ic.tipocambio??0);
                    eposprn.printText(TextBetween(" X TCambio",views.format(ic.tipocambio??0,controller.decimals,".",",",prefix)));
                }
                total_ingreso +=total;
                eposprn.printText(TextBetween(ic.movcategoria??"",views.format(total,controller.decimals,".",",",prefix)));
            }

            eposprn.printText(spacing_left);
            eposprn.printText(TextBetween("TOTAL",views.format(controller.RoundTo(total_ingreso + saldo_inicial,controller.decimals),controller.decimals,".",",",prefix)));

            eposprn.setAlign(0);
            eposprn.printText("\n");

            eposprn.printText(TextBetween("BILLETES",views.format(formas_ing_pagos.efectivo??0,controller.decimals,".",",",prefix)));
            eposprn.printText(TextBetween("TARJETAS",views.format(formas_ing_pagos.tarjetas??0,controller.decimals,".",",",prefix)));
            eposprn.printText(TextBetween("CHEQUES",views.format(formas_ing_pagos.cheques??0,controller.decimals,".",",",prefix)));
            eposprn.printText(TextBetween("DEPOSITOS",views.format(formas_ing_pagos.depositos??0,controller.decimals,".",",",prefix)));
            eposprn.printText(TextBetween("VALES",views.format(formas_ing_pagos.vales??0,controller.decimals,".",",",prefix)));

            eposprn.printText(spacing_left);
            eposprn.printText(TextBetween("TOTAL",views.format(total_ingreso ,controller.decimals,".",",",prefix)));
            eposprn.printText("\n");
            //IMPRIMIR DATOS DE EGRESOS
            eposprn.setAlign(1);
            eposprn.printText(text_egreso);
            eposprn.printText("\n");
            eposprn.setAlign(0);
            let total_egreso= 0;
            
            for (let a = 0; a < egresos_categoria.length; a++) 
            {
                const ec = egresos_categoria[a];
                let total=ec.total;
                total_egreso += total;
                if(divisa != divisa_predet)
                {
                    total=total * (ec.tipocambio??0);
                    eposprn.printText(TextBetween(" X TCambio",views.format(ec.tipocambio??0,controller.decimals,".",",",prefix)));
                }
                eposprn.printText(TextBetween(ec.movcategoria??"",views.format(total,controller.decimals,".",",",prefix)));
            }

            eposprn.printText(spacing_left);
            eposprn.printText(TextBetween("TOTAL",views.format(controller.RoundTo(total_egreso,controller.decimals),controller.decimals,".",",",prefix)));
            eposprn.printText("\n");
            eposprn.printText(spacing_left);
            eposprn.printText(TextBetween("TOTAL NETO",views.format(saldo_inicial + total_ingreso + total_egreso,controller.decimals,".",",",prefix)));
        }

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();

        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(eposprn === PrinterBuffer)
        {
            let _action={}
            if(data.url_redir)
            {
                _action["btnclose"]={
                    onclick:()=>window.location.href=data.url_redir
                }
            }
            showPrintModal(PrinterBuffer.getText(),_action);
        }
        else if(data.url_redir)window.location.href=data.url_redir;

        if(callbackinterval)callbackinterval(data);
    },
    print_ticket(data,callbackinterval=null)
    {
        let eposprn = getPrinter(); // 👈 nuevo
        
        let divider_full="=========================";
        let cconsumo=data.cconsumo??{};
        let mesero=data.mesero??{};
        let cliente=data.cliente??{};
        let list_dorden=data.detalle??[];
        let divisa=data.divisa??{};
        let cajero=data.cajero??{};

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.empresa??"");
        eposprn.setAlign(0) //1 -> izquierda

        eposprn.printText("Ticket: "+data.referencia);
        eposprn.printText(divider_full);

        eposprn.printText(data.fecha_actual??"");
        eposprn.printText("CC: "+cconsumo.description??"");
        eposprn.printText("Cuenta: "+data.mesa??"");

        eposprn.printText("Vendedor: "+mesero.nombre);
        eposprn.printText("Cajero: "+cajero.nombre);

        if(data.repartidor)eposprn.printText("Repartidor: "+data.repartidor);
        if(data.entrega)
        {
            eposprn.printText("Cliente: "+data.entrega.nombre);
            eposprn.printText("Tel.: "+data.entrega.telefono);
            if(data.entrega.direccion)eposprn.printText("Dirección: "+data.entrega.direccion);
            if(data.entrega.referencia)eposprn.printText("Referencia: "+data.entrega.referencia);
        }
        else eposprn.printText("Cliente: "+cliente.name);

        eposprn.printText(divider_full);
        eposprn.setAlign(1) //1 -> center
        eposprn.printText("-DETALLE DE SU COMPRA-");
        eposprn.printText(divider_full);
        eposprn.setAlign(0) //1 -> izquierda
                        
        eposprn.printText("DESC  CANT  UNID  IMPORTE");

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            eposprn.printText(`${row.description}  ${controller.RoundTo(row.quantity??0,controller.decimals)}  ${row.unidad??""}  $ ${views.format(row.total,controller.decimals,".",",")}`);
            if(row.promociones && row.promociones?.length > 0)
            {
                eposprn.printText(`     Promociones`);

                for (let a = 0; a < row.promociones.length; a++) 
                {
                    const p = row.promociones[a];
                    eposprn.printText(`     - ${p.tipo_aplicacion.trim()}  ${p.codigo}  $ ${controller.RoundTo(p.monto??0,controller.decimals)}`);
                }
            }
            if(row.adds && row.adds?.length > 0)
            {
                // eposprn.printText(`     Adicionales`);

                for (let j = 0; j < row.adds.length; j++) 
                {
                    const add = row.adds[j];
                    eposprn.printText(`     - ${add.descripcion}    ${controller.RoundTo(add.cantidad??0,controller.decimals)}  $ ${views.format(add.importe,controller.decimals,".",",")}`);
                }
            }
        }

        eposprn.printText(divider_full);

        eposprn.setAlign(2) //2 -> derecha
        eposprn.printText(`Total:       $ ${views.format(data.total,controller.decimals,".",",")}`);
        
        //propina
        let propina=(data.propina??0);
        let total_apagar=(data.total??0);
        if(propina>0)eposprn.printText(`Propina:     $ ${views.format(propina,controller.decimals,".",",")}`);
        
        if(total_apagar>0 && (data.show_a_pagar??false))
        {
          eposprn.printText(`--------------`);
          eposprn.printText(`A pagar:     $ ${views.format(total_apagar,controller.decimals,".",",")}`);
        }

        eposprn.printText("\n");
        eposprn.setAlign(0); //0 -> izquierda
        eposprn.printText(`${data.importe_letras??""} ${divisa.codigo??""}`);

        eposprn.setAlign(1) //2 -> derecha
        eposprn.printText("-Forma de pago-");
        
        //para comprobante de pago
        let efectivo=(data.efectivo??0);
        let tarjeta=(data.tarjeta??0);
        let cambio=(data.cambio??0);
        let credito=(data.credito??0);

        if(efectivo>0)eposprn.printText(`Efectivo: $ ${views.format(efectivo,controller.decimals,".",",")}`);
        if(tarjeta>0)eposprn.printText(`Tarjeta: $ ${views.format(tarjeta,controller.decimals,".",",")}`);
        if(credito>0)eposprn.printText(`Crédito: $ ${views.format(credito,controller.decimals,".",",")}`);
        if(cambio>0)eposprn.printText(`Cambio: $ ${views.format(cambio,controller.decimals,".",",")}`);

        if(efectivo==0 && tarjeta==0 && cambio==0 && credito == 0)
        {
          eposprn.printText("\n");
          eposprn.printText(data.nota_adicional??"");
          eposprn.printText("\n");
        }

        eposprn.printText(`${data.text_footer}`);

        //para comprobante de pago  ******************************************
        if((data.folio_factura??"")!="")
        {
            eposprn.printText("\n");
            eposprn.printText("Folio de Facturación");
            eposprn.printText("# "+data.folio_factura);
        }
        if(data.notetable)
        {
            eposprn.setAlign(0); //0 -> izquierda
            eposprn.printText("\nNota:");
            eposprn.printText(divider_full);
            eposprn.printText(data.notetable);
            eposprn.printText(divider_full);
        }
        //******************************************
        
        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();
        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(eposprn === PrinterBuffer)
        {
            let _action={}
            if(data.url_redir)
            {
                _action["btnclose"]={
                    onclick:()=>window.location.href=data.url_redir
                }
            }
            showPrintModal(PrinterBuffer.getText(),_action);
        }
        else if(data.url_redir)window.location.href=data.url_redir;

        if(callbackinterval)callbackinterval(data);
    },
    print_ingreso(data,callbackinterval=null)
    {
        let eposprn = getPrinter(); 
        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);
        let CreatePrinter=(data)=>model_prn.CreatePrinter(data,eposprn);

        let headers=data.headers??{};
        let body=data.body??{};
        let saldos=data.saldos??{};
        let extras=data.extras??{};
        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============");
        
        let CreatePrinterSaldos=(saldos)=>
        {
            eposprn.printText(spacing_left);
            model_prn.CreatePrinterSaldos(saldos,eposprn);
        }

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.title);
        eposprn.setAlign(0) //1 -> izquierda

        // eposprn.printText("\n");

        eposprn.printText(divider_full);
        CreatePrinter(headers,eposprn);

        eposprn.printText(divider_full);
        CreatePrinter(body,eposprn);

        //saldos
        CreatePrinterSaldos(saldos,eposprn);

        //adicionales
        CreatePrinter(extras,eposprn);

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();

        data.success=true;
        
        // 👇 si NO es impresora real → mostrar modal
        if(eposprn === PrinterBuffer)
        {
            let _action={}
            if(data.url_redir)
            {
                _action["btnclose"]={
                    onclick:()=>window.location.href=data.url_redir
                }
            }
            showPrintModal(PrinterBuffer.getText(),_action);
        }
        else if(data.url_redir)window.location.href=data.url_redir;

        if(callbackinterval)callbackinterval(data);
    },
    print_egreso(data,callbackinterval=null)
    {
        let eposprn = getPrinter(); 
        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);
        let CreatePrinter=(data)=>model_prn.CreatePrinter(data,eposprn);

        let headers=data.headers??{};
        let body=data.body??{};
        let saldos=data.saldos??{};
        let extras=data.extras??{};
        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============");

        let CreatePrinterSaldos=(saldos)=>
        {
            eposprn.printText(spacing_left);
            model_prn.CreatePrinterSaldos(saldos,eposprn);
        }

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.title);
        eposprn.setAlign(0) //1 -> izquierda

        // eposprn.printText("\n");

        eposprn.printText(divider_full);
        CreatePrinter(headers,eposprn);

        eposprn.printText(divider_full);
        CreatePrinter(body,eposprn);

        //saldos
        CreatePrinterSaldos(saldos,eposprn);

        //adicionales
        CreatePrinter(extras,eposprn);

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();

        data.success=true;
        console.log(PrinterBuffer.getText())
        // 👇 si NO es impresora real → mostrar modal
        if(eposprn === PrinterBuffer)
        {
            let _action={}
            if(data.url_redir)
            {
                _action["btnclose"]={
                    onclick:()=>window.location.href=data.url_redir
                }
            }
            showPrintModal(PrinterBuffer.getText(),_action);
        }
        else if(data.url_redir)window.location.href=data.url_redir;

        if(callbackinterval)callbackinterval(data);
    }
}



const PrinterBuffer = 
{
    buffer: [],
    align: 0,

    setAlign(val){
        this.align = val;
    },

    printText(text){
        // simulamos alineación simple
        if(this.align === 1){
            text = text.toString().padStart((model_prn.character_width / 2) + text.length / 2);
        }
        this.buffer.push(text);
    },

    cut(){
        this.buffer.push("\n-------- CORTE --------\n");
    },

    clear(){
        this.buffer = [];
    },

    getText(){
        return this.buffer.join("\n");
    }
};

function getPrinter()
{
    PrinterBuffer.buffer=[];
    return PrinterBuffer;
}
function showPrintModal(text,_actions=null)
{
    let modal = document.createElement("div");
    modal.style = `
        position:fixed;
        top:0;left:0;
        width:100%;height:100%;
        background:rgba(0,0,0,0.6);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
    `;

    let box = document.createElement("div");
    box.style = `
        width:400px;
        background:#111;
        padding:15px;
        border-radius:10px;
        display:flex;
        flex-direction:column;
        gap:10px;
    `;

    let textarea = document.createElement("textarea");
    textarea.readOnly = true;
    textarea.scrollTop = textarea.scrollHeight;
    textarea.value = text;
    textarea.style = `
        width:100%;
        height:500px;
        background:#000;
        color:#00ff00;
        font-family: Consolas, monospace;
        font-size:12px;
        white-space:pre;
    `;

    // contenedor de botones
    let actions = document.createElement("div");
    actions.style = `
        display:flex;
        justify-content:space-between;
        gap:10px;
    `;

    // botón copiar
    let btnCopy = document.createElement("button");
    btnCopy.innerText = "Copiar";
    btnCopy.style = `
        flex:1;
        padding:8px;
        cursor:pointer;
    `;

    btnCopy.onclick = async () => {
        try{
            await navigator.clipboard.writeText(textarea.value);
            btnCopy.innerText = "Copiado ✓";
            setTimeout(()=> btnCopy.innerText = "Copiar", 1500);
        }catch(e){
            // fallback por si clipboard falla
            textarea.select();
            document.execCommand("copy");
            btnCopy.innerText = "Copiado ✓";
            setTimeout(()=> btnCopy.innerText = "Copiar", 1500);
        }
    };

    // botón cerrar
    let btnClose = document.createElement("button");
    btnClose.innerText = "Cerrar";
    btnClose.style = `
        flex:1;
        padding:8px;
        cursor:pointer;
    `;
    btnClose.onclick = ()=> modal.remove();

    if(_actions && _actions.btnclose && Object.keys(_actions.btnclose).length > 0)
    {
        Object.assign(btnClose, _actions.btnclose);
    }

    actions.appendChild(btnCopy);
    actions.appendChild(btnClose);

    box.appendChild(textarea);
    box.appendChild(actions);
    modal.appendChild(box);
    document.body.appendChild(modal);
}
