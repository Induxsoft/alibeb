var model_prn=
{
    name_storage:"cfg_printer",
    character_width:25,
    ltimer:5,//intentos de conexión al imin printer
    TextBetween(text,textleft)
    {
        let lt=text.length+textleft.length;
        if(lt>this.character_width)return text+textleft;

        let l=Math.abs(this.character_width - lt);

        return text+"".padEnd(l," ")+textleft;
    },
    CreatePrinter(data)
    {
        for(let key in data)
        {
            eposprn.printText(data[key]??"");
        }
    },
    PrinterException(url_redir,data,callbackinterval=null)
    {
        if(!callbackinterval)callbackinterval=(data)=>{window.location.reload();}

        let interval=setInterval(() => 
        {
            if(eposprn.driver.connection && !(eposprn.driver?.isConnected??false))
            { 
                let ws=eposprn.driver.connection.ws;
                
                if(eposprn.driver.connection.l_timer >= model_prn.ltimer)
                {
                    if(!ws || (ws && ws.readyState>=3))
                    {
                        if(interval)clearInterval(interval);
                        if(url_redir)window.location.href=url_redir;
                        if(callbackinterval)callbackinterval(data);
                    }
                }
            }
            else if(interval)clearInterval(interval);
        }, 300);
    },
    CreatePrinterSaldos(saldos)
    {
        for(let key in saldos)
        {
            if(key!="total" && !key.includes("str_"))
                eposprn.printText(this.TextBetween(saldos[key]??"",saldos["str_"+key]));
        }

        if((saldos.total??"")!="")eposprn.printText(TextBetween("TOTAL:",saldos.total));
    },
    Drivers()
    {
        var uri=url+"pos/dinner/get-drivers/?access=true";
        model.invoke_service(uri,null,
        (data)=>
        {
            this.view.LoadDrivers(data);
        }
        ,(error)=>{alert(error.message);}
        ,"GET",false);
    },
    GetDataCuenta(tieckt,callback)
    {
        var uri=url+"pos/dinner/get-data-ticket/"+tieckt+"/?access=true";
        model.invoke_service(uri,null,
        (data)=>
        {
            console.log(data);
            callback(data)
        }
        ,(error)=>{alert(error.message);}
        ,"GET",false);
    },
    GetConfigPrinter()
    {
        let config_str=localStorage.getItem(model_prn.name_storage);
        if(!config_str)return {};

        return JSON.parse(config_str);
    },
    print_arqueo(data,callbackinterval=null)
    {
        let config=this.GetConfigPrinter();
        if(!config.data || config.printer=="server")return;

        prn_arqueo.Print(data,config.data,callbackinterval)
    },
    print_egreso(data,callbackinterval=null)
    {
        let config=this.GetConfigPrinter();
        if(!config.data || config.printer=="server")return;

        prn_egreso.Print(data,config.data,callbackinterval);
    },
    print_ingreso(data,callbackinterval=null)
    {
        let config=this.GetConfigPrinter();
        if(!config.data || config.printer=="server")return;

        prn_ingreso.Print(data,config.data,callbackinterval);
    },
    print_ticket(data,callbackinterval=null)
    {
        let config=this.GetConfigPrinter();
        if(!config.data || config.printer=="server")return;

        prn_ticket.Print(data,config.data,callbackinterval);
    },
    view:
    {
        init()
        {
            model_prn.Drivers();
            this.form=document.getElementById("form-config-prn");
            
            this.select_server=document.getElementById("select_server");
            this.select_device=document.getElementById("select_device");

            this.rdo_server=document.getElementById("rdo_server");
            this.rdo_device=document.getElementById("rdo_device");

            this.row_data_prn=document.getElementById("row_data_prn");
            this.id_device=document.getElementById("id_device");
            this.btn_save_config=document.getElementById("btn_save_config");
            //eventos
            if(this.select_server)this.select_server.addEventListener("change",()=>this.LoadDataElement());
            if(this.select_device)this.select_device.addEventListener("change",()=>this.LoadDataElement());
            if(this.btn_save_config)this.btn_save_config.addEventListener("click",()=>this.SaveData());
            if(this.rdo_server)this.rdo_server.addEventListener("change",()=>
            {
                if(this.select_server)this.select_server.disabled=!this.rdo_server.checked;
                if(this.select_device)this.select_device.disabled=this.rdo_server.checked;
                this.ActionElement();
                this.ActionElement("disabled");
            });

            if(this.rdo_device)this.rdo_device.addEventListener("change",()=>
            {
                if(this.select_device)this.select_device.disabled=!this.rdo_device.checked;
                if(this.select_server)this.select_server.disabled=this.rdo_device.checked;
                this.ActionElement();
                this.ActionElement("disabled");
            });
        },
    
        LoadDrivers(data)
        {
            if(!this.form)return;

            if(this.select_server){this.select_server.innerHTML=this.CreateOptions(data.server);}
            if(this.select_device){this.select_device.innerHTML=this.CreateOptions(data.device);}

            setTimeout(() => 
            {
                this.SetDataFromConfig();
            }, 100);
        },
        CreateOptions(data)
        {
            let html=`<option value="">(Ninguno)</option>`;
            for (let i = 0; i < data.length; i++) 
            {
                const element = data[i];
                html+=`<option value="${element.name}" data-value='${JSON.stringify(element)}'>${element.name} - ${element.type.default??""} </option>`
            }

            return html;
        },
        SetDataFields(data)
        {
            for(let key in data)
            {
                let element=document.getElementById(key);
                if(!element)continue;
                
                if(key=="type" && data[key].default)element.value=data[key].default;
                else element.value=data[key]??"";
            }
        },
        LoadDataElement()
        {
            if(!this.select_server || !this.select_device)return;

            let dataelement=(data)=>
            {
                if(!data || Object.keys(data).length <1)
                {
                    this.ActionElement();
                    this.ActionElement("disabled");
                    return;
                }

                this.SetDataFields(data);
            }

            let getOptionSelected=(select)=>
            {
                const option = select.options[select.selectedIndex];
                if(!option)return;
                
                let dv=option.getAttribute("data-value")??"{}";
                if(dv.trim()=="")dv="{}";

                let data=JSON.parse(dv);
                dataelement(data);
            }
            if(this.rdo_server && this.rdo_server.checked)
            {
                this.ActionElement("disabled");
                getOptionSelected(this.select_server);
            }
            else if(this.rdo_device && this.rdo_device.checked)
            {
                this.ActionElement("enabled");
                getOptionSelected(this.select_device);
            }
        },
        ActionElement(act="clean")
        {
            if(!this.row_data_prn)return "";
            let elements=this.row_data_prn.querySelectorAll("input");
            let data={};
            for (let i = 0; i < elements.length; i++) 
            {
                const element = elements[i];
                data[element.name]=element.value;
                switch(act)
                {
                    case "clean":element.value="";break;
                    case "disabled":element.disabled=true;break;
                    case "enabled":element.disabled=false;break;
                }
            }

            if(act!="get")return "";

            let prn="";
            let driver="";

            if(this.rdo_server.checked)
            {
                prn="server";
                driver=this.select_server.value;
            }
            else if(this.rdo_device.checked)
            {
                prn="device";
                driver=this.select_device.value;
            }
            
            if(prn=="")return "";

            let config_prn=
            {
                device:this.limpiarTexto(this.id_device?.value??""),
                printer:prn,
                driver:driver,
                data:data
            }

            return config_prn;
        },
        
        SaveData()
        {
            if(!this.form)return;
            let elements=this.form.elements;

            if(elements["id_device"].value.trim()=="")
            {
                alert("Debe indicar un ID del dispositivo");
                elements["id_device"].focus();
                return;
            }
            if(!this.rdo_server.checked && !this.rdo_device.checked)
            {
                alert("Debe seleccionar una forma de impresión");
                return;
            }
            if(elements["select_server"].value.trim()=="" && this.rdo_server.checked)
            {
                alert("Debe seleccionar una impresora.");
                elements["select_server"].focus();
                return;
            }
            if(elements["select_device"].value.trim()=="" && this.rdo_device.checked)
            {
                alert("Debe seleccionar un controlador.");
                elements["select_device"].focus();
                return;
            }
            let data=this.ActionElement("get");
            localStorage.setItem(model_prn.name_storage,JSON.stringify(data));

            alert("Configuración guardado correctamente.");
        },
        SetDataFromConfig()
        {
            if(!this.form)return;
            let elements=this.form.elements;

            let config=model_prn.GetConfigPrinter();
            if(!config || Object.keys(config).length < 1)return;

            if(config.data)this.SetDataFields(config.data);

            if(elements["id_device"])elements["id_device"].value=config.device;
            if(elements["select_server"] && config.printer == "server")elements["select_server"].value=config.driver;
            if(elements["select_device"] && config.printer == "device")elements["select_device"].value=config.driver;

            if(config.printer == "server")
            {
                this.rdo_server.checked=true;
                this.select_server.disabled=false;
                this.ActionElement("disabled");
            }
            else if(config.printer == "device")
            {
                this.rdo_device.checked=true;
                this.select_device.disabled=false;
                this.ActionElement("enabled");
            }

        },
        limpiarTexto(texto) 
        {
            // Reemplaza vocales con acento por vocales simples
            const acentos = 
            {
                á: "a", é: "e", í: "i", ó: "o", ú: "u",
                Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U",
                ñ: "n", Ñ: "N"
            };

            // Reemplaza caracteres raros por guiones bajos o elimina
            const textoLimpio = texto
                .split("")
                .map(char => acentos[char] || char)
                .join("")
                .replace(/[^\w\s]/gi, "") // Elimina símbolos raros
                .replace(/\s+/g, "_");    // Reemplaza espacios por guiones bajos

            return textoLimpio;
        },
        trigger(elementOrSelector,eventName)
        {
            if (!elementOrSelector || !eventName) return;

            const element = (typeof elementOrSelector === "string") ? document.querySelector(elementOrSelector) : elementOrSelector;
            if (!element) {
                console.error("Elemento no encontrado.");
                return
            }

            const event = new Event(eventName, {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }
    }
}