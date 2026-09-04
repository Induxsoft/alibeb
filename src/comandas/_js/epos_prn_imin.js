imin_register();

function _PrinterException(o,ltimer=5)
{
    let interval=setInterval(() => 
    {
        if(o?.connection && !(o?.isConnected??false))
        { 
            let ws=o.connection?.ws;
            if(o.connection.l_timer >= ltimer)
            {
                if(!ws || (ws && ws.readyState>=3))
                {
                    o.connection.reconnect =function() {console.warn("Reconexión deshabilitada");}
                    if(interval)clearInterval(interval);
                    toast("No se logró conectar con el controlador");
                }
            }
        }
        else if(interval)clearInterval(interval);
    }, 300);
}
function imin_printer(lineas,meta)
{
    var o=createDriver_imin();

    setTimeout(() => {_PrinterException(o);}, 500);

    o.connect(meta.impresora,(status)=>
    {
        if(status == "failed")
        {
            console.warn("No se logró conectar al controlador");
            return;
        }
        
        for (let i = 0; i < lineas.length; i++) 
        {
            const linea = lineas[i];
            o.printText(linea);
        }

        setTimeout(() => {
            o.openCashDrawer();
        }, 1000);
    });
}
function imin_register()
{
    if (typeof POSPrinter === "undefined" || typeof POSPrinter.registrar !== "function") {
        return;
    }

    POSPrinter.registrar('imin','Controlador Imin', function(lineas,meta){
        imin_printer(lineas,meta);
        return Promise.resolve();
    }, { ajustes:true });
}

function createDriver_imin(){
    var o={
        buffer:"",
        flag_cut:false,
        flag_cash:false,
        connect:function(device,success,fail)
        {
            this.connection = new IminPrinter();

            this.connection.connect().then(async (isConnect) => 
            {
                if (!isConnect) {return;}

                this.isConnected = true;

                const status = await this.connection.getPrinterStatus();

                this.connection.initPrinter();

                if (success) success(status.text);
            })
            .catch(error => {
                console.error("Error conectando con impresora:", error);
            });
        },
        setAlign:function(align)
        {
            //align=0-Izquierda, 1-Centro y 2-derecha
            if(this.isConnected) { this.connection.setAlignment(align); }
        },
        setFontBold:function(flag)
        {
            //flag=true/false
            if(this.isConnected) { this.connection.setTextStyle(flag ? 1 : 0); }
        },
        setFontItalic:function(flag)
        {
            //flag=true/false
            if(this.isConnected){ this.connection.setTextStyle(flag ? 2 : 0); }
        },
        setFontUnderline:function(flag)
        {
            //flag=true/false
        },
        setFontSize:function(size)
        {
            //size=0-Normal, 1-2x, 2-3x  ->mm
            if(this.isConnected){ this.connection.setTextSize(size); }
        },
        printText:function(txt,cut=false)
        {
            //txt=Cadena de texto a imprimir
            if(this.isConnected && txt)
			{
                this.connection.printText(txt);//si requiere salto de linea al texto agreguele  '\n'
                if(cut)this.connection.printAndFeedPaper(50);
            }
        },
        printBarcode:function(std,data)
        {
            //std={standar, width, height, type, error_correction, contentPosition=0-noPrint/1=aboveBar/2=BelowBar/3=Both, etc..}
            //data=Datos
            if(this.isConnected && std){
                this.connection.setBarCodeWidth(std.width);
                this.connection.setBarCodeHeight(std.height);
                this.connection.setBarCodeContentPrintPos(std.contentPosition);
                this.connection.printBarCode(std.type, data);
                this.connection.printAndFeedPaper(100);
            }
        },
        printQr:function(std,data)
        {
            //std={standar, size=1-9, position=0-left/1-center/2-right, error_correction,etc..}
            //data
            if(this.isConnected && std){
                //o.window.QrCodeSize = std.size;
                this.connection.setQrCodeSize(std.size);
                this.connection.setQrCodeErrorCorrectionLev(std.error_correction);
                this.connection.printQrCode(data, std.position)
                this.connection.printAndFeedPaper(100);
            }
        },
        printImage:function(source,h,w)
        {
            //source=Cadena o qué? -> dataURL
            //h=alto
            //w=ancho (en qué unidad?)
            if(this.isConnected && source){
                this.connection.printSingleBitmap(source);
                this.connection.printAndFeedPaper(200);
            }
        },
        writeHexBytes:function(hex)
        {
            //hex=Cadena delimitada por comas con secuencias hexadecimales (bytes) Ejemplo: 1B,40,C1
        },
        cut:function()
        {
            this.connection.partialCut();
        },
        openCashDrawer:function()
        {
            this.connection.openCashBox();
        }
    };
    return o;
}