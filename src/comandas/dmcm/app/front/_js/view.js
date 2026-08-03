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
            this.modal_tarjeta=document.getElementById("modal_tarjeta");
            this.modal_home_delivery = document.getElementById('modal-home-delivery');

            const home_delivery_phone = document.querySelector('#modal-home-delivery input[name="telefono"]');
            const dmns_destino = document.getElementById('div-dmns-destino');
            const btn_delivery_phone_ok = document.getElementById('btn-delivery-phone-ok');
            const btn_home_delivery_ok = document.getElementById('btn-home-delivery-ok');
            
            if (this.modal_home_delivery) this.modal_home_delivery.addEventListener('shown.bs.modal', (e) => {
                home_delivery_phone.readOnly = false;
                dmns_destino.disabled = true;
                btn_home_delivery_ok.disabled = true;
                home_delivery_phone.focus();
            });
            if (btn_delivery_phone_ok) btn_delivery_phone_ok.addEventListener('click', (e) => {
                let phone = home_delivery_phone.value;
                
                if (e.target.dataset.mode == "edit")
                {
                    this.setDataDS({
                        sys_pk: "",
                        telefono: phone,
                        nombre: "",
                        direccion: "",
                        notas: ""
                    });
                    btn_delivery_phone_ok.dataset.mode = "confirm";
                    btn_delivery_phone_ok.textContent = "OK";
                    home_delivery_phone.readOnly = false;
                    dmns_destino.disabled = true;
                    btn_home_delivery_ok.disabled = true;
                    home_delivery_phone.select();
                }
                else
                {
                    this.getDestinationByPhone(phone);
                }
            });
            if (home_delivery_phone) home_delivery_phone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') btn_delivery_phone_ok.click();
            });
            if (home_delivery_phone) home_delivery_phone.addEventListener('input', (e) => {
                dmns_destino.disabled = true;
                btn_home_delivery_ok.disabled = true;
            });
            if(this.modal_tarjeta)
            {
                  this.modal_tarjeta.addEventListener("shown.bs.modal", (e) => {
                        const importe = e.target.querySelector("#importe");
                        if (Number(importe.value) == 0)
                        {
                              importe.value = this.efectivo_importe.value;
                              e.target.querySelector('#numero')?.focus();
                        }
                  });
                  this.modal_tarjeta.addEventListener("hidden.bs.modal", (e) => {
                        const form = e.target.querySelector("form");
                        form?.reset();
                  });
            }
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

            this.login_action="";
            if(this.btn_login_config)this.btn_login_config.addEventListener("click",()=>this.SubmitDialog(null,this.login_action));
            if(this.btn_settings)this.btn_settings.addEventListener("click",()=>
            {
                  this.login_action="";
                  this.ShowDialog();
            });

            //servicio a domicilio
            this.cliente_ds=document.getElementById("cliente_ds");
            if(this.cliente_ds)this.cliente_ds.addEventListener("change",()=>{this.setDataDS(this.cliente_ds.getValue())});

            this.btn_show_cortesia=document.getElementById("btn-show-cortesia");
            if(this.btn_show_cortesia)this.btn_show_cortesia.addEventListener("click",()=>
            {
                  this.login_action="cortesia";
                  this.ShowDialog();
            });

            this.btn_cancelar=document.getElementById("btn-cancelar");
            if(this.btn_cancelar)this.btn_cancelar.addEventListener("click",()=>
            {
                  this.login_action="cancelar";
                  this.ShowDialog();
            });

            this.search_prod=document.getElementById("search_prod");
            if(this.search_prod)this.search_prod.addEventListener("keydown",(e)=>
            {
                  if (e.key === 'Enter')controller.SearchProd();
            })

            this.table_products_select=document.getElementById("tbody-products-selected");

            //modulo de cobro
            this.client_new = document.getElementById("client_new");
            if(this.client_new)client_new.addEventListener("change",()=>{this.showBtnCredit();});
      },
      showBtnCredit()
      {
            let btn_sale_credit=document.getElementById("btn_sale_credit");
            if(!btn_sale_credit)return;

            if(!this.client_new)
            {
                  btn_sale_credit.classList.add("d-none");
                  return;
            }

            let data=this.client_new.getValue();
            if(!data || !data.credito)
            {
                  btn_sale_credit.classList.add("d-none");
                  return;
            }

            if(data.credito)btn_sale_credit.classList.remove("d-none");
      },
      ValidateCredit()
      {
            if((controller.tarjeta.tbl_tarjetas && controller.tarjeta.tbl_tarjetas.DataArray.length > 0) || controller.tarjeta.Transactions.length > 0)
            {
                  alert("No puede pagar a crédito, ha agregado tarjetas");
                  return false;
            }

            return true;
      },
      ShowDialog(iddialog="")
      {
            if(!iddialog)
            {
                  if(!this.miDialogoLogin)return;
                  this.txt_user.value="";
                  this.txt_pwd.value="";
                  this.miDialogoLogin.showModal();
            }
            else
            {
                  const dialog=document.getElementById(iddialog);
                  dialog.showModal();
            }
      },
      CloseDialog(iddialog="")
      {
            if(!iddialog)
            {
                  if(!this.miDialogoLogin)return;
                  this.miDialogoLogin.close();
            }
            else
            {
                  const dialog=document.getElementById(iddialog);
                  dialog.close();
            }
      },
      SubmitDialog(e=null,action="")
      {
            if(e)e.preventDefault();
            if(!this.miDialogoLogin)return;

            const usuario = this.txt_user.value;
            if((usuario??"").trim()=="")return;
            const clave = this.txt_pwd.value;

            let url_redir=(action == "" ? this.btn_login_config.getAttribute("data-url")??"":"")
            let callback=()=>
            {
                  this.miDialogoLogin.close();
                  switch (action) 
                  {
                        case "cortesia":
                              controller.show_modal("#modal-cortesia");
                              break;
                        case "cancelar":
                              controller.cancelAccount(this.account_selected?.sys_pk??0);
                        break;
                  }
            };

            controller.AccessConfig(usuario.trim(),clave.trim(),this.btn_login_config,{url_redir:url_redir,callback,action:action})
      },
      showDialogDS()
      {
            let form=document.getElementById("form_home_delivery");
            form.reset();
            controller.showModal("modal-home-delivery");
      },
      //elimina los elementos que contengan las clase class="only-cashier"
      DeleteElementsCashier(_delete=true,_class=".only-cashier")
      {
            let elements=document.querySelectorAll(_class)
            if(!_delete && _class==".only-cashier")
            {
                  let cardh_actions=document.getElementById("card_header_actions");
                  if(cardh_actions)
                  {
                        cardh_actions.classList.add("d-md-flex");
                        cardh_actions.classList.add("d-block");
                  }
            }
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
      toggle(container,quit=false,_class="display-in-process",text=null)
      {
            if(!container)return;
            if(!_class)_class="display-in-process";

            if(quit)
            {
                  container.classList.remove(_class);
                  container.style.removeProperty('--display-text');
            }
            else
            {
                  container.classList.add(_class);

                  if(text)
                  {
                        container.style.setProperty('--display-text', `"${text}"`);
                  }
            }
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
                              <div class="${this.color(itm.status,itm)} mesa_color_estatus"></div>            
                              <div class="div-mesa_person">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                                    </svg>
                                    <p class="p-person">${itm.occupied_seats}/${itm.available_seats}</p>
                                    <div class="mesa_color ${this.flag_color(itm.flag)} mesa_color_${itm.sys_pk}"></div>
                              </div>
                              <div style="display:flex; align-items:center;justify-content:center; margin-top:28px;">
                                    ${itm.img??views.icon_mesa}
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
            let cstts=views.color(data.status,data);
            
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
                  itm["fmt_price"]="$ "+views.format(itm.price,controller.decimals,".",",");
                  html+=this.htmlfoodbev(itm);
            }
            content.innerHTML=html;
            
            event.hide_loading();

      },
      htmlfoodbev(itm,id="foodbev_",onclick="controller.data_foodbev")
      {
            let img=(itm.data_img?.img??"")!="" ? itm.data_img?.img:"";
            let def_img=(itm.data_img?.def_img??"")!="" ? itm.data_img?.def_img:"";
            let precio=itm.fmt_price??"";
            
            // html+=`
		// 		<div class="card product-card h-100 shadow" id="linea_${itm.sys_pk}" onclick="controller.foodbev(this,'',${itm.sys_pk},'${itm.description}')">
            //                   <div class="product-image">
            //                         <img 
            //                               src="${img}" onerror="this.src='${def_img}'"
            //                               class="card-img-top"
            //                               alt="Producto"
            //                         >
            //                   </div>      
            //                   <div class="card-body d-flex align-items-center justify-content-center">
            //                         <h6 class="product-title text-center mb-0">
            //                               ${itm.description}
            //                         </h6>
            //                   </div>
            //             </div>`;
            

            return `
                  <div class="card product-card h-100 shadow" id="${id}${itm.sku}" onclick="${onclick}(${itm.sys_pk})">
                        <div class="product-image">
                              <img 
                                    src="${img}" onerror="this.src='${def_img}'"
                                    class="card-img-top"
                                    alt="Producto"
                              >							
                        </div>

                        <div class="card-body" style="padding: 7px;">
                              <div class="prod-center">
                                    <small>${itm.desc_cp??""}</small>
                              </div>
                              <div class="product-title mb-0" _style="min-height:4.69rem;display:flex;align-items:center;line-height: 1.2rem;font-weight: 500; flex-wrap:wrap;">
                                    ${itm.description}
                              </div>
                              <div class="text-center color-cfg">
                                    <small>${precio}</small>
                              </div>
                        </div>
                	</div>`;

                  // return `
            //       <div class="column-content-foodbev shadow" id="${id}${itm.sku}" onclick="${onclick}(${itm.sys_pk})">
            //             <div class="foodbev-img-container">
            //                   <div class="foodbev-img">
            //                         <img src="${img}" onerror="this.src='${def_img}'" style="width: inherit;" />								
            //                   </div>							
            //             </div>
            //             <div class="prod-center">
            //                   <small>${itm.desc_cp??""}</small>
            //             </div>
            //             <div class="foodbev-btn foodbev-line" style="min-height:4.69rem;display:flex;align-items:center;line-height: 1.2rem;font-weight: 500; flex-wrap:wrap;">
            //                   ${itm.description}
            //                   <div class="foodbev-price foodbev-price-line">
            //                         <small >${precio}</small>
            //                   </div>
            //             </div>
            //     	</div>`;
      },
      Print_Indicaciones(linea)
      {
            let element=document.getElementById("modl_indicaciones");
            if(!linea || !linea.indicaciones || !element)return;

            let html="";
            for (let i = 0; i < linea.indicaciones.length; i++) 
            {
                  const indicacion = linea.indicaciones[i];
                  if(indicacion.trim()=="")continue;
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
      createGrupos(grupos)
      {
            seleccion = {};
            return new Promise((resolve)=>
            {
                  printGrupo(grupos);
                  renderTabla();
                  controller.show_modal('#modal-recetas-variables');

                  let btn_acept_prods_vars=document.getElementById("btn_acept_prods_vars");
                  let btn_close_mdl_prods_vars=document.getElementById("btn_close_mdl_prods_vars");

                  btn_acept_prods_vars.addEventListener("click",()=>
                  {
                        let total=totalCantidad(seleccion,null,true);
                        
                        if(total == -1){return;}
                        if( total < min)
                        {
                              alert("Debe seleccionar al menos un elemento");
                              return;
                        }
                        controller.hide_modal("#modal-recetas-variables");
                        resolve(true);
                  });
                  btn_close_mdl_prods_vars.addEventListener("click",()=>
                  {
                        controller.hide_modal("#modal-recetas-variables");
                        resolve(false);
                  });
            });
            
      },
      async add_foodbev(sys_pk,other=false)
      {
            var lista_foodbev=document.querySelector(".list-products-li");
            var html=lista_foodbev.innerHTML;
            let uf_req_indicaciones="";
            let last_id_orden="";
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
                  console.log(itm)
                  var uuid=controller.guid();
                  uf_req_indicaciones=(itm.line?.uf_req_indicaciones ?? false) ? uuid:"";
                  last_id_orden=uuid;

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
                        price:views.format(itm.price * 1,controller.decimals_backend,".",","),
                        adds:0,
                        total:0,
                        _priceProd_:views.format(itm.price * 1,controller.decimals_backend,".",","),
                  }
                  //validar existencias
                  if(itm.validar_existencia)
                  {
                        let r=await controller.validarExistencia(sys_pk);
                        if(!r)return;
                  }

                  if(other){
                         controller.other_equals(uuid,sys_pk);
                  }
                  else
                  {
                        if(itm.grupos.length >0)
                        {
                              let h=await this.createGrupos(itm.grupos??[]);
                              if(!h)return;
                              
                              const filtrado = Object.fromEntries(
                              Object.entries(seleccion)
                                    .filter(([key, value]) => value instanceof Map && value.size > 0)
                                    .map(([key, value]) => [key, Object.fromEntries(value)])
                              );

                              if(Object.keys(filtrado).length > 0)sku["variables"]=filtrado;
                        }
                        list_orders.push(sku);
                  }

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
                                          <h3>$ ${views.format(itm.price * 1,controller.decimals,".",",")}</h3>
                                    </div>
                                    <div class="" id="detail-indications_${uuid}"></div>
                                    <small>${sku.variables ? totalCantidad(seleccion) +"+ Producto variable":""} </small>
                              </div>
                        <small class="list-btns">
							<button onclick="controller.data_foodbev(${itm.sys_pk},true)" title="Otro igual a este">
				  				<div>
				  					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-bag-plus" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" /><path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" /></svg>
								</div>
								<span>Otro igual</span>
							</button>
							<button id="btn_indicacion_${uuid}" onclick='controller.indicatios(${JSON.stringify(itm)},"${uuid}")'>
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

            if(uf_req_indicaciones != "")
            {
                  let btn_indicacion=document.getElementById("btn_indicacion_"+uf_req_indicaciones);
                  if(btn_indicacion)btn_indicacion.click();
            }
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
                        
            });
            var eprice=document.querySelector("#div-total-all");
            var currenttotal=document.querySelector("#totalcurrent");
            if(currenttotal)
            {
                  var ct=currenttotal.getAttribute("total");
                  var t=price + Number(ct.replace(",",""));
                  // currenttotal.setAttribute("total",views.format(t,2,".",","));
                  currenttotal.innerHTML=`$ ${views.format(t,controller.decimals,".",",")}`;
            }
            eprice.innerHTML=`
            <span class="c-none"></span>
            <span>Total: $ ${views.format(price,controller.decimals,".",",")} </span>
            <div class="c-none d-flex align-items-center fw-bold">
                  <small style="">
                  ${list_orders.length}
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-cart4" viewBox="0 0 16 16">
                        <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"/>
                  </svg>
                  </small>
            </div>`;
      },
      showSubTotal:function(uuid,price)
      {
            var subtotal=document.querySelector(`#div-price_${uuid}`);
            if(subtotal)
                  subtotal.innerHTML=`<h3>$ ${views.format(price,controller.decimals,".",",")}</h3>`;
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
                                                <input type="checkbox" ${check}="true" sku="${sku}" amount="${views.format(val.amount,controller.decimals_backend,".",",")}" id="${val.text.replace(/ /g,"")}" value="${val.text}">
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
                                          <option ${selection}="true" amount="${views.format(valt.amount,controller.decimals_backend,".",",")}" value="${valt.text}">${valt.text}</option>
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
      color:function(status,_itm=null)
      {
            //el valor de retorno es una clase css
            let itm=this.keysToLower(_itm);
            if(itm && itm.service == "DS")
            {
                  if(itm.status == STATUS_ADMIN.CERRADO && itm.statusentrega==STATUS_ENTREGA.POR_ENTREGAR)return "flag_yellow";
                  if(itm.status == STATUS_ADMIN.PROCESADO && (itm.statusentrega==STATUS_ENTREGA.POR_ENTREGAR || itm.statusentrega==STATUS_ENTREGA.NO_APLICA))return "flag_orange";
                  if(itm.status == STATUS_ADMIN.CERRADO && itm.statusentrega==STATUS_ENTREGA.ENTREGADO)return "bg-success";
            }
            switch(status)
            {
                  case 0:return "table_available";//disponible
                  case 1:return "table_opened"; //abierta
                  case 2:return "table_closed"; //cerrada
            }
      },
      keysToLower(obj) 
      {
            const newObj = {};
            for (let key in obj) {
                  newObj[key.toLowerCase()] = obj[key];
            }
            return newObj;
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
      account_selected:null,
      print_ordenes:function(_data)
      {
            const data=views.keysToLower(_data);
            this.account_selected=data;
            var table_ordenes=document.querySelector(".ordenes");
            var lbltotal=document.querySelector("#lbltotal");
            var lblticket=document.querySelector("#lblticket");
            var card_info=document.querySelector(".card-info");
            var name_table=document.querySelector("#name_table");
            let account_dealer=document.getElementById("account_dealer");

            var new_command=document.querySelector("#new_command")
            var message=document.querySelector("#message")
            var imp_close=document.querySelector("#imp_close")
            var re_print=document.querySelector("#re_print")
            var mesa=document.querySelector(`.mesa_${data.sys_pk}`);
            var mesa_color=document.querySelector(`.mesa_color_${data.sys_pk}`);

            var infvnt=document.querySelector("#info-vnt");
            var lblnotavnt=document.querySelector("#lblnotavnt");

            let lbl_subtotal=document.getElementById("lbl_subtotal")
            let lbl_descuento=document.getElementById("lbl_descuento")
            let lbl_impuestos=document.getElementById("lbl_impuestos");
            let id_account=document.getElementById("id_account");
            let btn_mdl_save_note=document.getElementById("btn_mdl_save_note");
            let account_client=document.getElementById("account_client");

            lbl_subtotal.textContent="SubTotal: $ "+views.format(data.subtotal,controller.decimals,".",",")
            lbl_descuento.textContent="Descuento: $ "+views.format((data.d1??0) + (data.d2??0),controller.decimals,".",",")
            lbl_impuestos.textContent="Impuestos: $ "+views.format((data.i1+data.i2+data.i3+data.i4),controller.decimals,".",",")
            lblnotavnt.innerHTML=data.notetable;
            if(account_client)account_client.textContent=`${data?.customer?.code ?? ""} ${data?.customer?.name ?? ""}`;
            // if(infvnt && data.notetable=="")
            //       infvnt.style.height="5rem";
            // else
            //       infvnt.style.height="5rem";

            if(mesa)
                  if(mesa.classList.contains("table_opened"))
                        mesa.classList.remove("table_opened");
            if(mesa)mesa.classList.add(this.color(data.status))
            // mesa_color.classList.add(this.flag_color(data.flag))
            if(card_info)
            {
                  card_info.style.opacity=data.opacity??"";
                  card_info.style.pointerEvents=data.pointerEvents??"";
            }
            if(account_dealer)account_dealer.textContent=data.repartidor??"";

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
                        <td class="text-end" style="padding-bottom: 16px; color:var(--purple);">$ ${views.format(itm.total,controller.decimals,".",",")}</td>
                  </tr>`;
          }

            if(id_account)id_account.textContent=data.reference;
            if(lblticket)lblticket.innerHTML=data.reference;
            if(lbltotal)lbltotal.innerHTML="$ "+views.format(data.balance,controller.decimals,".",",");
            if(btn_mdl_save_note)btn_mdl_save_note.onclick=()=>controller.SaveFPago(data.sys_pk,(data)=>{controller.hide_modal("#modal-note-account");},false);

            if(table_ordenes)table_ordenes.innerHTML=html;
            if(name_table)name_table.innerHTML=`<div class=""><h3>${data.code}</h3></div>`;
      
            var btncancel=document.getElementById("btn-cancelar");
            var btncortesia=document.getElementById("btn-cortesia");

            //btn cobrar
            var btncobrar=document.getElementById("btn-cobrar");
            if(btncobrar)btncobrar.classList.add("disabled");

            re_print.setAttribute("onclick",`controller.reprint("${data.sys_pk}")`);
            // btncancel.setAttribute("onclick",`controller.cancelAccount("${data.sys_pk}")`);
            btncortesia.setAttribute("onclick",`controller.cortesia("${data.sys_pk}")`);

            if(re_print)re_print.classList.remove("disabled");

            if(new_command)
            {
                  new_command.setAttribute("onclick",``);
                  new_command.classList.add("disabled");
            }
            if(data.status==2)
            {
                  if(message)message.classList.add("disabled");
                  
                  if(imp_close)
                  {
                        imp_close.innerHTML =`<div class="div-img"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-unlock-fill" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z" /></svg></div>Reabrir`;
                        imp_close.setAttribute("onclick",`controller.reopen_table("${data.sys_pk}")`);
                  }
            }
            else if (data.status==1)
            {
                  if(new_command)
                  {
                        new_command.classList.remove("disabled");
                        new_command.setAttribute("onclick",`controller.new_command("${data.sys_guid}",${data.sys_pk},"${data.code}","${data.reference}","${views.format(data.balance,controller.decimals_backend,".",",")}");`); //newcommand
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
            
            if(btncobrar)
            {
                  let data_href=(btncobrar.getAttribute("data-href")??"");
                  let url=data_href + `&idt=${data.sys_pk}`;
                  btncobrar.setAttribute("onclick",`controller.close_table("${data.sys_pk}","${url}")`);
                  btncobrar.classList.remove("disabled");
            }
            this.actionsDS(data);
            views.ActiveAnimation(false);
            setRemainingHeight("container-info-orders","table_orders_details");
      },
      actionsDS(data)
      {
            // 1. Ocultar todos los botones
            Object.values(ACTION_BUTTONS).forEach(id => 
            {
                  const btn = document.getElementById(id);
                  if (btn) btn.style.display = '';
            });
            Object.values(ACTION_BUTTONS_DS).forEach(id => 
            {
                  const btn = document.getElementById(id);
                  if(id==ACTION_BUTTONS_DS.ENVIAR || id==ACTION_BUTTONS_DS.CAMBIAR_REPARTIDOR)
                  {
                        let btn_repartidor=document.getElementById("btn-repartidor");
                        btn_repartidor.setAttribute("onclick",`controller.actionAccount(${data.sys_pk}, "${id.replace("btn-","")}", "frm_repartidor", false)`);
                        btn.setAttribute("onclick",`controller.show_modal("#modal-select-repartidor")`);
                  }
                  else btn.setAttribute("onclick",`controller.actionAccount(${data.sys_pk},"${id.replace("btn-","")}")`);

                  if (btn && (data.service??"").toUpperCase() !="DS") btn.style.display = 'none';
                  else if(btn) btn.style.display = '';
            });

            if(data.StatusAdministrativo == STATUS_ADMIN.PROCESADO)
            {
                  Object.values(ACTION_BUTTONS_PROCESADO).forEach(id=>
                  {
                        const btn = document.getElementById(id);
                        btn.classList.add("disabled");
                  });
            }
            
            if((data.service??"").toUpperCase() !="DS")return;
            
            let acciones=aplicarVisibilidadBotones(data);
      },
      clear_detalle()
      {
            var data=
            {
                  sys_pk:0,
                  sys_guid:"",
                  reference:"---",
                  code:"---",
                  notetable:"---",
                  balance:0,
                  orders:[],
                  opacity:.4,
                  pointerEvents:"none"
            }
            this.print_ordenes(data);
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
                  let img=(itm.data_img.img??"")!="" ? itm.data_img.img:"";
                  let def_img=(itm.data_img.def_img??"")!="" ? itm.data_img.def_img:"";

                  // html+=`
			// 	<div class="column-content-foodbev shadow" id="linea_${itm.sys_pk}" onclick="controller.foodbev(this,'',${itm.sys_pk},'${itm.description}')">
			// 			<div class="foodbev-img-container">
			// 				<div class="foodbev-img d-flex">
			// 					<img src="${img}" onerror="this.src='${def_img}'" style="" />								
			// 				</div>							
			// 			</div>
			// 			<div class="foodbev-btn" style="min-height:4.69rem;display:flex;align-items:center;line-height: 1.2rem;font-weight: 500;">
			// 				${itm.description}
			// 			</div>
			// 		</div>`;

                  html+=`
				<div class="card product-card h-100 shadow" id="linea_${itm.sys_pk}" onclick="controller.foodbev(this,'',${itm.sys_pk},'${itm.description}')">
                              <div class="product-image">
                                    <img 
                                          src="${img}" onerror="this.src='${def_img}'"
                                          class="card-img-top"
                                          alt="Producto"
                                    >
                              </div>      
                              <div class="card-body d-flex align-items-center justify-content-center">
                                    <h6 class="product-title text-center mb-0">
                                          ${itm.description}
                                    </h6>
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
      },
      setDataDS(data)
      {
            if(!data)return;
            
            const form=document.getElementById("form_home_delivery");
            if(!form)return;
            
            let element_not_set_val=false;
            for(let k in data)
            {
                  let value=data[k] ?? "";

                  let element=form.querySelector("input[name='"+k+"']");
                  if(!element)element=form.querySelector("textarea[name='"+k+"']");
                  
                  if(!element)continue;
                  
                  element.value="";
                  if(!value && k!="sys_pk")
                  {
                        if(!element_not_set_val)
                        {
                              element_not_set_val=true;
                              element.focus();
                        }
                        continue;
                  }

                  element.value=value;
                  if(!element_not_set_val)element.focus();
            }
      },
      getDataForm(idform="form_home_delivery")
      {
            const form=document.getElementById(idform);
            if(!form)return null;
            
            if(!form.reportValidity())return null;
            
            let data={};
            let formdata=new FormData(form);
            for (const [name, value] of formdata.entries()) {
                  data[name]=value;
            }
            return data;
      },
      setPercentaje(percentaje)
      {
            let percentaje_cortesia=document.getElementById("percentaje_cortesia");
            if(!percentaje_cortesia)return;

            percentaje_cortesia.value=percentaje;
      },
    changeDeliveryDriver(o)
    {
        const repartidor = document.querySelector('#modal-select-repartidor #repartidor');
        const submit = document.querySelector('#modal-select-repartidor #btn-repartidor');

        if (repartidor)
        {
            repartidor.setValue(o);
            submit.click();
        }
    },
    getDestinationByPhone(phone)
    {
        const home_delivery_phone = document.querySelector('#modal-home-delivery input[name="telefono"]');
        if (!phone) phone = home_delivery_phone.value;
        if (!phone) {
            home_delivery_phone.focus();
            return
        }
        let url = "/dmcm/pos/dinner/destino/?telefono="+phone;

        model.invoke_service(url, null,
            function(data) {
                const dmns_destino = document.getElementById('div-dmns-destino');
                const btn_delivery_phone_ok = document.getElementById('btn-delivery-phone-ok');
                const btn_home_delivery_ok = document.getElementById('btn-home-delivery-ok');

                btn_delivery_phone_ok.dataset.mode = "edit";
                btn_delivery_phone_ok.innerHTML = "&nbsp;X&nbsp;";
                home_delivery_phone.readOnly = true;
                dmns_destino.disabled = false;
                btn_home_delivery_ok.disabled = false;
                views.setDataDS(data);

                if (!data) {
                    document.querySelector('#modal-home-delivery input[name="nombre"]')?.focus();
                }
            },
            function(err) { alert(err.message) },
            "GET",
            false
        );
    },
    createBody(data)
    {
      let html="";
      for (let i = 0; i < data.length; i++) 
      {
            const dt = data[i];
            html+=`<tr>`;
            html+=`<td>${dt.sku}</td>`;
            html+=`<td>${dt.description}</td>`;
            html+=`<td>$ ${views.format(dt.price,controller.decimals,".",",")}</td>`;
            html+=`<td>${(dt.validar_existencia ? dt.existencia : "A producir")}</td>`;
            // html+=`<td><button class="btn border" onclick="selectRow(${i})">Seleccionar</button></td>`;
            html+=`</tr>`;
      }

      return html;
    }
};

const ACTION_BUTTONS_PROCESADO=
{
      CORTESIA:"btn-show-cortesia",
      NEW_COMMAND:"new_command"
}

const ACTION_BUTTONS_DS = 
{
      ENVIAR:"btn-enviar",
      ENTREGADA:          'btn-entregada',
      CAMBIAR_REPARTIDOR: 'btn-change-dealer',
      ENVIADA:            'btn-enviada',
};
// IDs de los botones de acción disponibles
const ACTION_BUTTONS = {
  CERRAR:             'imp_close',
  ENVIAR:             'btn-enviar',
  COBRAR:             'btn-cobrar',
  CANCELAR:           'btn-cancelar',
  ENTREGADA:          'btn-entregada',
  CAMBIAR_REPARTIDOR: 'btn-change-dealer',
  ENVIADA:            'btn-enviada',
};

// Constantes de status
const STATUS_ADMIN = {
  NO_APLICA:  0,
  ABIERTO:    1,
  CERRADO:    2,
  PROCESADO:  3,
  CANCELADO:  99,
};

const STATUS_ENTREGA = {
  NO_APLICA:    0,
  POR_ENTREGAR: 1,
  ENTREGADO:    3,
};

// Colores por estado
const ESTADO_COLOR = {
  ABIERTA:              '#2196F3', // Azul
  CERRADA:              '#F44336', // Rojo
  ENVIADA_NO_COBRADA:   '#FFC107', // Amarillo
  COBRADA_SIN_ENVIAR:   '#FF9800', // Naranja
  ENTREGADA_SIN_COBRAR: '#4CAF50', // Verde
  DESCONOCIDO:          '#9E9E9E', // Gris
};

// Definición de estados: color + acciones visibles
const ESTADOS = [
  {
    nombre: 'ABIERTA',
    color: ESTADO_COLOR.ABIERTA,
    match: (sa, se) => sa === STATUS_ADMIN.ABIERTO && se === STATUS_ENTREGA.NO_APLICA,
    acciones: [
      ACTION_BUTTONS.CERRAR,
      ACTION_BUTTONS.ENVIAR,
      ACTION_BUTTONS.COBRAR,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
  {
    nombre: 'CERRADA',
    color: ESTADO_COLOR.CERRADA,
    match: (sa, se) =>
      sa === STATUS_ADMIN.CERRADO &&
      (se === STATUS_ENTREGA.NO_APLICA),
    acciones: [
      ACTION_BUTTONS.ENVIAR,
      ACTION_BUTTONS.COBRAR,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
  {
    nombre: 'ENVIADA_NO_COBRADA',
    color: ESTADO_COLOR.ENVIADA_NO_COBRADA,
    match: (sa, se) => sa === STATUS_ADMIN.CERRADO && se === STATUS_ENTREGA.POR_ENTREGAR,
    // Nota: "en_reparto" no existe en el catálogo oficial; se mapea a PROCESADO (3)
    acciones: [
      // ACTION_BUTTONS.COBRAR,
      ACTION_BUTTONS.ENTREGADA,
      ACTION_BUTTONS.CAMBIAR_REPARTIDOR,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
  {
    nombre: 'COBRADA_SIN_ENVIAR',
    color: ESTADO_COLOR.COBRADA_SIN_ENVIAR,
    match: (sa, se) => sa === STATUS_ADMIN.PROCESADO && se === STATUS_ENTREGA.NO_APLICA,
    acciones: [
      ACTION_BUTTONS.ENVIADA,
      ACTION_BUTTONS.ENTREGADA,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
  {
    nombre: 'COBRADA_ENVIADA',
    color: ESTADO_COLOR.COBRADA_SIN_ENVIAR,
    match: (sa, se) => sa === STATUS_ADMIN.PROCESADO && se === STATUS_ENTREGA.POR_ENTREGAR,
    acciones: [
      // ACTION_BUTTONS.ENVIADA,
      ACTION_BUTTONS.ENTREGADA,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
  {
    nombre: 'ENTREGADA_SIN_COBRAR',
    color: ESTADO_COLOR.ENTREGADA_SIN_COBRAR,
    match: (sa, se) => sa === STATUS_ADMIN.CERRADO && se === STATUS_ENTREGA.ENTREGADO,
    acciones: [
      ACTION_BUTTONS.COBRAR,
      ACTION_BUTTONS.CANCELAR,
    ],
  },
];



/**
 * Resuelve el estado de una fila según StatusAdministrativo y StatusEntrega.
 * @param {number} statusAdmin   - Valor numérico de StatusAdministrativo
 * @param {number} statusEntrega - Valor numérico de StatusEntrega
 * @returns {{ nombre, color, acciones }}
 */
function resolverEstado(statusAdmin, statusEntrega) {
  const estado = ESTADOS.find(e => e.match(statusAdmin, statusEntrega));
  return estado ?? { nombre: 'DESCONOCIDO', color: ESTADO_COLOR.DESCONOCIDO, acciones: [] };
}

/**
 * Aplica visibilidad a los botones del DOM según el estado de la fila.
 * Oculta TODOS los botones primero, luego muestra solo los permitidos.
 * @param {object} rowData - Objeto con los datos de la fila (debe tener StatusAdministrativo y StatusEntrega)
 */
function aplicarVisibilidadBotones(_rowData) 
{
      let rowData=views.keysToLower(_rowData);
      
  const { statusadministrativo, statusentrega } = rowData;
  const { nombre, color, acciones } = resolverEstado(statusadministrativo, statusentrega);

  // 1. Ocultar todos los botones
  Object.values(ACTION_BUTTONS).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = 'none';
  });

  // 2. Mostrar solo los botones permitidos
  acciones.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) 
    {
      btn.classList.remove("disabled");
      btn.style.display = '';
    }
  });

  // 3. Aplicar color de estado (opcional: al contenedor de la fila)
  // Ajusta el selector según tu estructura HTML
  const fila = document.getElementById('fila-orden');
  if (fila) fila.style.borderColor = color;

//   console.log(`Estado resuelto: ${nombre} | Color: ${color} | Acciones: ${acciones.join(', ')}`);
  return { nombre, color, acciones };
}


//productos variables
// CONFIGURACIÓN
let min = 1;
let max = 1;

// DATA SIMULADA
const data = {
//     grupo1: [
//         {codigo: "p1", nombre: "Producto 1"},
//         {codigo: "p2", nombre: "Producto 2"}
//     ],
//     grupo2: [
//         {codigo: "p3", nombre: "Producto 3"},
//         {codigo: "p4", nombre: "Producto 4"}
//     ]
};

// ESTADO
let grupoActual = null;
let productoSeleccionado = null;

// ESTRUCTURA FINAL
let seleccion = {};
let _grupos=[];
// RENDER GRUPOS

function printGrupo(grupos)
{
      _grupos=grupos;
      const contGrupos = document.getElementById("grupos");
      const cont = document.getElementById("productos");
      cont.innerHTML="";
      contGrupos.innerHTML="";
      grupoActual=null;
      productoSeleccionado=null;
      seleccion = {};
      minmaxgrupos={};

      for (let i = 0; i < grupos.length; i++) 
      {
            const grupo = grupos[i];
            if(grupo.productos.length >0)
            {
                  const btn = document.createElement("div");
                  btn.className = "btn btn-grupo";
                  btn.style.cssText="border: 1px solid gray !important;";
                  btn.innerText =grupo.descripcion??grupo.nombre;
                  btn.id="group_"+grupo.sys_pk;
                  
                  if (!seleccion[grupo.grupo]) seleccion[grupo.grupo] = new Map();

                  btn.onclick = () => 
                  {
                        // quitar selección previa
                        document.querySelectorAll('.btn-grupo').forEach(btn => 
                        {
                              btn.classList.remove('activo');
                        });

                        // marcar el actual
                        btn.classList.add('activo');
                        cargarGrupo(grupo);
                  }
                  if(i==0)btn.click();
                  contGrupos.appendChild(btn);
            }
      }
}


// CARGAR PRODUCTOS
function cargarGrupo(data_grupo) 
{
      if(!visible && btnToggle)btnToggle.click();

      let grupo=data_grupo.grupo;
    grupoActual = grupo;
    min=data_grupo.minimo??1;
    max=data_grupo.maximo??1;
    minmaxgrupos[grupo]=
    {
      min:min,
      max:max
    };
    data[grupo]=data_grupo.productos;
//     if (!seleccion[grupo]) seleccion[grupo] = {};

    const cont = document.getElementById("productos");
    cont.className = "d-flex flex-wrap gap-3";
    cont.innerHTML = "";

    data_grupo.productos.forEach(prod => {
        const btn = document.createElement("div");
        btn.className = "btn";
        btn.style.cssText = `
        padding: 1rem .5rem !important;
        font-size: 1.25rem !important;
        border-radius: .3rem !important;
        border: 1px solid gray !important;
        `;
        btn.innerText = prod.description;

        btn.onclick = () => agregarProducto(prod);
        cont.appendChild(btn);
    });

    renderTabla();
}

// AGREGAR PRODUCTO
function agregarProducto(prod) 
{
    productoSeleccionado = prod.sys_pk;
      
      if(seleccion[grupoActual] && !validarCantidad())
      {
            return ;
      }
//     if (!seleccion[grupoActual][prod.sys_pk]) 
//       {
//         seleccion[grupoActual][prod.sys_pk] = min;
//     }
      if (!seleccion[grupoActual].has(prod.sys_pk)) 
      {
        seleccion[grupoActual].set(prod.sys_pk,1);//min
    }
    else cambiarCantidadProducto(productoSeleccionado, 1);
    
    renderTabla();
}

// RENDER TABLA
function renderTabla() {
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    if (!grupoActual) return;

//     Object.entries(seleccion[grupoActual]).forEach(([sys_pk, cantidad]) => 
      seleccion[grupoActual].forEach((cantidad, sys_pk) => 
      {
        const prod = data[grupoActual].find(p => Number(p.sys_pk) === Number(sys_pk));
        
        if(!prod)return;
            
        const tr = document.createElement("tr");
            tr.style.cssText="border: 1px solid black;"
      //   tr.onclick = () => productoSeleccionado = sys_pk;

        tr.innerHTML = `
            <td data-label="Producto">${prod.description}</td>
            <td data-label="Cantidad">
                <button onclick="cambiarCantidadProducto(${sys_pk}, -1)">➖</button>
                ${cantidad}
                <button onclick="cambiarCantidadProducto(${sys_pk}, 1)">➕</button>
                <button onclick="eliminarProducto(${sys_pk})">🗑</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// CAMBIAR CANTIDAD

function cambiarCantidadProducto(codigo, delta) 
{
      if(delta > 0 && !validarCantidad())
      {
            return ;
      }
//     let actual = seleccion[grupoActual][codigo];
    let actual = seleccion[grupoActual].get(codigo);
    let nueva = actual + delta;

    if (nueva > max) nueva = max;
    if (nueva < min) nueva = min;

//     seleccion[grupoActual][codigo] = nueva;
    seleccion[grupoActual].set(codigo,nueva);

    renderTabla();
}
function eliminarProducto(sys_pk) 
{
    if (!grupoActual) return;

    const grupo = seleccion[grupoActual];

    if (!(grupo instanceof Map)) return;

    grupo.delete(sys_pk);

    renderTabla();
}
function validarCantidad() 
{
    const grupo = seleccion[grupoActual];

    // cantidad de productos distintos en el grupo
    const totalItemsGrupo = grupo.size;

    // suma total de cantidades en todos los grupos
    const total = totalCantidad(seleccion,grupoActual);

    if (totalItemsGrupo === max || total >= max) {
        alert("No se puede agregar más elementos de este grupo, si desea realizar un cambio elimine o disminuya la cantidad de algunos elementos y vuelva a intentarlo");
        return false;
    }

    return true;
}
function totalCantidad(seleccion, grupoActual = null,validatebygroup=false) 
{
    let total = 0;

    // 🔹 Si viene un grupo válido
    if (grupoActual && seleccion[grupoActual] instanceof Map) {
        seleccion[grupoActual].forEach(cantidad => {
            total += cantidad;
        });

        return total;
    }
    
      for (const [grupoId, grupo] of Object.entries(seleccion)) 
      {
            if (!(grupo instanceof Map)) continue;

            let total_grupo = 0;

            for (const cantidad of grupo.values()) {
                  total += cantidad;
                  total_grupo += cantidad;
            }

            // 🔹 aquí YA tienes el grupo
            if (validatebygroup) {
                  const g = _grupos.find(g => Number(g.grupo) === Number(grupoId));

                  if (!g) continue;
                  // console.log("Grupo:", grupoId, "Total:", total_grupo, "Config:", g);

                  // aquí puedes validar contra min/max del grupo
                  // ejemplo:
                  if (g.minimo && total_grupo < g.minimo ) 
                  {
                        let btn_group=document.getElementById("group_"+g.sys_pk);
                        if(btn_group)btn_group.click();
                        alert(`La cantidad de elementos del grupo: ${g.descripcion} debe estar entre ${g.minimo} y ${g.maximo}`);
                        return -1;
                  }
            }
      }

    return total;
}

// Tiempo de inactividad en ms (3 minutos por default)
// Configuración en segundos
views.interval_refresh_data_tables = 0; // 3 minutos = 180 segundos

// Guardamos el último momento de actividad
views.lastActivity = Date.now();

// Función para resetear actividad
function resetActivity() {
  views.lastActivity = Date.now();
}

// Eventos de actividad
["mousemove", "touchmove", "pointerdown", "keydown"].forEach(event => {
  window.addEventListener(event, resetActivity, { passive: true });
});

views.InitInterval=()=> 
{
      // Convertir a milisegundos cuando se usa
      const intervalMs = views.interval_refresh_data_tables * 1000;
      // Intervalo que revisa cada cierto tiempo (ej: cada 5 segundos)
      if(views.interval_refresh_data_tables  > 0)
      {     
            views.set_interval_table = setInterval(() => 
            {
                  const now = Date.now();
                  const inactiveTime = now - views.lastActivity;
                        // console.log("revisando...",inactiveTime)
                  if (inactiveTime >= intervalMs) {
                        console.log("Ejecutar refresh porque el usuario está inactivo");

                        // 👉 Aquí tu lógica
                        // refreshDataTables();
                        views.clear_detalle();
                        controller.resfresh_tables();

                        // Opcional: evitar que se ejecute muchas veces seguidas
                        views.lastActivity = Date.now();
                  }

            }, 5000); // revisa cada 5 segundos
      }
}


//boton togle productos
const btnToggle = document.getElementById("toggleProductos");
const contProductos = document.getElementById("contenedorProductos");
const tabla = document.querySelector(".tabla");

let visible = true;

if(btnToggle)btnToggle.addEventListener("click", () => {
    visible = !visible;

    if (!visible) {
        contProductos.classList.add("oculto");
        tabla.classList.add("full");
        btnToggle.innerText = "➡ Mostrar";
    } else {
        contProductos.classList.remove("oculto");
        tabla.classList.remove("full");
        btnToggle.innerText = "⬅ Ocultar";
    }
});
//tabla para productos seleccionable
let selectedIndex = -1;
// data_foodbev=[];
// Seleccionar primera fila
// selectRow(selectedIndex);

function selectRow(index) 
{
      var rows = document.querySelectorAll('#table-products-selected tbody tr');
      rows.forEach(row => {
            row.classList.remove('selected');
      });

      rows[index].classList.add('selected');
      // Scroll automático
      rows[index].scrollIntoView({
            block: 'nearest'
      });
}

document.addEventListener('keydown', function(event) 
{
      var rows = document.querySelectorAll('#table-products-selected tbody tr');
      if(!rows || rows.length < 1)return;
      
      // Flecha abajo
      if (event.key === 'ArrowDown') {

            if (selectedIndex < rows.length - 1) {
                  selectedIndex++;
                  selectRow(selectedIndex);
            }

      }

      // Flecha arriba
      if (event.key === 'ArrowUp') 
      {
            if (selectedIndex > 0) 
            {
                  selectedIndex--;
                  selectRow(selectedIndex);
            }
      }

      // Enter
      if (event.key === 'Enter') 
      {
            const row = rows[selectedIndex];

            const id = row.cells[0].innerText;
            const nombre = row.cells[1].innerText;
            
            let _row=data_foodbev[selectedIndex];
            controller.select_foodbev(_row);
      }

});

// Selección con mouse
function selectedMouse()
{
      var rows = document.querySelectorAll('#table-products-selected tbody tr');
      if(rows)rows.forEach((row, index) => 
      {

            row.addEventListener('click', function() {

                  selectedIndex = index;

                  // selectRow(selectedIndex);
                  let _row=data_foodbev[index];
                  controller.select_foodbev(_row);

            });

            // Doble click
            row.addEventListener('dblclick', function() 
            {
                  let _row=data_foodbev[index];
                  controller.select_foodbev(_row);
            });
      });
}

//activar vconsole
// ======= para test desde android=============================
// Inicializa vConsole
const vConsole = new window.VConsole({
      theme: "dark",

      // Oculta el botón flotante verde
      disableLogScrolling: false,

      onReady() 
      {
            // Oculta el switch flotante
            const switchBtn = document.querySelector("#__vconsole .vc-switch");
            
            if (switchBtn) {switchBtn.style.display = "none";}

            // También puedes ocultar todo inicialmente
            vConsole.hide();
      }
});

// Función para mostrarlo
// Nombre de la llave
const DEBUG_KEY = "debug_enabled";
let debugVisible =localStorage.getItem(DEBUG_KEY) === "true";
// ABRIR DEBUG
function abrirDebug(show_vconsole=true)
{
      // Mostrar panel
      if(show_vconsole)vConsole.show();

      // Mostrar botón verde
      const btn = document.querySelector(".vc-switch");

      if (btn) 
      {
            btn.style.display = "block";
            btn.innerHTML = `
                  <span style="font-size:20px;">🛠️</span>
            `;
      }
}


// CERRAR DEBUG
function cerrarDebug()
{
      // Ocultar panel
      vConsole.hide();

      // Ocultar botón verde
      const btn = document.querySelector(".vc-switch");

      if (btn) {btn.style.display = "none";}
}
      // TOGGLE DEBUG
function toggleDebug(show_vconsole=true)
{
      debugVisible = !debugVisible;

      // Guardar estado
      localStorage.setItem(DEBUG_KEY, debugVisible);

      if (debugVisible)abrirDebug(show_vconsole);
      else cerrarDebug();
}

/**
 * Ajusta el alto de un elemento destino tomando en cuenta
 * el espacio ocupado por los hijos directos de un contenedor padre.
 *
 * @param {string} parentId   ID del elemento padre
 * @param {string} targetId   ID del elemento que tendrá el alto restante
 */
function setRemainingHeight(parentId, targetId)
{
    const parent = document.getElementById(parentId);
    const target = document.getElementById(targetId);

    if (!parent || !target)
    {
        return;
    }

    // Obtener hijos directos del padre
    const children = Array.from(parent.children);

    let usedHeight = 0;

    children.forEach(child =>
    {
        // Ignorar el elemento destino
        if (child.id === targetId) return;
      
        const rect = child.getBoundingClientRect();
        // Altura total incluyendo márgenes
        const style = window.getComputedStyle(child);

        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;

        usedHeight += rect.height + marginTop + marginBottom;
    });

    // Altura disponible del padre
    const parentRect = parent.getBoundingClientRect();

    const parentStyle = window.getComputedStyle(parent);

    const paddingTop = parseFloat(parentStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(parentStyle.paddingBottom) || 0;

    const availableHeight =
        parentRect.height -
        usedHeight -
        paddingTop -
        paddingBottom;

    // Aplicar alto restante
    target.style.height = `${Math.max(0, availableHeight)}px`;
}

setTimeout(()=>
{
      if(debugVisible)abrirDebug(false);
      // setRemainingHeight("container-all","container-main");
      setRemainingHeight("container-info-orders","table_orders_details");
},800);

// Opcional: recalcular al redimensionar
window.addEventListener("resize", () =>
{
    setRemainingHeight("container-info-orders","table_orders_details");
});

