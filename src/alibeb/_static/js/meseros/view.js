var views={
	list_waiters:function(data) {
		var waiters=document.querySelector(".tbody-list-waiters");
		var html="";
		for (var i = 0; i <data.length; i++) {
			var itm=data[i];
			html+=`<tr class="row_waiter" id="waiter_${itm.sys_pk}" onclick="controller.getdata_waiter(${itm.sys_pk})">
				<td>${itm.nombre}</td>
				<td class="td_delete_waiter" onclick="controller.delete_waiter(${itm.sys_pk},event)">
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
				  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
				  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
				</svg>
				</td>
			</tr>`;
		}
		waiters.innerHTML=html;
	},
	data_waiter:function(data) {
		var codigo=document.querySelector("#waiter_codigo");
		var nombre=document.querySelector("#waiter_nombre");
		var telefono=document.querySelector("#waiter_telefono");
		var notas=document.querySelector("#waiter_notas");
		var email=document.querySelector("#waiter_email");
		var sys_pk=document.querySelector("#waiter_sys_pk");

		var btnmodif=document.querySelector("#btnmodifi");
		var btnaction=document.querySelector("#btnaction");
		var btncancel=document.querySelector("#btncancelar");

		var selectcc=document.querySelector("#selectcc");
		var selectzn=document.querySelector("#selectzn");
		var accessmovil=document.querySelector("#accessmovil");

		codigo.value=data.codigo;
		nombre.value=data.nombre;
		telefono.value=data.telefono;
		notas.value=data.notas;
		email.value=data.email;
		sys_pk.value=data.sys_pk;


		selectcc.value=data.cc;
		selectzn.value=data.zn;
		if(data.cc<=0)
			selectcc.selectedIndex=0;
		if(data.zn<=0)
			selectzn.selectedIndex=0;

		accessmovil.checked=data.access_movil;

		btnmodif.classList.remove("hidden");
		// btncancel.classList.remove("hidden");
		btnaction.classList.add("hidden");
		btnaction.setAttribute("onclick",`controller.modif_waiter(${data.sys_pk},this)`);
		// btnmodif.innerHTML="Modificar";
		 btnmodif.setAttribute("onclick",`controller.active_modif(${data.sys_pk},this)`);
		 btncancel.click();
	},
	data_select:function(idselect,data)
	{
		var select=document.querySelector("#"+idselect);
		var options="";

		for (var i =0; i <data.length; i++) {
			var itm=data[i];
			options+=`<option value="${itm.sys_pk}">${itm.descripcion ?? itm.id}</option>`;
		}
		select.innerHTML=options;

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
	add_waiter:function()
	{
		var codigo=document.querySelector("#waiter_codigo");
		var nombre=document.querySelector("#waiter_nombre");
		var telefono=document.querySelector("#waiter_telefono");
		var notas=document.querySelector("#waiter_notas");
		var email=document.querySelector("#waiter_email");
		var sys_pk=document.querySelector("#waiter_sys_pk");

		var btnaction=document.querySelector("#btnaction");
		var btncancel=document.querySelector("#btncancelar");
		var btnmodif=document.querySelector("#btnmodifi");

		var selectcc=document.querySelector("#selectcc");
		var selectzn=document.querySelector("#selectzn");
		var accessmovil=document.querySelector("#accessmovil");

		var general=document.querySelector("#general");

		general.click();
		nombre.focus();
		codigo.value="<A>";
		nombre.value="";
		telefono.value="";
		notas.value="";
		email.value="";
		sys_pk.value="";

		accessmovil.checked=false;
		selectzn.selectedIndex=0;
		selectcc.selectedIndex=0;
		btncancel.click();
		btnaction.innerHTML="Agregar";
		btnaction.classList.remove("hidden");
		btnmodif.classList.add("hidden");
		btnaction.setAttribute("onclick",`controller.add_datawaiter("",this)`);


	}

}