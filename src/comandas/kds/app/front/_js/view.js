var views=
{
	InitInterval(){},
	print_commands:function(data,auto=false,classid="content-commands",ishistory=false,isdetails=false) 
	{
		if(!classid.includes(".") && !classid.includes("#"))classid="."+classid;
		var element=document.querySelector(classid);
		if(!element)return;
		var html="";
		for (var i = 0; i < data.length; i++) 
		{
			var itm=data[i];

			var tmr=document.getElementById(`clock${itm.id_orden.replace(/ /g,"")}`);
			views.remove_command(itm.sys_pk);

			var orders=itm.orders;
			var dventas=itm.dventas ??[];
			var list_orders="";
			const resultado =orders;
			for (var j=0; j < resultado.length; j++) 
			{
				var data_orders=resultado[j];

				if(data_orders.pkorden>last_sys_pk && !ishistory)
					last_sys_pk=data_orders.pkorden;
				
				var adcs=data_orders.adds??[];
				var hadcs="";
				let last_adic="";
				for (var a =0; a<adcs.length; a++) 
				{
					var adds=adcs[a];
					
					if(adds.is_variable && !hadcs.includes("@__vars__"))
					{
						hadcs+=`<br><span class="fw-bold datails-adcs w-100 d-block" id="@__vars__">Variables</span>`;
						last_adic="vars";
					}
					else if((last_adic == "vars" || last_adic=="") && !adds.is_variable)
					{
						hadcs+=`<span class="fw-bold datails-adcs w-100 d-block" id="@__adics__">Adicionales</span>`;
						last_adic="adics";
					}

					hadcs+=`<div class="datails-adcs">
							<small class="adcs">${adds.cantidad??1} - ${adds.descripcion}</small>
						</div>`;
				}
				list_orders+=`<div class="details">
						<label class="w-100">${data_orders.quantity} ${data_orders.description}</label>
						<small class="order-time">${controller.lifetime(data_orders.tiempo)}</small>

						${hadcs}

						<div class="order-notes"> 
								<small class="notes-adcs">${(data_orders.notes??"").trim()!=""?`<span class="fw-bold">Indicaciones</span><br>${data_orders.notes.trim()}`:""}</small>
						</div>

					</div>`;
			}
			var btn=`<button class="btn-kds "  onclick="controller.do_command(${itm.pkorden})">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
				  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
				</svg>
			Hecho
			</button>`;
			//var uuid=controller.guid();
			let h=obtenerTiempoTranscurrido(itm.created);

			var hour=`<h3 id="clock${itm.id_orden.replace(/ /g,"")}">${(h.dias>0?h.dias+"D ":"")}${h.horas} : ${h.minutos} : ${h.segundos}</h3>`;
			
			if(ishistory)
			{
				btn=`<button class="btn-kds "  onclick="controller.return_command(${itm.pkorden})">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
					  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
					  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
					</svg>
				
				Devolver
				</button>`;
				hour="";
			}
			if(isdetails)btn="";
			html+=`<div class="c-command c-command_${itm.pkorden}" id="c-command_${itm.pkorden}">
			${isdetails?`<small class="fw-bold" style="background: lightgray;">${itm.cp_description??""}</small>`:""}
			<div class="cmmd-table"><span class="fw-bold">Referencia:</span> <span>${itm.id_orden??""} ${isdetails && itm.atendido?"<small style='background: greenyellow;'>(Completado)</small>":""}</span></div>
			<div class="cmmd-table ${isdetails?"d-none":""}"><span class="fw-bold">Cuenta:</span> ${itm.code}</div>
			<div class="cmmd-ticket ${isdetails?"d-none":""}"><span class="fw-bold">Ticket:</span> ${itm.reference}</div>
			<div class="cmmd-numorder"><span class="fw-bold">Num. Orden:</span> ${itm.pkorden}</div>
			<div class="cmmd-ticket">${itm.created}</div>
			<div class="cmmd-ticket">${itm.served?itm.served:""}</div>
			<div class="ctn-h">
				<div class="order-hours">
					${hour}
				</div>
				${btn}
			</div>
			========================================
			<div class="cmmd-body">
				<div class="cmmd-details">
					${list_orders}
				</div>
			</div>
		</div>`;
			
			if(!tmr)
				controller.startTime(h.segundos,h.minutos,h.horas,`clock${itm.id_orden.replace(/ /g,"")}`,h.dias);
		}
		if(auto)
			element.innerHTML+=html;
		else
			element.innerHTML=html;
	},
	printDventas(dventas,id_element,auto=false,title="Artículos")
	{
		if(!dventas || !id_element || dventas.length < 1)return;

		let element=document.querySelector(id_element);
		if(!element)return;

		let html="";
		let html_det="";
		for (let i = 0; i < dventas.length; i++) 
		{
			const dv = dventas[i];
			html_det+=`<label class="fw-100">${dv.quantity} ${dv.description}</label>`
		}

		html += `<div class="c-command c-command_165" id="c-command_165">
			<div class="cmmd-table fw-bold text-center"><h4>${title}</h4></div>
			========================================
			<div class="cmmd-body">
				<div class="cmmd-details">
					<div class="details">
						${html_det}
					</div>
				</div>
			</div>
		</div>`

		if(!auto)element.innerHTML=html;
		else element.innerHTML+=html;
	},
	remove_command:function(sys_pk)
	{
		var element=document.querySelector("#c-command_"+sys_pk);
		if(element){
			element.remove();
		}
	},
	show_modal:function(idmodal)
	{
		var element=document.querySelector("#"+idmodal);
		if(element)
			element.classList.remove("hidde_control");
	},
	close_modal:function(idmodal)
	{
		var element=document.querySelector("#"+idmodal);
		if(element)
			element.classList.add("hidde_control");
	},
	print_label_pedidos:function()
	{
		var t =document.querySelectorAll("#content-commands > .c-command");
		var element=document.querySelector("#caption-ordersAll");
		if(element)
			element.innerHTML=t.length + " Pedidos";
	},
	print_select:function(idselect,data)
	{
		var select=document.querySelector("#"+idselect);
		var html="";
		for (var i = 0; i < data.length; i++) {
			var itm=data[i];
			html+=`<option value="${itm.sys_pk}">${itm.descripcion}</option>`;
		}
		if(select && html!="")
			select.innerHTML=html;
	}
}

