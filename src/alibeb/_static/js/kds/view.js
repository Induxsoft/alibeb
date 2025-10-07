var views={
	
	print_cprods:function(data) {
		var html="";
		var elemt=document.querySelector(".tbody-list-cprod");

		for (var i = 0; i< data.length; i++) {
			var itm=data[i];
			html+=`<tr class="row_cprod" id="cprod_${itm.sys_pk}" onclick="controller.get_datacprod(${itm.sys_pk})">
				<td>${itm.codigo} ${itm.descripcion}</td>
				<td class="td_delete_cprod" onclick="controller.delete_cprod(${itm.sys_pk},event)">
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
				  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
				  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
				</svg>
				</td>
			</tr>`;
		}
		elemt.innerHTML=html;
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
	datacprods:function(sys_pk)
	{
		var row_selected=document.querySelector("#cprod_"+sys_pk);
		var cprods=document.querySelectorAll(".tbody-list-cprod tr");
		cprods.forEach(function (element,index) {
			element.classList.remove("cprod-selected");
		})
		row_selected.classList.add("cprod-selected");

		var codigo=document.querySelector("#cprod_codigo");
		var descripcion=document.querySelector("#cprod_descripcion");
		var almcmt=document.querySelector("#cprod_amacenmp");
		var almcpt=document.querySelector("#cprod_amacenpt");
		var elemsys_pk=document.querySelector("#cprod_sys_pk");
		var seg_act=document.querySelector("#seg_act");

		for (var i = 0; i < list_cprods.length; i++) {
			var itm=list_cprods[i];

			if(itm.sys_pk===sys_pk)
			{
				elemsys_pk.value=itm.sys_pk;
				codigo.value=itm.codigo;
				descripcion.value=itm.descripcion;
				almcmt.value=itm.almacenmp;
				almcpt.value=itm.almacenpt;
				seg_act.value=itm.shortpool;
				views.hide_controls("btnaction,btncancelar");
				views.show_controls("btnmodifi",function(e,sys_pk){
					e.setAttribute("onclick",`controller.modify(${sys_pk},${itm.fieldexist})`);
				},itm.sys_pk);
				break;
			}
		}
	},
	hide_controls:function(id)
	{
		var split=id.split(",");
		for (var i = 0; i < split.length; i++) {
			var elm=document.querySelector("#"+split[i]);
			if(elm)
				elm.classList.add("hidden");
		}
	},
	show_controls:function(id,event,sys_pk=0)
	{
		var split=id.split(",");
		for (var i = 0; i < split.length; i++) {
			var elm=document.querySelector("#"+split[i]);
			if(elm){
				elm.classList.remove("hidden");
				if(event)
					event(elm,sys_pk);
			}
		}
	},
	tab_pointer_events:function(enabled=false)
	{
		var tab=document.querySelector(".tab-content");
		if(enabled)
			tab.style.pointerEvents="";
		else
			tab.style.pointerEvents="none";
	},
	new_cprod:function()
	{
		var codigo=document.querySelector("#cprod_codigo");
		var descripcion=document.querySelector("#cprod_descripcion");
		var almcmt=document.querySelector("#cprod_amacenmp");
		var almcpt=document.querySelector("#cprod_amacenpt");
		var elemsys_pk=document.querySelector("#cprod_sys_pk");

		var pwdbefore=document.querySelector("#pwdbefore");
		var pwd=document.querySelector("#pwd");
		var pwdconfirm=document.querySelector("#pwdconfirm");
		var seg_act=document.querySelector("#seg_act");
		var tab=document.querySelector("#nav-tabContent");
		tab.style.pointerEvents="";

		seg_act.value="0";
		codigo.value="<A>";
		descripcion.value="";
		almcpt.selectedIndex=0;
		almcmt.selectedIndex=0;
		elemsys_pk.value="";

		pwdbefore.value="";
		pwd.value="";
		pwdconfirm.value="";
		codigo.focus();
	},
	change_pwd:function(iscancel=false)
	{
		var change_pwd=document.querySelector("#btnchangepwd");
		var field=document.querySelector(".fieldchangepwd");

		if(iscancel)
		{
			change_pwd.innerHTML="Editar";
			field.classList.add("disabled");
			change_pwd.setAttribute("onclick","views.change_pwd()");
			pwd_iswritted=false;
		}else{
			change_pwd.innerHTML="Cancelar";
			field.classList.remove("disabled");
			change_pwd.setAttribute("onclick","views.change_pwd(true)");
			pwd_iswritted=true;
		}
	}
}