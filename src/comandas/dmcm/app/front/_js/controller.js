var $prodc="";
var $line="";

document.addEventListener("DOMContentLoaded",()=>
{
  controller.init();
});

var controller=
{
    pos_porcentaje_propina:0,
    decimals:2,
    ltimer:5,//intentos de conexión al imin printer
    init()
    {
      views.init();
      //cargar transacciones realizadas
      controller.tarjeta.SetOptions();
      controller.SetTotal(true);
    },
    PrinTicket(data,callbackinterval=null){model_prn.print_ticket(data,callbackinterval);},
    ResetImporte()
    {
      if(views.efectivo_importe)views.efectivo_importe.value=0;
      
      controller.SetTotal(false,true);
    },
    RoundTo(num, dec) 
    {
        var signo = (num >= 0 ? 1 : -1);
        num = num * signo;
        if (dec === 0) return signo * Math.round(num);
        num = num.toString().split('e');
        num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + dec) : dec)));
        num = num.toString().split('e');
        return signo * (num[0] + 'e' + (num[1] ? (+num[1] - dec) : -dec));
    },
    GetTotales(isefectivo=false,setpropina=false)
    {
      
      if(!views.btn_cobrar_venta)return {};

      let importe_tarjeta=0;
      for (let i = 0; i < this.tarjeta.Transactions.length; i++) 
      {
        const row = this.tarjeta.Transactions[i];
        importe_tarjeta+=row._importe??0;
      }
      if(this.tarjeta.tbl_tarjetas)
      {
        for (let i = 0; i < this.tarjeta.tbl_tarjetas.DataArray.length; i++) 
        {
          const row = this.tarjeta.tbl_tarjetas.DataArray[i];
          importe_tarjeta+=Number(row.importe??0);
        }
      }
      //propina
      let importe=this.RoundTo(Number(views.propina?.getAttribute("data-importe")??0),this.decimals);
      //asignar propina cinfugurada
      if(setpropina){this.Propina(importe,this.pos_porcentaje_propina,null,false);}
      let propina=Number(views.propina.value);//obtener la propina indicada o configurada

      let total=this.RoundTo(importe + propina,6);
      if(!isefectivo)views.efectivo_importe.value=0;      
      if((total - importe_tarjeta)>0 && !isefectivo)views.efectivo_importe.value=this.RoundTo(total - importe_tarjeta,this.decimals);
      //efectivo
      
      let efectivo=Number(views.efectivo_importe?.value??0);
      let resto=total - (efectivo + importe_tarjeta);
      
      // console.log(`total: ${total}, efectivo=${efectivo}, importe_tarjeta=${importe_tarjeta}, importe=${importe}, propina=${propina}`);

      if(resto<0)resto=0;
      
      let cambio=(importe_tarjeta + efectivo) - total;
      if(cambio < 0 || resto > 0)cambio=0;
      
      var data=
      {
        importe:importe,
        propina:propina,
        efectivo:efectivo,
        importe_tarjeta:importe_tarjeta,
        resto:resto,
        total:total,
        cambio:cambio
      }
      return data
    },
    SetTotal(setpropina=false,isefectivo=false)
    {
      if(!views.btn_cobrar_venta)return;
      let totales=this.GetTotales(isefectivo,setpropina);

      if(views.cobro_lbltotal)views.cobro_lbltotal.textContent=" $ "+views.format(totales.total,controller.decimals,".",",");
      
      if(views.cobro_lblimporte_tarjeta)views.cobro_lblimporte_tarjeta.textContent=" $ "+views.format(totales.importe_tarjeta,controller.decimals,".",",");
      // ===== Resto
      views.cobro_lblresto.textContent=" $ "+views.format(totales.resto,controller.decimals,".",",");
      views.cobro_lblresto.classList.remove("text-danger");
      if(totales.resto > 0)views.cobro_lblresto.classList.add("text-danger");

      views.cobro_lblcambio.textContent=" $ "+views.format(totales.cambio,controller.decimals,".",",");
    },
    Propina(total,percentaje,element=null,settotales=true)
    {
      if(!views.propina)return;

      views.propina.value=views.format((total * (percentaje / 100)),2,".",",");
      if(settotales)this.SetTotal();
    },
    Cobrar(venta,btn)
    {
      let totales=this.GetTotales(true);
      let efectivo_importe=totales.efectivo;

      if(totales.total <= 0)
      {
        alert("No existe un monto a cobrar");
        return;
      }

      if(totales.resto > 0 )
      {
        alert("El importe acumulado no cubre la totalidad de la venta");
        return;
      }

      let nefectivo=Number(efectivo_importe) - totales.cambio;
      if(nefectivo < 0)nefectivo=0;

      var data=
      {
        efectivo:nefectivo,
        venta:venta,
        propina:Number(views.propina.value),
        totales:totales,
        cambio:totales.cambio
      };
      
      if(controller.tarjeta.tbl_tarjetas)data["data_array"]=controller.tarjeta.tbl_tarjetas.DataArray;

      views.toggle(document.body);

      btn.classList.add("disabled");
      var uri=url+"pos/dinner/cobrar/?access=true";
      model.invoke_service(uri,data,
      function(data)
      {
        controller.PrinTicket(data,()=>{views.toggle(document.body,true);});
      }
      ,function(error)
      {
        views.toggle(document.body,true);
        btn.classList.remove("disabled");
        alert(error.message);
      }
      ,"POST",false);
    },
    SetTipoCambioByDivisa()
    {
        if(!views.tcambio || !views.divisa)return;

        if(views.divisa.hasAttribute("data-array"))
        {
          let array=JSON.parse(views.divisa.getAttribute("data-array")) ;
          let _row=array.find(r=>r.sys_pk==views.divisa.value);
          views.tcambio.value=_row.tcambio??1;
        }
    },
    tarjeta:
    {
      time_get_status:3000,
      Transactions:[],
      CallBackSuccesStatusTrans:null,
      tbl_tarjetas:null,
      Action(_data)
      {
        views.tajeta_logs.textContent="";
        views.toggle(views.pay_container_main);
        var uri="/terminal/";

        model.invoke_service(uri,_data,
        function(data)
        {
          let error="";
          if(data.error)error=data.error;
          if(data.db_error)error+=`\n\n\n`+data.db_error;
          
          if(error.trim()!="")
          {
            if(!views.tajeta_logs)alert(error);
            else views.tajeta_logs.textContent=error;
          }
          
          if(!data.trans_id)views.toggle(views.pay_container_main,true);
          else 
          {
            setTimeout(() => 
            {
              controller.tarjeta.Status(data.trans_id);
            }, controller.tarjeta.time_get_status);
          }
        }
        ,function(error)
        {
          views.toggle(views.pay_container_main,true);
          alert(error.message);
        }
        ,"POST",false);
      },
      cobrar()
      {
        this.CallBackSuccesStatusTrans=(data,trans_id)=>
        {
          controller.tarjeta.SetRow(data,trans_id)
          controller.tarjeta.SetOptions();
          controller.SetTotal();
        }
        let totales=controller.GetTotales(true);

        let importe=Number(views.tarjeta_importe?.value??0);
        
        if(totales.total <= 0)
        {
          alert("No existe un monto a cobrar");
          return;
        }

        if(importe<0.1)
        {
          alert("Debe indicar un importe mayor");
          views.tarjeta_importe.focus();
          return;
        }

        if((totales.importe_tarjeta + importe) > totales.total) 
        {
          alert("El importe acumulado sobrepasa el importe del Ticket");
          views.tarjeta_importe.focus();
          return;
        }
        
        var data=
        {
          caller:controller.caller ??"",
          transaction:controller.transaction??"",
          traceid:controller.guid(),
          followid:controller.guid(),
          amount:importe,
          action:"sale"
        };

        this.Action(data);
      },
      Cancelar()
      {
        let opt=this.obtenerSeleccion();
        if(opt.length<1)
        {
          alert("Debe seleccionar una transacción");
          return;
        }
        
        if(!confirm("¿Está seguro de cancelar la transacción seleccionada? (introduzca la misma tarjeta en la terminal)."))return;

        let _opt_select=opt[0];
        if(!_opt_select)return;
        
        let trans_id=_opt_select.getAttribute("data-row");
        if(!trans_id)
        {
          alert("No se logró obtener el id de transacción");
          return;
        }
        
        this.CallBackSuccesStatusTrans=(data,_trans_id)=>
        {
          controller.tarjeta.DeleteTransaction(trans_id);
          _opt_select.remove();
          controller.SetTotal();
        }

        var data=
        {
          caller:controller.caller ??"",
          transaction:controller.transaction??"",
          transid:trans_id,
          action:"cancel"
        };

        this.Action(data);
      },
      Devolver()
      {
        alert("No implementado");
      },
      Status(trans_id)
      {
        var data=
        {
          caller:controller.caller ??"",
          transid:trans_id,
          action:"status"
        };

        // views.tajeta_logs.textContent="";
        views.toggle(views.pay_container_main);
        var uri="/terminal/trace/";
        
        model.invoke_service(uri,data,
        function(data)
        {
          let message="";
          if(data.error)
          {
            message=data.error+"\n";
            controller.tarjeta.SetLog(data.error);
          }
          if(data.db_error)
          {
            message+=data.db_error+"\n";
            controller.tarjeta.SetLog(data.db_error);
          }
          if(data.message)
          {
            message+=data.message+"\n";
            controller.tarjeta.SetLog(data.message);
          }
          
          if(message.trim()!=""){if(!views.tajeta_logs)alert(message);}
          
          //si el servicio retorna el token de la transaccion, realizar otroa pétición del estado del token
          if(data.token && data.token.trim()!="")
          {
            setTimeout(() => 
            {
              controller.tarjeta.Status(data.token);
            }, controller.tarjeta.time_get_status);

            return;
          }
          //si todo fue correcto
          if(data.success && controller.ParseBool(data.success))
          {
            if(data.message)alert(data.message);
            
            if(controller.tarjeta.CallBackSuccesStatusTrans)controller.tarjeta.CallBackSuccesStatusTrans(data,trans_id);
            
            views.toggle(views.pay_container_main,true);
          }
          //si la transacción aun no se ha completado
          else if(data.success==undefined || data.success==null)
          {
            setTimeout(() => 
            {
              controller.tarjeta.Status(trans_id);
            }, controller.tarjeta.time_get_status);
          }
          //si la transacción fue cancelado desde la terminal
          else if(!controller.ParseBool(data.success??false))
          {
            if(data.message)alert(data.message);
            views.toggle(views.pay_container_main,true);
          }
          else
          {
            views.toggle(views.pay_container_main,true);
          }
        }
        ,function(error)
        {
          views.toggle(views.pay_container_main,true);
          alert(error.message);
        }
        ,"POST",false);
      },
      SetRow(data,transid)
      {
        let row=this.Transactions.find(r=>r.transid==transid);
        if(row)return;

        this.Transactions.push(data);
      },
      DeleteTransaction(trans_id)
      {
        for (let i = 0; i < this.Transactions.length; i++) 
        {
          const row = this.Transactions[i];
          let transid=(row.transid??row.trans_id);
          if(!transid) continue;

          if(transid==trans_id)this.Transactions.splice(i,1);
        }
      },
      SetOptions()
      {
        if(!views.tarjeta_transacciones)return;

        views.tarjeta_transacciones.value="";
        views.tarjeta_transacciones.innerHTML="";

        let options="";
        for (let i = 0; i < this.Transactions.length; i++) 
        {
          const row = this.Transactions[i];
          this.SetValueDefault(row);
          options+=`<option data-row="${row.transid??row.trans_id}">$ ${views.format(row._importe,2,".",",")} |${row._divisa}|${row._tipo}|${row._numaut}|${row._cvv}|${row._cardname} </option>`;
        }
        views.tarjeta_transacciones.innerHTML=options;
      },
      SetLog(msg)
      {
        if(!views.tajeta_logs)return;
        views.tajeta_logs.textContent+=msg+"\n";

        views.tajeta_logs.scrollTop =views.tajeta_logs.scrollHeight
      },
      SetValueDefault(row)
      {
        if(!controller.tarjeta.config)return;
        if(row.Amount)row._importe=row.Amount;

        if(row.CurrencyDescription)
        {
          switch (row.CurrencyDescription??"") 
          {
            case "MEX":
              row._divisa=controller.tarjeta.config.divisa_mxn;
              break;
            case "USD":
              row._divisa=controller.tarjeta.config.divisa_usd;
              break;
            default:
              row._divisa=row.CurrencyDescription
              break;
          }
        }

        if(row.CardTypeDescription)row._tipo=(row.CardTypeDescription ??"");
        if(row.AuthCode)row._numaut=(row.AuthCode??"");
        if(row.AuthCode)row._cvv=(row.AuthCode??"");
        if(row.CardNumber)row._cardnumber=(row.CardNumber??"");
        if(row.CardAppName)row._cardname=(row.CardAppName??"");
      },
      obtenerSeleccion() 
      {
        const select = views.tarjeta_transacciones;
        const seleccionados = [];

        for (let opcion of select.options) 
        {
          if (opcion.selected) {seleccionados.push(opcion);}
        }

        return seleccionados;
      },
      AddTarjeta()
      {
        let container=document.getElementById("container_tarjeta");
        this.tbl_tarjetas=document.getElementById("tbl_tarjetas");
        if(!container || !this.tbl_tarjetas)return;
        
        if(!container.reportValidity())return;

        let row={};
        for (let i = 0; i < container.elements.length; i++) 
        {
          const element = container.elements[i];
          if(element.hasAttribute("data-array"))
          {
            let array=JSON.parse(element.getAttribute("data-array")) ;
            let _row=array.find(r=>r.sys_pk==element.value);
            row[`f${element.name}`]=_row.descripcion??"";
          }

          row[element.name]=element.value;
        }
        
        if(this.CurrentIndex>-1)this.tbl_tarjetas.DataArray[this.CurrentIndex]=row;
        else this.tbl_tarjetas.DataArray.push(row);

        this.tbl_tarjetas._printRows();
        
        controller.hideModal("modal_tarjeta");
        controller.SetTotal();
      },
      CurrentIndex:-1,
      EditTarjeta()
      {
        if(!this.tbl_tarjetas)
        {
          alert("Debe agregar una tarjeta");
          return;
        }

        let index=this.tbl_tarjetas.CurrentRowIndex();
        if(index < 0)
        {
          alert("Debe seleccionar un elemento de la tabla");
          return;
        }
        let row=this.tbl_tarjetas.DataArray[index];
        for(let key in row)
        {
          let element=document.getElementsByName(key)?.[0];
          if(!element)continue;

          element.value=row[key];
        }
        controller.showModal("modal_tarjeta");
        this.CurrentIndex=index;
        controller.SetTotal();
      },
      DeleteTarjeta()
      {
        if(!this.tbl_tarjetas)
        {
          alert("Debe agregar una tarjeta");
          return;
        }

        let index=this.tbl_tarjetas.CurrentRowIndex();
        if(index < 0)
        {
          alert("Debe seleccionar un elemento de la tabla");
          return;
        }
        this.tbl_tarjetas.DeleteRow(index);
        controller.SetTotal();
      }
    },
    corte:
    {
      GetImportes()
      {
        let efectivo_caja =Number(views.efectivo_caja.value??0);
        let retiro_corte =Number(views.retiro_corte.value??0);
        let importe_sig_turno =efectivo_caja - retiro_corte;
        
        let data=
        {
          efectivo_caja:efectivo_caja,
          retiro_corte:retiro_corte,
          importe_sig_turno:importe_sig_turno
        };

        return data;
      },
      setSigTurno()
      {
        let dataimportes=this.GetImportes();
        let importe_sig_turno =dataimportes.importe_sig_turno;

        views.importe_sig_turno.value=0;

        if(importe_sig_turno >= 0)views.importe_sig_turno.value=importe_sig_turno;
      },
      corte_caja()
      {
        var uri=url+"pos/dinner/corte/?access=true";
        var data=this.GetImportes();
        
        if(data.efectivo_caja<=0)
        {
          alert("El campo 'efectivo en caja' debe ser mayor a 0");
          return;
        }
        if(data.importe_sig_turno < 0)
        {
          alert("El campo 'Fondo siguiente turno' debe ser mayor igual a 0 ");
          return;
        }

        views.btn_corte_caja.classList.add("disabled");
        model.invoke_service(uri,data,
        function(data)
        {
          model_prn.print_arqueo(data,(_data)=>{window.location.href="/comandas/?view=login";}); 
        }
        ,function(error)
        {
          views.btn_corte_caja.classList.remove("disabled");
          alert(error.message);
        }
        ,"POST",false);
      }
    },
    Arqueo()
    {
      let uri=url+`pos/dinner/arqueo/?access=true`;

      model.invoke_service(uri,{},
        (data)=>
        {
          model_prn.print_arqueo(data);
        }
        ,(error)=>
        {
          alert(error.message);
        }
        ,"POST",false);
    },
    ParseBool(v) 
    {
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return (v != 0);
        if (typeof v === "string") {
            return ["true","1","yes","y","si","sí","s","ok","on","v","verdadero","verdad","correcto","cierto","positivo","+"].includes(v.trim().toLowerCase());
        }

        return false
    },
    OptionsShow(select,_tipo=0)
    {
      for (const option of select.options) 
      {
        let tipo=option.getAttribute("tipo");
        if(!tipo)tipo=option.value;

        if (tipo!=_tipo) option.style.display = 'none';
        else option.style.display = '';
      }
    },
    _movimiento:0,
    Movimiento(mov=1)
    {
      let categoria=document.getElementById("categoria");
      let modal_ingreso_egreso_title=document.getElementById("modal_ingreso_egreso_title");
      let frm_ingreso_egreso=document.getElementById("frm_ingreso_egreso");
      frm_ingreso_egreso.reset();

      if(frm_ingreso_egreso.elements["referencia"])frm_ingreso_egreso.elements["referencia"].value=this.Cut(this.guid(),16).toLocaleUpperCase();

      modal_ingreso_egreso_title.textContent="INGRESO";
      if(frm_ingreso_egreso.elements["descripcion"])frm_ingreso_egreso.elements["descripcion"].value="INGRESO DE CAJA";
      if(mov==2)//egreso
      {
        this.OptionsShow(categoria,2);
        modal_ingreso_egreso_title.textContent="EGRESO";
        if(frm_ingreso_egreso.elements["descripcion"])frm_ingreso_egreso.elements["descripcion"].value="EGRESO DE CAJA";
      }
      else{this.OptionsShow(categoria,1);}

      this._movimiento=mov;
      this.showModal("modal_ingreso_egreso");
    },
    ProcessMovimiento()
    {
      let frm_ingreso_egreso=document.getElementById("frm_ingreso_egreso");
      if(!frm_ingreso_egreso || !frm_ingreso_egreso.reportValidity())return;
      if(this._movimiento!=1 && this._movimiento!=2)
      {
        alert("No ha indicado el tipo de movimiento");
        return;
      }

      var data={};
      for (let i = 0; i < frm_ingreso_egreso.elements.length; i++) 
      {
        const element = frm_ingreso_egreso.elements[i];
        if(!element)continue;
        data[element.name]=element.value;
      }
      
      let uri=url+`pos/dinner/${this._movimiento==1 ? "ingreso":"egreso"}/?access=true`;

      model.invoke_service(uri,data,
        (data)=>
        {
          this.hideModal("modal_ingreso_egreso");
          
          if(this._movimiento==1 && data.printer)model_prn.print_ingreso(data.printer);
          else if(data.printer)model_prn.print_egreso(data.printer);
        }
        ,(error)=>
        {
          alert(error.message);
        }
        ,"POST",false);
    },
    getUbicaciones()
    {
        var uri=url+"pos/dinner/ubicacion/?access=true";
        model.invoke_service(uri,null,
        function(data)
        {
          views.createUbicacion(data);
          controller.GetDataByUbicacion("waiter");
        }
        ,function(error){alert(error.message);}
        ,"GET",false);
    },
    GetDataByUbicacion(meseroorcajero,ubicacion="*")
    {
      if(meseroorcajero=="waiter")
        controller.get_waiters("selectwaiter",ubicacion);
      else 
      {
        controller.GetCajeros(ubicacion);
        controller.GetCajas(ubicacion);
      }
    },
    GetCajeros(ubicacion="*",idselect="#selectcajero")
    {
      var uri=url+"pos/dinner/cajeros/?access=true&ub="+ubicacion;
      model.invoke_service(uri,null,
      function(data)
      {
        views.LoadSelect(data,idselect);
      }
      ,function(error){alert(error.message);}
      ,"GET",false);
    },
    GetCajas(ubicacion="*",idselect="#selectcaja")
    {
      var uri=url+"pos/dinner/cajas/?access=true&ub="+ubicacion;
      model.invoke_service(uri,null,
      function(data)
      {
        views.LoadSelect(data,idselect);
      }
      ,function(error){alert(error.message);}
      ,"GET",false);
    },
    get_tables:function() 
    {
      let cuentas=document.getElementById("cuentas");
      var uri=`${url}pos/dinner/tables/?waiter=${waiter_key}&cc=${$cc}&zone=${zone}&cuentas=${cuentas?.value??""}`;
      model.invoke_service(uri,null,function(data) 
      {
        views.print_mesas(data);
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    ismobile:function()
    {
      if (window.innerWidth<=1000){return true;}
      else {return false;}
    },
    resfresh_tables:function()
    {
      event.show_loading();
      controller.get_tables();
      //Sale al modelo para obtener datos e inyectarlos a la vista correspondiente
    },
    verify_size_window:function(id_table,code="",cuantity=2,e=null)
    {
      if(e)
        views.select_table(e);
      
      if(id_table<=0)
      {
        var mesa=document.querySelector("#txttable");
        var num_people=document.querySelector("#txtnumpeople");
        num_people.value=cuantity;
        mesa.value=code;
        this.show_modal("#open-table");
        mesa.focus();
        return;
      }

      if(this.ismobile())
      {
        var params=`&idt=${id_table}`;
        if(token!="")
          params+="&dmtm_token="+token;
        if(ws!="")
          params+="&dm_scr="+ws;
        window.location.href=`./?view=vw_infocuenta${params}`;
        return;
      }
      views.ActiveAnimation(true);
      controller.get_table(id_table,e=null);
    },
    get_table:function(id_table)
    {
      var uri=`${url}pos/dinner/tables/${id_table}/`;
      model.invoke_service(uri,null,function(data) 
      {
        views.print_ordenes(data);
        views.PaindItem(data);
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    show_modal:function(id)
    {
      var modal=document.querySelector(id);
      modal.classList.remove("hidde_control");
    },
    hide_modal:function(id)
    {
      var modal=document.querySelector(id);//"#open-table"
      var mesa=document.querySelector("#txttable");
      var notas=document.querySelector("#txtnotas");
      var num_people=document.querySelector("#txtnumpeople");
      mesa.value="";
      num_people.value="2";
      notas.value="";
      modal.classList.add("hidde_control");
    },
    showModal:function(idmodal)
    {
      this.getBSModal(idmodal).show();
    },
    hideModal:function(idmodal)
    {
      this.getBSModal(idmodal).hide();
    },
    getBSModal(modalId)
    {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.log("Elemento no definido");
            return;
        }
        
        let bsModal = bootstrap.Modal.getInstance(modalElement);
        if (!bsModal) bsModal = new bootstrap.Modal(modalElement);

        return bsModal;
    },
    close_view:function(idview,params="",_confirm=false,text="¿Esta seguro de querer salir de la aplicación?")
    {
      if(_confirm && !confirm(text))return;

      if(idview=="login")
      {
        var uri=`${url}pos/dinner/token/?token=${token}`;
        model.invoke_service(uri,null,function(data) 
        {
          token="";
        },
        function(error) {
          alert(error.message);
        },"PUT",false);
      }
      if(token!="")
        params+="&dmtm_token="+token;
      if(ws!="" && idview!="vw_workspace")
        params+="&dm_scr="+ws;

      window.location.href="./?view="+idview+params;
    },
    root_path:"/comandas",
    open_view:function(idview,params="")
    {
      if(token!="")
        params+="&dmtm_token="+token;
      if(ws!="")
        params+="&dm_scr="+ws;
      window.location.href=this.root_path+"/?view="+idview+params;
    },
    show_select_group:function()
    {
      event.show_select();
    },
    open_table:function()
    {
      var uri=`${url}pos/dinner/tables/`;
      var mesa=document.querySelector("#txttable");
      var notas=document.querySelector("#txtnotas");
      var num_people=document.querySelector("#txtnumpeople");
      if(mesa.value=="")
      {
        alert("Debe indicar un número de mesa.");
        mesa.focus();
        return;
      }
      if(Number(num_people.value)<1)
      {
        alert("Debe indicar un número de personas.");
        num_people.focus();
        return;
      }
      var data={
        table:mesa.value,
        notes:notas.value,
        num_people:num_people.value,
        waiter:waiter_key,//"#<@@(@waiter,'key')>",
        cliente:"#<@code_publico_general>",
        cc:$cc,//"#<@@(@waiter,'cc')>",
        format:"#<@cadenaformato>"
      }
      model.invoke_service(uri,data,function(data) {
        controller.new_command(data.sys_guid,data.sys_pk,data.code,data.reference,views.format(data.balance,2,".",","));
        controller.get_tables();
        controller.hide_modal("#open-table");
        mesa.value="";
        num_people.value="2";
        notas.value="";
      },
      function(error) {
        alert(error.message);
      },"POST",false);
    },
    new_command:function(sys_guid,sys_pk="",name="",ticket="",balance="",line="",sku="")
    {
      var params="&desk=true&idtable="+sys_guid;
      if(this.ismobile())
      {
        var params="&desk=false&idtable="+sys_guid;
      }
      if(sys_pk!="")
        params+="&idt="+sys_pk
      if(name!="")
        params+="&n="+name;
      if(ticket!="")
        params+="&t="+ticket;
      if(balance!="")
        params+="&imp="+balance;
      if(line!="")
        params+="&line="+line;
      if(sku!="")
        params+="&sku="+sku;
      // if(token!="")
      //   params+="&dmtm_token="+token;
      this.open_view("newcommand",params);
    },
    
    reopen_table:function(id_table)
    {
      var uri=`${url}pos/dinner/tables/${id_table}`;
      var data={action:"open"}
      model.invoke_service(uri,data,function(data) 
      {
        views.print_ordenes(data);
        views.PaindItem(data);
      },
      function(error) 
      {
        alert(error.message);
      },"PATCH",false);

    },
    close_table:function(id_table,url_redir="")
    {
      var uri=`${url}pos/dinner/tables/${id_table}`;
      var data={action:"close"}

      model.invoke_service(uri,data,function(data) 
      {
        if(url_redir)
        {
          window.location.href=url_redir;
          return;
        }
        views.print_ordenes(data);
        views.PaindItem(data);
        controller.PrinTicket(data.printer);
      },
      function(error) 
      {
        alert(error.message);
      },"PATCH",false);
    },
    back:function()
    {
      controller.get_lines();
      var barra=document.querySelector(".barr-atr");
      barra.style.display="none";
    },
    foodbev:function(elem,prodc="",line="",linedescrition="",sku="")
    {
      if(prodc!="")$prodc=prodc;
      if(line!="")$line=line;
      if(prodc=="" && line=="")
      {
        $prodc="";
        $line="";
      }
      
      var uri=`${url}pos/dinner/foodbev/?prodc=${$prodc}&line=${$line}&cc=${$cc}&idt=${controller.getData?.idt??0}`;
      model.invoke_service(uri,null,function(data) 
      {
        views.Print_Indicaciones(data.line);
        views.print_foodbev(data.foodbev,data.line.description);
        var food=document.querySelector("#foodbev_"+sku);
        if(food)food.click();
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    send_data_orders:function()
    {
      if(list_orders.length < 1)
      {
        alert("Debe agregar por lo menos una orden");
        return;
      }

      var amount=0;
      for(var i=0;i<list_orders.length;i++)
      {
        var itm=list_orders[i];
        amount+=Number(itm.price);
      }
      var data=
      {
        waiter:waiter_key,
        cc:$cc,
        amount:amount,
        details:list_orders
      }
      var uri=`${url}pos/dinner/tables/${idtable}/`;
      model.invoke_service(uri,data,function(data) 
      {
        var view=view_first;
        var id_table=data.sys_pk;

        if(data.servicio)
        {
          if(data.servicio=="FF" || data.servicio=="DS")view="cobrar";
        }
        //se comento para que despues de comandar se redirija a la vista de las mesas cuando sea en movil
        // if(controller.ismobile())
        // {
        //   view=view_second;
        //   var currenttotal=document.querySelector("#totalcurrent");
        //   var namem=document.querySelector("#name_m");
        //   var ticket=document.querySelector("#name_ticket");
        //   var params="&idt="+data.sys_pk;
        //   controller.open_view(view,params);
        //   return;
        // }
        controller.open_view(view,"&idt="+data.sys_pk);
      },
      function(error) {
        alert(error.message);
      },"POST",false);
      
    },
    
    get_prodc:function(idcc="")
    {
      var uri=`${url}pos/dinner/prodc/?cc=${idcc}`;
      model.invoke_service(uri,null,function(data) {
        views.print_prodc(data);
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    get_lines:function(prodc="")
    {
      var uri=`${url}pos/dinner/fblines/?prodc=${prodc}`;
      model.invoke_service(uri,null,function(data) {
        views.print_lines(data);
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    get_adds_dmns:function()
    {
      var uri=`${url}pos/dinner/foodbev-adds/`;
      model.invoke_service(uri,null,function(data) {
        list_adds_dmns=data;
      },
      function(error) {
        alert(error.message);
      },"GET",false);
    },
    data_foodbev:function(sys_pk,other=false)
    {
      // var uri=`${url}pos/dinner/prodc/?_key=${sys_pk}`;
      // model.invoke_service(uri,null,function(data) {
      //   views.add_foodbev(data)
      // },
      // function(error) {
      //   alert(error.message);
      // },"GET",false);
      views.add_foodbev(sys_pk,other);
    },
    other_equals:function(uuid,sys_pk)
    {
      for (var i =0; i<list_orders.length; i++) {
        var list_ordr=list_orders[i];
        var sku=list_ordr.sku;
        if(sku.sys_pk===sys_pk)
        {
          var newsku =list_ordr;
          var data=JSON.stringify(newsku);
          var newdata=JSON.parse(data);
          var uuid_ant=newdata.uuid;
          newdata.uuid=uuid;
          newdata.price=sku.price;
          var newoptions=newdata.sku;
          list_orders.push(newdata);
          controller.show_modal('#modal-indicaciones');
            views.show_indications(newoptions.options,uuid,uuid_ant);
          break;
        }
      }
      
    },
    quit:function(id)
    {
      list_orders.forEach(function(elem,index) {
        if(id===elem.uuid)
        {
          list_orders.splice(index,1);
          return false;
        }
      });
      var elem=document.querySelector(`.list-products-li > [id="${id}"]`);
      elem.remove();
      views.counter();
      views.showTotal();
    },
    indicatios:function(item,uuid)
    {
      controller.show_modal('#modal-indicaciones');
      views.show_indications(item.options,uuid);
    },
    lifetime:function(time)
    {
      switch(Number(time))
      {
        case 1:
          return "1er.";
          break;
        case 2:
          return "2do.";
          break;
        case 3:
          return "3er.";
          break;
        case 4:
          return "4to.";
          break;
        case 5:
          return "5to.";
          break;
      }
    },
    escape_selector:function(selector) {
      // buscar y escapar los caracteres especiales que son válidos en un selector CSS, y garantizar que sea tratada correctamente por `querySelector`.
      return selector.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
    },
    add_indications:function(id)
    {
      for(var s=0;s<list_requireds.length;s++)
      {
        var req=list_requireds[s];
        var reqname = this.escape_selector(req.name.replace(/ /g,""));
        var selet_req=document.querySelector(`#single_${reqname}_`);
        if(selet_req)
          if(selet_req.value=="")
          {
            alert(`El campo ${req.name} es requerido.`);
            return;
          }
      }
      var notas=document.querySelector("#txtnotas-indicacion");
      var detail_indications=document.querySelector(`#detail-indications_${id}`);
      var time=document.querySelector(".hover-btn");
      var text_detail="";
      list_orders.forEach(function(elem,index) {
        var data=elem.sku;
        if(id===elem.uuid)
        {
          var values=[];
          for (var i = 0; i < data.options.length; i++) {
            var opt=data.options[i];
            var vals=controller.get_indications(opt.name,opt.type=="multiple");
            
            if(vals!=null)
            {
              vals.values.forEach(function(e,i){
                text_detail+=e.text+",";
              });
              values.push(vals);
            }
          }
          var price=0;
          for (var j = 0; j <values.length; j++) {
            var value=values[j];
            if(value.name==="adds")
            {
              var itm=value.values;
              for(a=0;a<itm.length;a++)
              {
                var val=itm[a];
                price+=Number(val.amount);
              }
              
            }
          }
      
          
          var subtotal=Number(list_orders[index]._priceProd_) + price;
          

          list_orders[index].price=subtotal;
          list_orders[index]["adds"]=price;
          list_orders[index]["total"]=list_orders[index].price + list_orders[index].adds;
          list_orders[index]["options"]=values;
          list_orders[index]["notes"]=notas.value;
          text_detail+=notas.value+",";

          

          views.showSubTotal(id,subtotal);

          if(time){ 
            list_orders[index]["time"]=time.getAttribute("value");
          }
          return false;
        }
      });
      notas.value="";
      controller.hide_modal('#modal-indicaciones');
      views.add_details(time,text_detail,detail_indications);
      views.showTotal();

    },
    get_indications:function(name,ismultiple)
    {
      var reqname = this.escape_selector(name.replace(/ /g,""));
      
      if(ismultiple) {
        var indications=document.querySelectorAll(`.div-multiple > .div-check_${reqname} > input`);
      }
      else {
        var indications=document.querySelectorAll(`.body-single > .div-single_${reqname} > select`);
      }

      var values=[];
      indications.forEach(function (elem,index) {
        if(elem.type==="checkbox")
        {
          if(elem.checked )
          {
            if(ismultiple && name===name_addcs)
            {
              var d={
                text:elem.value,
                sku:elem.getAttribute("sku"),
                amount:Number(elem.getAttribute("amount"))
              };
            }else
              var d={
                text:elem.value,
                sku:"",
                amount:0
              };
            values.push(d);
            // elem.checked=false;
          }
        }
        else 
        {
          if(elem.options.selectedIndex>0)
          {
            var val=elem.options[elem.options.selectedIndex].value;
            var d={text:val};
            values.push(d);
            // elem.options.selectedIndex=0;
          }
        }
      });
      if(name===name_addcs)
      {
        name="adds";
      }
      var data_indications={
          name:name,
          values:values
        }
      if(values.length>0)
        return data_indications;
      else
        return null;
    },
    addmore:function(data,linea,sku)
    {
      controller.new_command(data.sys_guid,data.sys_pk,data.code,data.reference,data.balance,linea,sku);
    },
    quit_prod:function(idt,sku,pkproducto,pkdorden)
    {
      var rs=confirm("¿Esta seguro que desea eliminar el elemento seleccionado?");
      if(!rs)
        return;

      var data={
        sku:sku,
        pkdorden:pkdorden,
        producto:pkproducto,
        action:"uptorder"
      }
      // console.log(data)
      // return;
      var uri=`${url}pos/dinner/foodbev/${idt}/`;
      model.invoke_service(uri,data,function(data) {
        views.print_ordenes(data);
      },
      function(error) {
        alert(error.message);
      },"PATCH",false);
    },
    time:function(e)
    {
      var time=document.querySelector(`#${e.id}`);
      var times=document.querySelectorAll("#times > button");
      
      times.forEach(function(elem,i)
      {
        if(elem.classList.contains("hover-btn"))
        {
          elem.classList.remove("hover-btn");
        }
      });

      time.classList.add("hover-btn");
    },
    isrequired:function(options)
    {
      for (var j = 0; j<options.length; j++) {
        var option=options[j];
        if(option.required)
        {
          return true;
        }
      }
      return false;
    },
    reprint:function(id_table)
    {
      var uri=`${url}pos/dinner/tables/${id_table}`;
      var data={action:"reprint"}
      model.invoke_service(uri,data,function(data) 
      {
        controller.PrinTicket(data,(_data)=>
        {
          if(!_data.success)window.location.reload();
        });
      },
      function(error) {
        alert(error.message);
      },"PATCH",false);
    },
    gettoken:function(token)
    {
        var uri=`${url}pos/dinner/token/`;
        var data={token:token}
      model.invoke_service(uri,data,function(data) 
      {
        $cc=data.json.cc;
        waiter_key=data.json.key;
        caption=data.json.caption;
        zone=data.json.zone;

        views.DeleteElementsCashier((!data.json.idcajero || data.json.idcajero.trim()==""));

        views.print_caption_waiter("caption-waiter",caption);
      },
      function(error) 
      {
        window.location.href="./?view=&dm_scr="+ws;
        alert(error.message);
      },"POST",false,false);
    },
    get_waiters:function (selectwaiter="",ubicacion="*") 
    {
      var uri=url+"pos/dinner/waiters/?ub="+ubicacion;
      if(selectwaiter!=""){uri+="&access=true"}
      model.invoke_service(uri,null,
        function(data)
        {
          list_waiters=data;
          if(selectwaiter!="")
          {
            views.select_waiter(selectwaiter,data);
          }else{views.list_waiters(data);}
          
        }
        ,function(error){alert(error.message);}
        ,"GET",false);
    },
    AccessConfig(user,pwd,element=null,{url_redir="",callback=null,action=""})
    {
      var uri=url+"pos/dinner/acces-config/?access=true";
      var data=
      {
        user:user,
        pwd:pwd,
        sitem:action
      }
      
      if(element)element.classList.add("disabled");
      model.invoke_service(uri,data,
      function(data)
      {
        if(element)element.classList.remove("disabled");
        if(callback)callback(data);
        if(url_redir)window.location.href=url_redir;
      }
      ,function(error)
      {
        alert(error.message);
        if(element)element.classList.remove("disabled");
      }
      ,"POST",false);
    },
    login:function(e)
    {
      var data={}

      if(views.rdomesero.checked)
      {data=views.GetFieldsContainer("container-mesero");
      }
      else data=views.GetFieldsContainer("container-cajero");
      
      var waiter=document.querySelector("#selectwaiter");
      var pwd=document.querySelector("#pwdlogin");
      var btn=document.querySelector("#"+e.id);

      var uri=url+"pos/dinner/waiters/login/";

      btn.classList.add("disabled");
      model.invoke_service(uri,data,
        function(data)
        {
          btn.classList.remove("disabled");
          if(data==null)
          {
            alert("Usuario o contraseña incorrecta.");
            return;
          }
          token="";
          if(controller.url_redir && controller.url_redir.trim()!="")
          {
            window.location.href=controller.url_redir.replace("@dmtm_token",data.token);
            return;
          }
          controller.open_view("vw_principal",`&dmtm_token=${data.token}`);
          //window.location.href=`/?view=vw_principal&dmtm_token=${data.token}`;
        }
        ,function(error)
        {
          alert(error.message);
          btn.classList.remove("disabled");
        }
        ,"POST",false);
    },
    workspace:function()
    {
      var ws=document.querySelector("#idws");
      if(ws.value=="")
      {
        alert("El id del workspace es requerido.");
        return;
      }
      var params=`&dm_scr=${ws.value}`;
      controller.open_view("vw_principal",params)
    },
    guid:function(){
      //guid con - //[1e7]+-1e3+-4e3+-8e3+-1e11
      //guid sin - //[1e7]+1e3+4e3+8e3+1e11
      return ([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    Cut(text,length)
    {
      if (text.length < length) return text;
      return text. substring(0,length);
    },
    showDialogDS()
    {
      views.showDialogDS();
    },
    fastFoot()
    {
      var uri=`${url}pos/dinner/tables/?fastfoot=1`;
      var data=
      {
        table:"",
        notes:"",
        num_people:1,
        waiter:waiter_key,//"#<@@(@waiter,'key')>",
        cliente:"#<@code_publico_general>",
        cc:$cc,//"#<@@(@waiter,'cc')>",
        format:"#<@cadenaformato>"
      }
      model.invoke_service(uri,data,function(data) 
      {
        controller.new_command(data.sys_guid,data.sys_pk,data.code,data.reference,views.format(data.balance,2,".",","));
      },
      function(error) {
        alert(error.message);
      },"POST",false);
    },
    homeDelivery()
    {
      var uri=`${url}pos/dinner/tables/?homedelivery=1`;
      var data=views.getDataForm();

      if(!data)return;
      
      data["num_people"]=1;
      data["waiter"]=waiter_key;
      data["cliente"]="#<@code_publico_general>";
      data["cc"]=$cc;
      data["format"]="#<@cadenaformato>";

      model.invoke_service(uri,data,function(data) 
      {
        controller.new_command(data.sys_guid,data.sys_pk,data.code,data.reference,views.format(data.balance,2,".",","));
      },
      function(error) 
      {
        alert(error.message);
      },"POST",false);
    },
    cancelAccount(id_table)
    {
      if(!confirm("¿Está de realizar el proceso?"))return;

      var uri=`${url}pos/dinner/tables/${id_table}/`;
      var data={action:"cancel"}

      model.invoke_service(uri,data,function(data) 
      {
        views.clear_detalle();
        controller.resfresh_tables();
      },
      function(error) 
      {
        alert(error.message);
      },"PATCH",false);
    },
    cortesia(id_table)
    {
      var uri=`${url}pos/dinner/tables/${id_table}/`;

      let percentaje_cortesia=document.getElementById("percentaje_cortesia");

      var data=
      {
        action:"cortesia",
        percentaje_cortesia:Number(percentaje_cortesia.value??0)
      }

      views.ActiveAnimation(true);

      model.invoke_service(uri,data,function(data) 
      {
        percentaje_cortesia.value=0;
        controller.hide_modal("#modal-cortesia");

        if(data.reference) //si existe fue cubierta en su totalidd
        {
          controller.PrinTicket(data);
          views.clear_detalle();
          controller.resfresh_tables();
        }
        else
        {
          controller.get_table(id_table);
        }
        
        views.ActiveAnimation(false);
      },
      function(error) 
      {
        alert(error.message);
        views.ActiveAnimation(false);
      },"PATCH",false);
    },
    actionAccount(id_table, action, id_form="", okmsg=true)
    {
      var uri=`${url}pos/dinner/tables/${id_table}/`;

      if(id_form)
      {
        var data=views.getDataForm(id_form);
        if(!data)return;

        data["action"]=action;
      }
      else
      {
        var data={action:action}
      }
      if(okmsg && !confirm("¿Está seguro de realizar el proceso?"))return;

      views.ActiveAnimation(true);

      model.invoke_service(uri,data,function(data) 
      {
        views.clear_detalle();
        controller.get_table(id_table);
        
        if(action=="enviar" || action=="change-dealer")controller.hide_modal("#modal-select-repartidor");
        
        views.ActiveAnimation(false);
      },
      function(error) 
      {
        alert(error.message);
        views.ActiveAnimation(false);
      },"PATCH",false);
    },
    async validarExistencia(producto)
    {
      let reserved=list_orders.filter(f=> f.sku.sys_pk == Number(producto)).length;
      var uri=`${url}pos/dinner/validate_existence/?prod=${producto}&cc=${$cc}&reserved=${reserved}`;
      //////////////////////////////////

      return new Promise((resolve)=>
      {
        views.ActiveAnimation(true);
        model.invoke_service(uri,null,function(data) 
        {
          views.ActiveAnimation(false);
          resolve(true);
        },
        function(error) 
        {
          alert(error.message);
          views.ActiveAnimation(false);
          resolve(false);
        },"GET",false);
      });
    },
    SearchProd()
    {
      let search_prod=views.search_prod;
      let modal=document.getElementById("modal-select-products");
      if(!search_prod || search_prod.value.trim()=="" || !modal.classList.contains("hidde_control"))return;

      var uri=`${url}pos/dinner/search_producto/?search=${search_prod.value.trim()}&cc=${$cc}`;
      views.table_products_select.innerHTML="";

      views.ActiveAnimation(true);
        model.invoke_service(uri,null,function(data) 
        {
          views.ActiveAnimation(false);
          let foodbev=data.foodbev??[];
          data_foodbev=foodbev;
          
          if(foodbev.length>1)
          {
            views.table_products_select.innerHTML=views.createBody(foodbev);
            controller.show_modal("#modal-select-products");
            selectedMouse();
          }
          else if(foodbev.length == 1)
          {
            controller.select_foodbev(foodbev[0]);
          }
        },
        function(error) 
        {
          alert(error.message);
          views.ActiveAnimation(false);
        },"GET",false);
    },
    select_foodbev(row)
    {
      if(!row)return;
      
      controller.data_foodbev(row.sys_pk);
      controller.hide_modal("#modal-select-products");
      views.search_prod.value="";
      views.search_prod.focus();
      data_foodbev=[];
    }
}