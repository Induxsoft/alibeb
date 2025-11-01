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
        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);

        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============")
        let prefix="$ ";
        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.title??"");
        // eposprn.printText("\n");
        eposprn.setAlign(0) //1 -> izquierda

        eposprn.printText(divider_full);

        eposprn.printText(data.text_corte??"");
        eposprn.printText(data.text_del??"");
        eposprn.printText(data.text_al??"");
        eposprn.printText(data.text_caja??"");
        eposprn.printText(data.text_cajero??"");
        eposprn.printText(data.fecha??"");

        eposprn.printText(divider_full);

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.text_venta??"");
        eposprn.setAlign(0) //1 -> izquierda
        
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

        let divisa_movcaja=data.divisa_movcaja??[];
        let text_ingreso=data.text_ingreso??""
        let text_egreso=data.text_egreso??""
        let text_saldoinicial=data.text_saldoinicial??""
        let divisa_predet=data.divisa_predet??0;

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

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
    }
}