
var prn_generic=
{
    print_arqueo(data,callbackinterval=null)
    {
        let printer = getPrinter(); // 👈 nuevo

        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);

        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============")
        let prefix="$ ";

        printer.setAlign(1)
        printer.printText(data.title??"");

        printer.setAlign(0)
        printer.printText(divider_full);

        printer.printText(data.text_corte??"");
        printer.printText(data.text_del??"");
        printer.printText(data.text_al??"");
        printer.printText(data.text_caja??"");
        printer.printText(data.text_cajero??"");
        printer.printText(data.fecha??"");

        printer.printText(divider_full);

        printer.setAlign(1)
        printer.printText(data.text_venta??"");
        printer.setAlign(0)
        
        let _detalle=data.venta_detalle??{};
        let venta_detalle=_detalle.detalle??[];

        for (let i = 0; i < venta_detalle.length; i++) 
        {
            const row = venta_detalle[i];
            printer.printText(TextBetween(row.referencia??"",row.text_status??""));
        }

        printer.printText(spacing_left);
        printer.printText(TextBetween(_detalle.text_total??"",_detalle.str_total??""));
        printer.printText(TextBetween(_detalle.text_credito??"",_detalle.str_credito??""));
        printer.printText(TextBetween(_detalle.text_contado??"",_detalle.str_contado??""));
        
        printer.printText(spacing_left);
        printer.printText(TextBetween(_detalle.text_total??"",_detalle.str_total??""));
        printer.printText(TextBetween(_detalle.text_propina??"",_detalle.str_propinas??""));
        printer.printText(spacing_left);

        printer.printText(TextBetween(_detalle.text_ingreso_caja??"",_detalle.str_ingreso_caja??""));
        
        printer.printText(_detalle.text_footer??"");

        printer.printText("\n");

        // ... TODO TU CÓDIGO IGUAL (solo cambia printer → printer)

        printer.printText("\n");
        printer.printText("\n");
        printer.cut();

        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer)
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
        let printer = getPrinter(); // 👈 nuevo
        
        let divider_full="=========================";
        let cconsumo=data.cconsumo??{};
        let mesero=data.mesero??{};
        let cliente=data.cliente??{};
        let list_dorden=data.detalle??[];
        let divisa=data.divisa??{};
        let cajero=data.cajero??{};

        printer.setAlign(1) //1 -> center
        printer.printText(data.empresa??"");
        printer.setAlign(0) //1 -> izquierda

        printer.printText("Ticket: "+data.referencia);
        printer.printText(divider_full);

        printer.printText(data.fecha_actual??"");
        printer.printText("CC: "+cconsumo.description??"");
        printer.printText("Cuenta: "+data.mesa??"");

        printer.printText("Vendedor: "+mesero.nombre);
        printer.printText("Cajero: "+cajero.nombre);

        if(data.repartidor)printer.printText("Repartidor: "+data.repartidor);
        if(data.entrega)
        {
            printer.printText("Cliente: "+data.entrega.nombre);
            printer.printText("Tel.: "+data.entrega.telefono);
            if(data.entrega.direccion)printer.printText("Dirección: "+data.entrega.direccion);
            if(data.entrega.referencia)printer.printText("Referencia: "+data.entrega.referencia);
        }
        else printer.printText("Cliente: "+cliente.name);

        printer.printText(divider_full);
        printer.setAlign(1) //1 -> center
        printer.printText("-DETALLE DE SU COMPRA-");
        printer.printText(divider_full);
        printer.setAlign(0) //1 -> izquierda
                        
        printer.printText("DESC  CANT  UNID  IMPORTE");

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            printer.printText(`${row.description}  ${controller.RoundTo(row.quantity??0,controller.decimals)}  ${row.unidad??""}  $ ${views.format(row.total,controller.decimals,".",",")}`);
            
            if(row.adds && row.adds?.length > 0)
            {
                printer.printText(`     Adicionales`);

                for (let j = 0; j < row.adds.length; j++) 
                {
                    const add = row.adds[j];
                    printer.printText(`     - ${add.descripcion}    ${controller.RoundTo(add.cantidad??0,controller.decimals)}  $ ${views.format(add.importe,controller.decimals,".",",")}`);
                }
            }
        }

        printer.printText(divider_full);

        printer.setAlign(2) //2 -> derecha
        printer.printText(`Total:       $ ${views.format(data.total,controller.decimals,".",",")}`);
        
        //propina
        let propina=(data.propina??0);
        let total_apagar=(data.total??0);
        if(propina>0)printer.printText(`Propina:     $ ${views.format(propina,controller.decimals,".",",")}`);
        
        if(total_apagar>0 && (data.show_a_pagar??false))
        {
          printer.printText(`--------------`);
          printer.printText(`A pagar:     $ ${views.format(total_apagar,controller.decimals,".",",")}`);
        }

        printer.printText("\n");
        printer.setAlign(0); //0 -> izquierda
        printer.printText(`${data.importe_letras??""} ${divisa.codigo??""}`);

        printer.setAlign(1) //2 -> derecha
        printer.printText("-Forma de pago-");
        
        //para comprobante de pago
        let efectivo=(data.efectivo??0);
        let tarjeta=(data.tarjeta??0);
        let cambio=(data.cambio??0);
        let credito=(data.credito??0);

        if(efectivo>0)printer.printText(`Efectivo: $ ${views.format(efectivo,controller.decimals,".",",")}`);
        if(tarjeta>0)printer.printText(`Tarjeta: $ ${views.format(tarjeta,controller.decimals,".",",")}`);
        if(credito>0)printer.printText(`Crédito: $ ${views.format(credito,controller.decimals,".",",")}`);
        if(cambio>0)printer.printText(`Cambio: $ ${views.format(cambio,controller.decimals,".",",")}`);

        if(efectivo==0 && tarjeta==0 && cambio==0 && credito == 0)
        {
          printer.printText("\n");
          printer.printText(data.nota_adicional??"");
          printer.printText("\n");
        }

        printer.printText(`${data.text_footer}`);

        //para comprobante de pago  ******************************************
        if((data.folio_factura??"")!="")
        {
            printer.printText("\n");
            printer.printText("Folio de Facturación");
            printer.printText("# "+data.folio_factura);
        }
        if(data.notetable)
        {
            printer.setAlign(0); //0 -> izquierda
            printer.printText("\nNota:");
            printer.printText(divider_full);
            printer.printText(data.notetable);
            printer.printText(divider_full);
        }
        //******************************************
        
        printer.printText("\n");
        printer.printText("\n");
        printer.cut();
        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer)
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
        let printer = getPrinter(); 
        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);
        let CreatePrinter=(data)=>model_prn.CreatePrinter(data,printer);

        let headers=data.headers??{};
        let body=data.body??{};
        let saldos=data.saldos??{};
        let extras=data.extras??{};
        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============");
        
        let CreatePrinterSaldos=(saldos)=>
        {
            printer.printText(spacing_left);
            model_prn.CreatePrinterSaldos(saldos,printer);
        }

        printer.setAlign(1) //1 -> center
        printer.printText(data.title);
        printer.setAlign(0) //1 -> izquierda

        // printer.printText("\n");

        printer.printText(divider_full);
        CreatePrinter(headers,printer);

        printer.printText(divider_full);
        CreatePrinter(body,printer);

        //saldos
        CreatePrinterSaldos(saldos,printer);

        //adicionales
        CreatePrinter(extras,printer);

        printer.printText("\n");
        printer.printText("\n");
        printer.cut();

        data.success=true;
        
        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer)
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
        let printer = getPrinter(); 
        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);
        let CreatePrinter=(data)=>model_prn.CreatePrinter(data,printer);

        let headers=data.headers??{};
        let body=data.body??{};
        let saldos=data.saldos??{};
        let extras=data.extras??{};
        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============");

        let CreatePrinterSaldos=(saldos)=>
        {
            printer.printText(spacing_left);
            model_prn.CreatePrinterSaldos(saldos,printer);
        }

        printer.setAlign(1) //1 -> center
        printer.printText(data.title);
        printer.setAlign(0) //1 -> izquierda

        // printer.printText("\n");

        printer.printText(divider_full);
        CreatePrinter(headers,printer);

        printer.printText(divider_full);
        CreatePrinter(body,printer);

        //saldos
        CreatePrinterSaldos(saldos,printer);

        //adicionales
        CreatePrinter(extras,printer);

        printer.printText("\n");
        printer.printText("\n");
        printer.cut();

        data.success=true;
        console.log(PrinterBuffer.getText())
        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer)
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
