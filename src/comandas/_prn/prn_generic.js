
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

        // ... TODO TU CÓDIGO IGUAL (solo cambia eposprn → printer)

        printer.printText("\n");
        printer.printText("\n");
        printer.cut();

        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer){
            showPrintModal(PrinterBuffer.getText());
        }

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
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
        printer.printText("Mesa: "+data.mesa??"");

        printer.printText("Mesero: "+mesero.nombre);
        printer.printText("Cajero: "+cajero.nombre);
        printer.printText("Cliente: "+cliente.name);

        printer.printText(divider_full);
        printer.setAlign(1) //1 -> center
        printer.printText("-DETALLE DE SU COMPRA-");
        printer.printText(divider_full);
        printer.setAlign(0) //1 -> izquierda
                        
        printer.printText("DESC  CANT  UNID  IMPORTE");

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            printer.printText(`${row.description}  ${controller.RoundTo(row.quantity??0,controller.decimals)}  ${row.unidad??""}  $ ${views.format(row.price,controller.decimals,".",",")}`);
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

        if(efectivo==0 && tarjeta==0 && cambio==0)
        {
          printer.printText("\n");
          printer.printText(data.nota_adicional??"");
          printer.printText("\n");
        }

        if(efectivo>0)printer.printText(`Efectivo: $ ${views.format(efectivo,controller.decimals,".",",")}`);
        if(tarjeta>0)printer.printText(`Tarjeta: $ ${views.format(tarjeta,controller.decimals,".",",")}`);
        if(cambio>0)printer.printText(`Cambio: $ ${views.format(cambio,controller.decimals,".",",")}`);

        printer.printText(`${data.text_footer}`);

        //para comprobante de pago  ******************************************
        if((data.folio_factura??"")!="")
        {
            printer.printText("\n");
            printer.printText("Folio de Facturación");
            printer.printText("# "+data.folio_factura);
        }
        //******************************************

        printer.printText("\n");
        printer.printText("\n");
        printer.cut();
        data.success=true;

        // 👇 si NO es impresora real → mostrar modal
        if(printer === PrinterBuffer){
            showPrintModal(PrinterBuffer.getText());
        }

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
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

function getPrinter(){
    // try{
    //     if(eposprn && typeof eposprn.printText === "function"){
    //         return eposprn;
    //     }
    // }catch(e){}
    PrinterBuffer.buffer=[];
    return PrinterBuffer;
}
function showPrintModal(text)
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

    actions.appendChild(btnCopy);
    actions.appendChild(btnClose);

    box.appendChild(textarea);
    box.appendChild(actions);
    modal.appendChild(box);
    document.body.appendChild(modal);
}