/**
 * Recibe una fecha de creación en cadena
 * y calcula el tiempo transcurrido hasta ahora.
 *
 * Formatos soportados:
 * 2026-05-13 10:30:00
 * 2026/05/13 10:30:00
 * 2026-05-13T10:30:00
 */
/**
 * Devuelve el tiempo transcurrido desde una fecha dada
 * hasta la fecha actual.
 *
 * @param {String} fechaCreacionStr
 * @returns {Object}
 */
function obtenerTiempoTranscurrido(fechaCreacionStr) 
{

    // Normalizar fecha
    const fechaNormalizada = fechaCreacionStr
        .replace(/-/g, '/')
        .replace('T', ' ');

    const fechaCreacion = new Date(fechaNormalizada);

    if (isNaN(fechaCreacion.getTime())) {
        return null;
    }

    const ahora = Date.now();

    let diferencia = ahora - fechaCreacion.getTime();

    if (diferencia < 0) {
        diferencia = 0;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    return {
        dias,
        horas:String(horas).padStart(2, '0'),
        minutos:String(minutos).padStart(2, '0'),
        segundos:String(segundos).padStart(2, '0'),
        texto:
            `${dias}d ` +
            `${String(horas).padStart(2, '0')}:` +
            `${String(minutos).padStart(2, '0')}:` +
            `${String(segundos).padStart(2, '0')}`
    };
}