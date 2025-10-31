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
        eposprn.printText("Mesa: "+data.mesa??"");

        eposprn.printText("Mesero: "+mesero.nombre);
        eposprn.printText("Cajero: "+cajero.nombre);
        eposprn.printText("Cliente: "+cliente.name);

        eposprn.printText(divider_full);
        eposprn.setAlign(1) //1 -> center
        eposprn.printText("-DETALLE DE SU COMPRA-");
        eposprn.printText(divider_full);
        eposprn.setAlign(0) //1 -> izquierda
                        
        eposprn.printText("DESC  CANT  UNID  IMPORTE");

        for (let i = 0; i < list_dorden.length; i++) 
        {
            const row = list_dorden[i];
            eposprn.printText(`${row.description}  ${controller.RoundTo(row.quantity??0,controller.decimals)}  ${row.unidad??""}  $ ${views.format(row.price,controller.decimals,".",",")}`);
        }

        eposprn.printText(divider_full);

        eposprn.setAlign(2) //2 -> derecha
        eposprn.printText(`Total:       $ ${views.format(data.total,controller.decimals,".",",")}`);

        eposprn.printText("\n");
        eposprn.setAlign(0); //0 -> izquierda
        eposprn.printText(`${data.importe_letras??""} ${divisa.codigo??""}`);
        
        // eposprn.printText("\n");

        eposprn.setAlign(1) //2 -> derecha
        eposprn.printText("-Forma de pago-");
        eposprn.printText(data.nota_adicional??"");
        
        eposprn.printText(`${data.text_footer}`);

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();
        data.success=true;

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
    }
}