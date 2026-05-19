var prn_ticket=
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

        if(dsEscPrn)dsEscPrn.setCharsetEncoding("CP1252");

        eposprn.connect(config, (status)=>
        {
            // if(!eposprn.driver.isConnected)
            // {
            //     if(url_redir)window.location.href=data.url_redir;
            //     return;
            // }

            this.CreateTicket(data,callbackinterval,config)
        },
        (error)=>
        {
            alert(error);
            if(data.url_redir)window.location.href=data.url_redir;
            else if(callbackinterval)callbackinterval(error);
        });
    },
    async CreateTicket(data,callbackinterval=null,config=null)
    {
        model_prn.character_width=Number(config?.charsPerLine??27);
        let divider_full=model_prn.linea(model_prn.character_width);

        let cconsumo=data.cconsumo??{};
        let mesero=data.mesero??{};
        let cliente=data.cliente??{};
        let list_dorden=data.detalle??[];
        let divisa=data.divisa??{};
        let cajero=data.cajero??{};
        
        eposprn.printText("\n");
        //ejemplo de imprimir barcode
        // eposprn.printBarcode({},"831254784551");
        // eposprn.printQr({size:10},"831254784551");
        // await eposprn.printImage("https://picsum.photos/256",200,256);
        if(data.empresa)
        {
            eposprn.setAlign(1) //1 -> center
            let titulo=(data.empresa??"").split("\n");
            for (let i = 0; i < titulo.length; i++) 
            {
                const t = titulo[i];
                eposprn.printText(t);
            }
        }
        

        eposprn.setAlign(0) //1 -> izquierda
        eposprn.printText(divider_full);
        eposprn.printText("Ticket: "+data.referencia);
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
        // eposprn.setAlign(2) //2 -> derecha
                        
        eposprn.printText(`${model_prn.TextLength("DESC","desc",0)}${model_prn.TextLength("CANT","cantidad")}${model_prn.TextLength("UNID","unidad")}${model_prn.TextLength("IMPORTE","importe")}`);

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            let desc=model_prn.TextLength(row.description??"","desc",0);
            let cantidad=model_prn.TextLength(controller.RoundTo(row.quantity??0,controller.decimals),"cantidad");
            let unidad=model_prn.TextLength(row.unidad??"","unidad");
            let importe=model_prn.TextLength("$ "+views.format(row.total??0,controller.decimals,".",","),"importe");

            eposprn.printText(`${desc}${cantidad}${unidad}${importe}`);
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

        if(efectivo==0 && tarjeta==0 && cambio==0)
        {
          eposprn.printText("\n");
          eposprn.printText(data.nota_adicional??"");
          eposprn.printText("\n");
        }

        if(efectivo>0)eposprn.printText(`Efectivo: $ ${views.format(efectivo,controller.decimals,".",",")}`);
        if(tarjeta>0)eposprn.printText(`Tarjeta: $ ${views.format(tarjeta,controller.decimals,".",",")}`);
        if(cambio>0)eposprn.printText(`Cambio: $ ${views.format(cambio,controller.decimals,".",",")}`);

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(`${data.text_footer}`);

        eposprn.setAlign(0); //0 -> izquierda
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

        eposprn.printText(divider_full);

        eposprn.cut();
        
        data.success=true;

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
    }
}