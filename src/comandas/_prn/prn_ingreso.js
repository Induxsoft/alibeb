var prn_ingreso=
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
        let headers=data.headers??{};
        let body=data.body??{};
        let saldos=data.saldos??{};
        let extras=data.extras??{};
        let divider_full="".padEnd(model_prn.character_width,"=");
        let spacing_left=TextBetween("","============");

        let TextBetween=(text,textleft)=>model_prn.TextBetween(text,textleft);
        let CreatePrinter=(data)=>model_prn.CreatePrinter(data);
        let CreatePrinterSaldos=(saldos)=>
        {
            eposprn.printText(spacing_left);
            model_prn.CreatePrinterSaldos(saldos);
        }

        eposprn.setAlign(1) //1 -> center
        eposprn.printText(data.title);
        eposprn.setAlign(0) //1 -> izquierda

        eposprn.printText("\n");

        eposprn.printText(divider_full);
        CreatePrinter(headers);

        eposprn.printText(divider_full);
        CreatePrinter(body);

        //saldos
        CreatePrinterSaldos(saldos);

        //adicionales
        CreatePrinter(extras);

        eposprn.printText("\n");
        eposprn.printText("\n");
        eposprn.cut();

        data.success=true;

        if(data.url_redir)window.location.href=data.url_redir;
        else if(callbackinterval)callbackinterval(data);
    }
}