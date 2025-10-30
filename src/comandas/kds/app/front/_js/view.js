var views={
	print_commands:function(data,auto=false,classid="content-commands",ishistory=false) {
		var element=document.querySelector("."+classid);
		var html="";
		for (var i = 0; i < data.length; i++) {
			var itm=data[i];

			var tmr=document.getElementById(`clock${itm.reference.replace(/ /g,"")}`);
			views.remove_command(itm.sys_pk);

			var orders=itm.orders;
			var list_orders="";
			for (var j=0; j < orders.length; j++) {
				var data_orders=orders[j];

				if(data_orders.pkorden>last_sys_pk && !ishistory)
					last_sys_pk=data_orders.pkorden;
				
				var adcs=data_orders.adds;
				var hadcs="";
				for (var a =0; a<adcs.length; a++) {
					var adds=adcs[a];
					hadcs+=`<div class="datails-adcs">
							<small class="adcs">${adds.descripcion}</small>
						</div>`;
				}
				list_orders+=`<div class="details">
						<label>${data_orders.quantity} ${data_orders.description}
							<small class="order-time">${controller.lifetime(data_orders.tiempo)}</small>
							<div class="order-notes"> 
								<small class="notes-adcs">${data_orders.notes}</small>
							</div>
						</label>
						${hadcs}
					</div>`;
			}
			var btn=`<button class="btn-kds "  onclick="controller.do_command(${itm.sys_pk})">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
				  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
				</svg>
			Hecho
			</button>`;
			//var uuid=controller.guid();
			var hour=`<h3 id="clock${itm.reference.replace(/ /g,"")}">00 : 00 : 00</h3>`;

			if(ishistory){
				btn=`<button class="btn-kds "  onclick="controller.return_command(${itm.sys_pk})">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
					  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
					  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
					</svg>
			
			Devolver
			</button>`;
			hour="";
			}
			html+=`<div class="c-command c-command_${itm.sys_pk}" id="c-command_${itm.sys_pk}">
			<div class="cmmd-table">Mesa: ${itm.code}</div>
			<div class="cmmd-ticket">Ticket: ${itm.reference}</div>
			<div class="cmmd-numorder">Num. Orden: ${itm.pkorden}</div>
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
				controller.startTime(0,0,0,`clock${itm.reference.replace(/ /g,"")}`);
		}
		if(auto)
			element.innerHTML+=html;
		else
			element.innerHTML=html;
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