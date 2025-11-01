var body_mesas=document.querySelector(".body-mesas");
var data_foodbev=[];
var list_orders=[];
var list_requireds=[];
var list_adds_dmns={};

var views=
{
      table_selected:0,
      init:function()
      {
            this.ubicacion=document.getElementById("ubicacion");
            this.rdomesero=document.getElementById("rdomesero");
            this.rdocajero=document.getElementById("rdocajero");
            this.txttable=document.getElementById("txttable");
            if(this.ubicacion)this.ubicacion.addEventListener("change",()=>
            {
                  if(this.rdomesero && this.rdomesero.checked)controller.GetDataByUbicacion("waiter",this.ubicacion.value);
                  else controller.GetDataByUbicacion("cajero",this.ubicacion.value);
            });

            if(this.rdomesero)this.rdomesero.addEventListener("change",()=>
            {
                  if(!this.rdomesero.checked)return;
                  this.trigger(this.ubicacion,"change");
            });

            if(this.rdocajero)this.rdocajero.addEventListener("change",()=>
            {
                  if(!this.rdocajero.checked)return;
                  this.trigger(this.ubicacion,"change");
            });
            //modulo de cobro con tarjeta
            this.btn_cobrar_venta=document.getElementById("btn_cobrar_venta");
            this.tarjeta_importe=document.getElementById("tarjeta_importe");
            this.logs=document.getElementById("logs");
            this.tarjeta_btncobrar=document.getElementById("tarjeta_btncobrar");
            this.efectivo_importe=document.getElementById("efectivo_importe");
            this.propina=document.getElementById("propina");
            this.cobro_lbltotal=document.getElementById("cobro_lbltotal");
            this.cobro_lblresto=document.getElementById("cobro_lblresto");
            this.cobro_lblcambio=document.getElementById("cobro_lblcambio");
            this.pay_container_main=document.getElementById("pay-container-main");
            this.tarjeta_transacciones=document.getElementById("tarjeta_transacciones");
            this.tajeta_logs=document.getElementById("tajeta_logs");
            this.tarjeta_btncancelar=document.getElementById("tarjeta_btncancelar");
            this.cobro_lblimporte_tarjeta=document.getElementById("cobro_lblimporte_tarjeta");
            if(this.tarjeta_importe)this.tarjeta_importe.addEventListener("keydown",(event)=>{if(event.key=="Enter")this.tarjeta_btncobrar.focus();});
            if(this.propina)this.propina.addEventListener("keyup",()=>{controller.SetTotal();});
            if(this.tarjeta_btncancelar)this.tarjeta_btncancelar.addEventListener("click",()=>{controller.tarjeta.Cancelar();})
            if(this.efectivo_importe)this.efectivo_importe.addEventListener("keyup",()=>{controller.SetTotal(false,true);})
            if(this.tarjeta_btncobrar)this.tarjeta_btncobrar.addEventListener("click",()=>{controller.tarjeta.cobrar()});
            
            if(this.txttable)this.txttable.addEventListener("change",()=>{views.lista.classList.add("d-none");});
            //modals abrir mesa
            this.input = document.querySelector('.combo-input');
            this.lista = document.getElementById('data-list');
            //agregar tarjeta manual
            this.divisa=document.getElementById("divisa");
            this.tcambio=document.getElementById("tcambio");
            if(this.divisa)this.divisa.addEventListener("change",()=>{controller.SetTipoCambioByDivisa();});

            //ingreso y egreso
            this.referencia=document.getElementById("referencia");
            //corte de caja
            this.efectivo_caja=document.getElementById("efectivo_caja");
            this.retiro_corte=document.getElementById("retiro_corte");
            this.importe_sig_turno=document.getElementById("importe_sig_turno");
            this.btn_corte_caja=document.getElementById("btn_corte_caja");

            if(this.efectivo_caja)this.efectivo_caja.addEventListener("keyup",()=>{controller.corte.setSigTurno();});
            if(this.retiro_corte)this.retiro_corte.addEventListener("keyup",()=>{controller.corte.setSigTurno();});
            if(this.btn_corte_caja)this.btn_corte_caja.addEventListener("click",()=>{controller.corte.corte_caja();});

            //comida rapida
            this.ipt_cliente=document.getElementById("ipt_cliente");
            //login de configuración
            this.btn_login_config=document.getElementById("btn_login_config");
            this.btn_settings=document.getElementById("btn-settings");
            this.miDialogoLogin=document.getElementById("miDialogoLogin");
            this.txt_user=document.getElementById("usuario");
            this.txt_pwd=document.getElementById("clave");
            if(this.btn_login_config)this.btn_login_config.addEventListener("click",()=>this.SubmitDialog());
            if(this.btn_settings)this.btn_settings.addEventListener("click",()=>this.ShowDialog());

      },
      ShowDialog()
      {
            if(!this.miDialogoLogin)return;
            this.txt_user.value="";
            this.txt_pwd.value="";
            this.miDialogoLogin.showModal();
      },
      CloseDialog()
      {
            if(!this.miDialogoLogin)return;
            this.miDialogoLogin.close();
      },
      SubmitDialog(e=null)
      {
            if(e)e.preventDefault();
            if(!this.miDialogoLogin)return;

            const usuario = this.txt_user.value;
            if((usuario??"").trim()=="")return;
            const clave = this.txt_pwd.value;

            let callback=()=>this.miDialogoLogin.close();

            controller.AccessConfig(usuario.trim(),clave.trim(),this.btn_login_config,{url_redir:this.btn_login_config.getAttribute("data-url")??"",callback})
      },
      //elimina los elementos que contengan las clase class="only-cashier"
      DeleteElementsCashier(_delete=true,_class=".only-cashier")
      {
            let elements=document.querySelectorAll(_class)
            for (let i = 0; i < elements.length; i++) 
            {
                  const element = elements[i];
                  if(_delete)element.remove();
                  else element.classList.remove("d-none");
            }
      },
      IsHideDataListTable()
      {
            if (views.lista.classList.contains("d-none")) 
            {
                  views.lista.classList.add("d-none");
                  return true;
            }
            return false;
      },
      SelectAll(elementOrId)
      {
            let element=(typeof elementOrId === "string"?document.getElementById(elementOrId):elementOrId);
            if(!element)return false;

            element.select();
      },
      mostrarLista() 
      {
           this.lista.classList.toggle("d-none");
      },

      seleccionar(elemento) 
      {
            if(!elemento)return;
            this.input.value = elemento.textContent;
            this.lista.classList.add("d-none");
      },

      filtrarOpciones() 
      {
            this.lista.classList.remove("d-none");
      },
      toggle(container,quit=false,_class="display-in-process")
      {
            if(!container)return;

            if(quit)container.classList.remove(_class)
            else container.classList.add(_class);
      },
      ValidateField(idfield,required=false,msg="")
      {
            let element=document.getElementById(idfield);
            if(!element)return false;
            
            msg=msg==""?`El campo ${element.name} es requerido`:msg;
            if((element.required || required) && element.value.trim()=="")
            {
                  alert(msg);
                  return false;
            }
            return true;
      },
      GetFieldsContainer(idcontainerOrElement)
      {
            let container=(typeof idcontainerOrElement === "string" ? document.getElementById(idcontainerOrElement):idcontainerOrElement);
            if(!container)return {};
            
            let elements=container.querySelectorAll("input,select,textarea");
            let data={};
            for (let i = 0; i < elements.length; i++) 
            {
                  const element = elements[i];
                  
                  let name=((element.getAttribute("data-name")??"")!=""?element.getAttribute("data-name"):element.name);
                  if(element.type=="checkbox")data[name]=element.checked;
                  else data[name]=element.value;
            }
            return data;
      },
      ShowFormulario(id)
      {
             // Oculta todos los formularios
            document.getElementById("container-cajero").style.display = "none";
            document.getElementById("container-mesero").style.display = "none";

            // Muestra el formulario seleccionado
            document.getElementById(id).style.display = "block";
      },
      icon_mesa:"",
      print_mesas:function(data) 
      {
            var html="";
            for (var i =0; i<data.length; i++) 
            {
                  var itm=data[i];
                  html+=`<div class="${css_class_mesa} mesa_${itm.sys_pk}" onclick="controller.verify_size_window(\'${itm.sys_pk}\',\'${itm.code}\',${itm.available_seats},this)">
                              <div class="${this.color(itm.status)} mesa_color_estatus"></div>            
                              <div class="div-mesa_person">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                    </svg>
                                    <p class="p-person">${itm.occupied_seats}/${itm.available_seats}</p>
                                    <div class="mesa_color ${this.flag_color(itm.flag)} mesa_color_${itm.sys_pk}"></div>
                              </div>
                              <div style="display:flex; align-items:center;justify-content:center; margin-top:28px;">
                                    ${views.icon_mesa}
                              </div>
                              <div class="div-mesa_name">
                                    <a>${itm.code}</a>
                              </div>
                        </div>`;
          }

          body_mesas.innerHTML=html;
          event.hide_loading();
          if(views.table_selected>0 && !controller.ismobile())
          {
            var element_select=document.querySelector(`.mesa_${views.table_selected}`);
            if(element_select)views.trigger(element_select,"click");
          }
      },
      PaindItem(data)
      {
        if(!data.sys_pk)return;
        //mesa_
        var element_main=document.querySelector(`.mesa_${data.sys_pk}`);
        
        if(!element_main)return;
      
        // mesa_color_estatus
        var element_status=element_main.querySelector(`.mesa_color_estatus`);
        if(element_status)
        {
            element_status.classList.remove("table_available");
            element_status.classList.remove("table_opened");
            element_status.classList.remove("table_closed");
            let cstts=views.color(data.status);
            if(cstts!="")element_status.classList.add(cstts);
        }
        // mesa_color
        var element_color=element_main.querySelector(`.mesa_color`);
        if(element_color)
        {
            element_color.classList.remove("flag_yellow"); 
            element_color.classList.remove("flag_green"); 
            element_color.classList.remove("flag_orange"); 
            element_color.classList.remove("flag_purple"); 
            element_color.classList.remove("flag_white"); 

            let flag=views.flag_color(data.flag);
            if(flag!="")element_color.classList.add(flag);
        }
      },
      trigger(elementOrSelector,eventName)
      {
            if (!elementOrSelector || !eventName) return;

            const element = (typeof elementOrSelector === "string") ? document.querySelector(elementOrSelector) : elementOrSelector;
            if (!element) 
            {
                  console.error("Elemento no encontrado.");
                  return
            }

            const event = new Event(eventName, {
                  bubbles: true,
                  cancelable: true
            });
            element.dispatchEvent(event);
      },
      print_foodbev:function(data,lineDesc="")
      {
            var content=document.querySelector(".column-content");
            var barra=document.querySelector(".barr-atr");
            barra.classList.add("barra_product");
            barra.style="";
            barra.setAttribute("onclick","controller.back();")
            barra.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="25" style="height: 100%;width: 3rem;color: #FFF; position:absolute;left:0; background-color:var(--purple);" height="25" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                        </svg>
                        <div class="descr-line">${lineDesc}</div>`;

            var html="";
            data_foodbev=data;
            for (var i =0; i <data.length; i++) 
            {
                  var itm=data[i];
                  let img=(itm.img??"")!="" ? itm.img:"";

                  html+=`
				  	<div class="column-content-foodbev shadow" id="foodbev_${itm.sku}" onclick="controller.data_foodbev(${itm.sys_pk})">
						<div class="foodbev-img-container">
							<div class="foodbev-img">
								<img src="${img}" style="width: inherit;" />								
							</div>							
						</div>
						<div class="prod-center">
							<small>${itm.desc_cp}</small>
						</div>
						<div class="foodbev-btn foodbev-line" style="min-height:4.69rem;display:flex;align-items:center;line-height: 1.2rem;font-weight: 500; flex-wrap:wrap;">
							${itm.description}
							<div class="foodbev-price foodbev-price-line">
								<small >$ ${views.format(itm.price,2,".",",")}</small>
							</div>
						</div>
                	</div>`;
            }
            content.innerHTML=html;
            
            event.hide_loading();

      },
      Print_Indicaciones(linea)
      {
            let element=document.getElementById("modl_indicaciones");
            if(!linea || !linea.indicaciones || !element)return;

            let html="";
            for (let i = 0; i < linea.indicaciones.length; i++) 
            {
                  const indicacion = linea.indicaciones[i];
                  html+=`<button class="btn-admin" onclick="views.setIndicacion('${indicacion.trim()}')">${indicacion.trim()}</button>`;
            }
            element.innerHTML=html;
      },
      setIndicacion(indicacion)
      {
            let element=document.getElementById("txtnotas-indicacion");
            if(!element)return;

            element.value = (element.value.trim()!=""? element.value.trim()+"\n"+indicacion:indicacion);
      },
      exist_adds:function(options)
      {
             for(l=0;l<options.length;l++)
            {
                  var op=options[l];
                  if(op.name===name_addcs)
                  {
                        return true;
                  }
            }
            return false;
      },
      add_foodbev:function(sys_pk,other=false)
      {
            var lista_foodbev=document.querySelector(".list-products-li");
            var html=lista_foodbev.innerHTML;
            for (var i = 0; i<data_foodbev.length; i++) 
            {
                  var itm=data_foodbev[i];
                  var countadd=1;
                  if(itm.options && list_adds_dmns && !views.exist_adds(itm.options))
                  {
                        itm.options.push(list_adds_dmns);
                  }
                        
                if(sys_pk===itm.sys_pk)
                {
                  var uuid=controller.guid();
                  var options=itm.options;
                  var required=false;
                  var prodcenter=
                  {
                        code:itm.cod_cp,
                        description:itm.desc_cp
                  }
                  var sku=
                  {
                        prodcenter:prodcenter,
                        uuid:uuid,
                        sku:itm,
                        quantity:1,
                        price:views.format(itm.price * 1,2,".",","),
                        adds:0,
                        total:0,
                        _priceProd_:views.format(itm.price * 1,2,".",","),
                  }

                  if(other){
                         controller.other_equals(uuid,sys_pk);
                  }
                  else
                        list_orders.push(sku);

                  if(controller.isrequired(options))
                  {
                        controller.show_modal('#modal-indicaciones');
                        views.show_indications(options,uuid);
                  }

                 
                   html+=`<li class="list-group-item" id="${uuid}" >
                              <div class="item-order">
                                    <div class="small-description">
                                          <h5>${itm.description}</h5>
                                    </div>
                                    <div class="div-price" id="div-price_${uuid}">
                                          <h3>$ ${views.format(itm.price * 1,2,".",",")}</h3>
                                    </div>
                                    <div class="" id="detail-indications_${uuid}"></div>
                              </div>
                        <small class="list-btns">
							<button onclick="controller.data_foodbev(${itm.sys_pk},true)" title="Otro igual a este">
				  				<div>
				  					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-bag-plus" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" /><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" /></svg>
								</div>
								<span>Otro igual</span>
							</button>
							<button onclick='controller.indicatios(${JSON.stringify(itm)},"${uuid}")'>
								<div>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-card-list" viewBox="0 0 16 16"><path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" /><path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" /></svg>
								</div>
								<span>Indicaciones</span>
							</button>
							<button onclick="controller.quit('${uuid}')">
								<div>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-bag-dash" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5.5 10a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z" /><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" /></svg>
								</div>
								<span>quitar</span>
							</button>
                        <small>
                  </li>`;
                  break;
                }
              
            }
            lista_foodbev.innerHTML=html;
            views.counter();
            views.showTotal();
            if(other)
            {
                   var btnacept=document.querySelector("#btn_addcs");
                  btnacept.click();
            }
            var btnexecute=document.querySelector("#btnExecute");
            if(btnexecute)
                  btnexecute.setAttribute("Onclick","controller.send_data_orders();");
      },
      select_waiter:function(idselect,data)
      {
            var select=document.querySelector("#"+idselect);
            var options="";

            for (var i =0; i <data.length; i++) {
                  var itm=data[i];
                  options+=`<option value="${itm.sys_pk}">${itm.nombre}</option>`;
            }
            select.innerHTML=options;
      },
      LoadSelect(data,idselect,selected="")
      {
            let select=document.querySelector(idselect);
            if(!select)return;

            var options="";
            for (var i =0; i <data.length; i++) 
            {
                  var itm=data[i];
                  options+=`<option value="${itm.codigo}">${itm.descripcion}</option>`;
            }
            select.innerHTML=options;
      },
      createUbicacion(data)
      {
            var options="";

            for (var i =0; i <data.length; i++) 
            {
                  var itm=data[i];
                  options+=`<option value="${itm.codigo}">${itm.descripcion}</option>`;
            }
            this.ubicacion.innerHTML=options;
      },
      counter:function()
      {
            var count=document.querySelector("#count");
            var lista_foodbev=document.querySelector(".list-products-li");
            var counter=lista_foodbev.childNodes.length;
            if(counter>99)
                  counter="99+";
            count.innerHTML=counter;
      },
      showTotal:function()
      {
            var price=0;
            list_orders.forEach(function(e,i){
                  price+=Number(e.price);
                  // if(e.adds)
                  //       price+=Number(e.adds);
                  // if(e.options)
                  // {
                  //       var options=e.options;
                  //       for(var i=0;i<options.length;i++)
                  //       {
                  //             var values=options[i].values;
                  //             for(var j=0;j<values.length;j++)
                  //             {
                  //                   var val=values[j];
                  //                   if(val.amount)
                  //                         price+=Number(val.amount);
                                    
                  //             }
                  //       }
                  // }
                        
            });
            var eprice=document.querySelector("#div-total-all");
            var currenttotal=document.querySelector("#totalcurrent");
            if(currenttotal)
            {
                  var ct=currenttotal.getAttribute("total");
                  var t=price + Number(ct.replace(",",""));
                  // currenttotal.setAttribute("total",views.format(t,2,".",","));
                  currenttotal.innerHTML=`$ ${views.format(t,2,".",",")}`;
            }
            eprice.innerHTML=`<span>Total: $ </span>${views.format(price,2,".",",")}`;
      },
      showSubTotal:function(uuid,price)
      {
            var subtotal=document.querySelector(`#div-price_${uuid}`);
            if(subtotal)
                  subtotal.innerHTML=`<h3>$ ${views.format(price,2,".",",")}</h3>`;
      },
      show_indications:function(options,uuid,uuid_ant="")
      {
            var multiples=document.querySelector("#div-multiples");
            if(multiples)multiples.innerHTML="";

            var select=document.querySelector("#div-singles");
            if(select)select.innerHTML="";

            var html="";
            var html_select="";
            list_requireds=[];

            if(!options)options=[];
            
            if(options)
            {
                  for (var a = 0;a<options.length; a++) 
                  {
                              
                        var itm=options[a];
                        var itm_val=itm.values;

                        var html_val="";

                        if(itm.required)
                              list_requireds.push(itm);


                        if(itm.type==="multiple")
                        {
                              for(j=0;j<itm_val.length;j++)
                              {
                                    var val=itm_val[j];
                                    var checked=false;
                                    list_orders.forEach(function(elem,index) 
                                    {
                                          if(elem.uuid===uuid || elem.uuid===uuid_ant)
                                          {
                                                if(elem.options)
                                                {
                                                      elem.options.forEach(function(el,i){
                                                            var values_list=el.values;
                                                            values_list.forEach(function(e,ind){
                                                                  if(val.text.replace(/ /g,"")==e.text.replace(/ /g,""))
                                                                  {
                                                                        checked=true;
                                                                        return false;
                                                                  }
                                                            });
                                                      });
                                                }
                                          }
                                          
                                    });
                                    
                                    var check="";
                                    if(checked)
                                          check="checked";

                                    var sku="";
                                    if(val.sku)
                                          sku=val.sku;

                                    html_val+=`<div class="div-check_${itm.name.replace(/ /g,"")}">
                                                <input type="checkbox" ${check}="true" sku="${sku}" amount="${views.format(val.amount,2,".",",")}" id="${val.text.replace(/ /g,"")}" value="${val.text}">
                                                <label for="${val.text.replace(/ /g,"")}">${val.text}</label>
                                          </div>`;
                              }
                              var name="";
                              if(itm.name===name_addcs){name="Adicional";}
                              else{name=itm.name;}

                              if(html_val.trim()!="")
                              {
                                    html+=`<h3 class="h3-name" value="${itm.name}">${name}</h3>
                                    <div class="div-multiple">
                                          ${html_val}
                                    </div>
                                    `;
                              }
                              
                        }
                        else if(itm.type==="single")
                        {
                              var selectoption=`<select id="single_${itm.name.replace(/ /g,"")}_" class="form-control w-100 select-apparence ">
                              <option value=""></option>`;
                              for(t=0;t<itm_val.length;t++)
                              {
                                    var valt=itm_val[t];
                                    var selected=false;
                                    for(var v=0;v<list_orders.length;v++)
                                    {
                                          var elem=list_orders[v];
                                          if(elem.uuid===uuid)
                                          {

                                                if(elem.options)
                                                {
                                                      for (var el =0; el<elem.options.length; el++) 
                                                      {
                                                            var values_list=elem.options[el].values;
                                                            for(var e=0;e<values_list.length;e++)
                                                            {
                                                                  var elm=values_list[e];
                                                                  if(valt.text.replace(/ /g,"")==elm.text.replace(/ /g,""))
                                                                  {
                                                                        selected=true;
                                                                  break;
                                                                  }
                                                                  if(selected)
                                                                        break;
                                                            }
                                                            if(selected)
                                                                  break;
                                                      }
                                                }
                                          }
                                          if(selected)
                                                break;
                                    }
                                    var selection="";
                                    if(selected)selection="selected";

                                    selectoption+=`
                                          <option ${selection}="true" amount="${views.format(valt.amount,2,".",",")}" value="${valt.text}">${valt.text}</option>
                                    `;
                              }
                              selectoption+=`</select>`;
                              html_select+=`
                              <div class="body-single">
                                    <h3 class="h3-name">${itm.name}</h3>
                                    <div class="div-single_${itm.name.replace(/ /g,"")}">
                                          ${selectoption}
                                    </div>
                              </div>
                              `;
                        }
                        
                        
                  }
            }     
            
            if(html=="")multiples.style.display="none";
            else
            {
                  multiples.innerHTML=html;
                  multiples.style.display="block";
            }

            if(html_select=="")select.style.display="none";
            else
            {
                  select.innerHTML=html_select;
                  select.style.display="grid";
            }

            var notas=document.querySelector("#txtnotas-indicacion");
            list_orders.forEach(function(elem,index){
                  if(elem.uuid==uuid)
                  {
                        var times=document.querySelectorAll("#times > button");
                        times.forEach(function(e,i){
                              e.classList.remove("hover-btn");
                              if(elem.time===e.getAttribute("value"))
                              {
                                    e.classList.add("hover-btn");
                                    return false;
                              }
                        });
                        if(elem.notas)
                        {
                              notas.value=elem.notas;
                              return false;
                        }else
                        {
                              notas.value="";
                              return false;
                        }
                  }
                        
            });

            var btnacept=document.querySelector("#btn_addcs");
            btnacept.setAttribute("onclick",`controller.add_indications("${uuid}")`);
      },
      add_details:function(time,text_detail,detail_indications)
      {
        var tm="";
        if(time)
        {
          tm=`<small class="lifetime">${controller.lifetime(time.getAttribute("value"))+" Tiempo"}</small>`;
          time.classList.remove("hover-btn");
        }
        if(text_detail!="" && text_detail!=",")
        {
          var tm1=`<br>${tm}`;
          detail_indications.innerHTML=`<small>${text_detail.slice(0,-1)}</small>${tm1}`;
          detail_indications.classList.add("detail-indications");
        }else
        {
          detail_indications.innerHTML=`${tm}`;
          detail_indications.classList.add("detail-indications");
        }
      },
      format:function(number, decPlaces, decSep, thouSep,prefix="")
      {
            decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
          decSep = typeof decSep === "undefined" ? "." : decSep;
          thouSep = typeof thouSep === "undefined" ? "," : thouSep;
          var sign = number < 0 ? "-" : "";
          var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
          var j = (j = i.length) > 3 ? j % 3 : 0;

          return prefix + sign +
              (j ? i.substr(0, j) + thouSep : "") +
              i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
              (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
      },
      color:function(status)
      {
            //el valor de retorno es una clase css
            switch(status)
            {
                  case 0:return "table_available";//disponible
                  case 1:return "table_opened"; //abierta
                  case 2:return "table_closed"; //cerrada
            }
      },
      flag_color:function(flag)
      {
            //el valor de retorno es una clase css
            switch(flag)
            {
                  case 0:return "flag_white";
                  case 1:return "flag_yellow"; 
                  case 2:return "flag_green"; 
                  case 3:return "flag_orange"; 
                  case 4:return "flag_purple"; 
                  default:return "flag_white";
            }
      },
      print_ordenes:function(data)
      {
            var table_ordenes=document.querySelector(".ordenes");
            var lbltotal=document.querySelector("#lbltotal");
            var lblticket=document.querySelector("#lblticket");
            var card_info=document.querySelector(".card-info");
            var name_table=document.querySelector("#name_table");

            var new_command=document.querySelector("#new_command")
            var message=document.querySelector("#message")
            var imp_close=document.querySelector("#imp_close")
            var re_print=document.querySelector("#re_print")
            var mesa=document.querySelector(`.mesa_${data.sys_pk}`);
            var mesa_color=document.querySelector(`.mesa_color_${data.sys_pk}`);

            var infvnt=document.querySelector("#info-vnt");
            var lblnotavnt=document.querySelector("#lblnotavnt");

            lblnotavnt.innerHTML=data.notetable;
            if(infvnt && data.notetable=="")
                  infvnt.style.height="5rem";
            else
                  infvnt.style.height="5rem";

            if(mesa)
                  if(mesa.classList.contains("table_opened"))
                        mesa.classList.remove("table_opened");
            if(mesa)
                  mesa.classList.add(this.color(data.status))
            // mesa_color.classList.add(this.flag_color(data.flag))
            if(card_info)
            {
                  card_info.style.opacity="";
                  card_info.style.pointerEvents="";
            }
            
            var html="";
            var total=0;
            var data_orders=
            {
                  sys_pk:data.sys_pk,
                  sys_guid:data.sys_guid,
                  reference:data.reference,
                  balance:data.balance,
                  code:data.code
            }
            for (var i =0; i<data.orders.length; i++) 
            {
                  var itm=data.orders[i];
                  total+=itm.total;
                  var description=`<b>${itm.description}</b>`;
                  if (Number(itm.time)!=0)
                        description+=` ${controller.lifetime(itm.time)} Tiempo.`;
                  if(Number(itm.discount)!=0)
                        description+=`${itm.discount}`;
                  if(itm.notes!="")
                        description+=`</br>${itm.notes}`;
                  description+=`</br><label class="fsz-12" style="color:#888;">${itm.created}</label>`;

                  html+=`<tr>
                        <td style="padding-bottom: 16px;">
                              <div class="cellgrid">
                                    <div class="divplus" onclick='controller.addmore(${JSON.stringify(data_orders)},${itm.linea},"${itm.sku}")'>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                          </svg>
                                    </div>
                                    <div class="text-center">
                                          ${itm.quantity}
                                    </div>
                                    <div class="divminus" onclick='controller.quit_prod("${data.sys_guid}","${itm.sku}",${itm.sys_pk},${itm.pkdorden})'>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16">
                                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                          </svg>
                                    </div>
                              </div>                  
                        </td>
                        <td style="width:60%;padding-bottom: 16px;">${description}</td>
                        <td class="text-end" style="padding-bottom: 16px; color:var(--purple);">$ ${views.format(itm.total,2,".",",")}</td>
                  </tr>`;
          }
          if(lblticket)
            lblticket.innerHTML=data.reference;
          if(lbltotal)
            lbltotal.innerHTML="$ "+views.format(data.balance,2,".",",");
         if(table_ordenes)
          table_ordenes.innerHTML=html;
         if(name_table)
          name_table.innerHTML=`<div class=""><h3>${data.code}</h3></div><br>`;
      

         //btn cobrar
            var btncobrar=document.getElementById("btn-cobrar");
            if(btncobrar)btncobrar.classList.add("disabled");

            re_print.setAttribute("onclick",`controller.reprint("${data.sys_pk}")`);
            if(re_print)re_print.classList.remove("disabled");
          if(data.status==2)
          {
            if(new_command)
            {
                  new_command.setAttribute("onclick",``);
                  new_command.classList.add("disabled");
            }
            if(message)message.classList.add("disabled");
            
            if(imp_close)
            {
                  imp_close.innerHTML =`<div class="div-img"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-unlock-fill" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z" /></svg></div>Reabrir`;
                  imp_close.setAttribute("onclick",`controller.reopen_table("${data.sys_pk}")`);
            }
            
            if(btncobrar)
            {
                  let data_href=(btncobrar.getAttribute("data-href")??"");
                  btncobrar.href=data_href + `&idt=${data.sys_pk}`;

                  btncobrar.classList.remove("disabled");
            }
          }
          else if (data.status==1)
          {
            if(new_command)
            {
                  new_command.classList.remove("disabled");
                  new_command.setAttribute("onclick",`controller.new_command("${data.sys_guid}",${data.sys_pk},"${data.code}","${data.reference}","${views.format(data.balance,2,".",",")}");`); //newcommand
            }
            if(message)
                  message.classList.remove("disabled");
            // if(re_print)re_print.classList.add("disabled");
            if(imp_close)
            {
                  imp_close.innerHTML =`<div class="div-img"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg></div>Imp/Cerrar`;
                  imp_close.setAttribute("onclick",`controller.close_table("${data.sys_pk}")`);
            }
            
          }

          views.ActiveAnimation(false);
      },
      print_prodc:function(data)
      {
            var prodc_display=document.querySelector(".div-prodc");
            var html=prodc_display.innerHTML;

            for (var i =0; i<data.length; i++) {
                  var itm=data[i];
                  html+=`<div class="product" id="product_${i+1}">
                        <button class="btn" data="centrop" onclick="controller.foodbev(this,${itm.sys_pk})" id="cproduccion">
                        ${itm.description}
                        </button>
                  </div>
                  `;
            }
            prodc_display.innerHTML=html;
      },
      print_lines:function(data)
      {
            var line_display=document.querySelector(".column-content");

            var html="";

            for (var i =0; i<data.length; i++) 
            {
                  var itm=data[i];
                  let img=(itm.img??"")!="" ? itm.img:"";
                  html+=`
					<div class="column-content-foodbev shadow" id="linea_${itm.sys_pk}" onclick="controller.foodbev(this,'',${itm.sys_pk},'${itm.description}')">
						<div class="foodbev-img-container">
							<div class="foodbev-img">
								<img src="${img}" style="width: inherit;" />								
							</div>							
						</div>
						<div class="foodbev-btn" style="min-height:4.69rem;display:flex;align-items:center;line-height: 1.2rem;font-weight: 500;">
							${itm.description}
						</div>
						<div class="foodbev-price">
							<small ></small>
						</div>
					</div>`;
                 
            }
            line_display.innerHTML=html;
            event.hide_loading();
      },
      print_caption_waiter:function(id,text)
      {
            var elem=document.querySelector("#"+id);
            if(elem)
                  elem.innerHTML=text;
      },
      select_table:function(e)
      {
            // var elem=document.querySelector("#"+id);
            var tables=document.querySelectorAll(".body-mesas div");
            tables.forEach(function (element,index) {
                  element.classList.remove("table-selected");
            });
            var id="";
            var elm=null;
            if (typeof e === "string")id=e;
            else if(e.target)id=e.target.id;
            else if(e.onclick)elm=e;
            else id=e.id??"";
           
            if(id.trim()!="")elm=document.querySelector(e);

            if(elm)elm.classList.add("table-selected");
      },
      ActiveAnimation(active=false)
      {
            var info_vnt=document.getElementById("info-vnt");
            var module_nota=document.getElementById("module-nota");
            var mol_cmmd_account=document.getElementById("mol_cmmd_account");
            var table_orders_details=document.getElementById("table_orders_details");
            
            if(info_vnt)info_vnt.classList.remove("placeholder");
            if(module_nota)module_nota.classList.remove("placeholder");
            if(mol_cmmd_account)mol_cmmd_account.classList.remove("placeholder");
            if(table_orders_details)table_orders_details.classList.remove("placeholder");

            if(active)
            {
                  if(info_vnt)info_vnt.classList.add("placeholder");
                  if(module_nota)module_nota.classList.add("placeholder");
                  if(mol_cmmd_account)mol_cmmd_account.classList.add("placeholder");
                  if(table_orders_details)table_orders_details.classList.add("placeholder");
            }
      }
    };