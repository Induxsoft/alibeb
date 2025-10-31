var prn_arqueo=
{
    Print(data,config,callbackinterval=null)
    {
        let url_redir=data.url_redir;
        if(!eposprn || !config || Object.keys(config).length<1)
        {
            if(url_redir)window.location.href=url_redir;
            return;
        }
    
        model_prn.PrinterException(url_redir,data,callbackinterval);

        eposprn.connect(config, (status)=>
        {
            if(!eposprn.driver.isConnected)
            {
                if(url_redir)window.location.href=data.url_redir;
                return;
            }

            this.CreateTicket(data,callbackinterval)
        },
        (error)=>
        {
            alert(error);
            if(data.url_redir)window.location.href=data.url_redir;
            else if(callbackinterval)callbackinterval(error);
        });
    },
    CreateTicket(data,callbackinterval=null)
    {
        let divider="=========================";
        let totales=data.totales??{};
        let data_orden=data.data_orden??{};
        let data_empresa=data.data_empresa??{};
        let list_dorden=data.list_dorden??{};
        let divisa=data.divisa??{};
        let cajero=data.cajero??{};

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data_empresa.varvalue);
        eposprn.setAlign(0) //1 -> izquierda

        eposprn.printText(divider);

        eposprn.printText(data.fecha??"");
        eposprn.printText("Mesa: "+data_orden.dmnsMesa??"");
        eposprn.printText("CP: "+data_orden.desc_cc??"");
        eposprn.printText("Ticket: "+data_orden.referencia);
        eposprn.printText("Mesero: "+data_orden.nombre);
        eposprn.printText("Cliente: "+data_orden.name_cliente);
        if(cajero.nombre)eposprn.printText("Cajero: "+cajero.nombre??"NA");

        eposprn.printText(divider);
        eposprn.setAlign(1) //1 -> center
        eposprn.printText("-DETALLE DE SU COMPRA-");
        eposprn.printText(divider);
        eposprn.setAlign(0) //1 -> izquierda
                        
        eposprn.printText("DESC  CANT  UNID  IMPORTE");

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            eposprn.printText(`${row.description}  ${controller.RoundTo(row.quantity??0,controller.decimals)}  ${row.unidad??""}  $ ${views.format(row.price,controller.decimals,".",",")}`);
        }

        eposprn.printText(divider);

        eposprn.setAlign(2) //2 -> derecha

        let propina=(data.propina??0);
        let total_apagar=(totales.total??0);

        eposprn.printText(`Total:       $ ${views.format(totales.importe,controller.decimals,".",",")}`);
        if(propina>0)eposprn.printText(`Propina:     $ ${views.format(propina,controller.decimals,".",",")}`);
        
        if(total_apagar>0)
        {
            eposprn.printText(`--------------`);
            eposprn.printText(`A pagar:     $ ${views.format(total_apagar,controller.decimals,".",",")}`);
        }

        eposprn.printText("\n");
        eposprn.setAlign(0); //0 -> izquierda
        eposprn.printText(`${data.total_letras??""} ${divisa.codigo??""}`);
        
        // eposprn.printText("\n");

        eposprn.setAlign(2) //2 -> derecha
        eposprn.printText("-Forma de pago-");

        let efectivo=(data.efectivo??0);
        let tarjeta=(data.tarjeta??0);
        let cambio=(data.cambio??0);

        if(efectivo>0)eposprn.printText(`Efectivo: ${efectivo}`);
        if(tarjeta>0)eposprn.printText(`Tarjeta: ${tarjeta}`);
        if(cambio>0)eposprn.printText(`Cambio: ${cambio}`);

        eposprn.setAlign(0); //0 -> izquierda

        if(efectivo==0 && tarjeta==0 && cambio==0)
        {
            eposprn.printText("\n");
            eposprn.printText("*NO ES UN COMPROBANTE DE PAGO*");
            eposprn.printText("\n");
        }
        eposprn.printText(`${data.text_footer}`);

        if((data.folio_factura??"")!="")
        {
            eposprn.printText("Folio de Facturación");
            eposprn.printText(data.folio_factura);
        }

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();
        data.success=true;

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
    }
}