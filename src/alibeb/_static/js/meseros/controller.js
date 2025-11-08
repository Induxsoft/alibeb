var fromservice=false;
var list_waiters=[];
var controller={
	get_waiters:function (selectwaiter="") 
	{
		var uri=url+"?entity=waiters";
		if(selectwaiter!=""){uri+="?access=true"}
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
	get_ccs:function(idselect) 
	{
		var uri=url+"?entity=ccs";
		model.invoke_service(uri,null,
			function(data)
			{
				views.data_select(idselect,data);
			}
			,function(error){alert(error.message);}
			,"GET",false);
	},
	get_zns:function(idselect)
	{
		var uri=url+"?entity=zns";
		model.invoke_service(uri,null,
			function(data)
			{
				views.data_select(idselect,data);
			}
			,function(error){alert(error.message);}
			,"GET",false);
	},
	getdata_waiter:function(sys_pk)
	{
		var tab=document.querySelector(".tab-content");
		var row_selected=document.querySelector("#waiter_"+sys_pk);
		var waiters=document.querySelectorAll(".tbody-list-waiters tr");
		waiters.forEach(function (element,index) {element.classList.remove("waiter-selected");});

		row_selected.classList.add("waiter-selected");
		if(fromservice)
		{
			var uri=url+`?entity=waiters/?waiter=${sys_pk}`;
			model.invoke_service(uri,null,
			function(data)
			{
				views.data_waiter(data);
			}
			,function(error){alert(error.message);}
			,"GET",false);
		}
		else
		{
			for (var i = 0; i< list_waiters.length; i++) 
			{
				var itm=list_waiters[i];
				if(itm.sys_pk===sys_pk)
				{
					views.data_waiter(itm);
					break;
				}
			}
		}
		tab.style.pointerEvents="none";
	},
	delete_waiter:function(sys_pk,e)
	{
		e.stopPropagation()
		var res=confirm("¿Esta seguro de eliminar el mesero?")
		if(!res)
			return;

		var uri=url+`?entity=waiters&waiter=${sys_pk}`;
		model.invoke_service(uri,null,
			function(data)
			{
				list_waiters=data;
				views.list_waiters(data);
			}
			,function(error){alert(error.message);}
			,"PUT",false);
	},
	add_waiter:function()
	{
		views.add_waiter();
		var tab=document.querySelector(".tab-content");
		 tab.style.pointerEvents="";
		 var btncancelpwd=document.querySelector("#btnchangepwd");
		 btncancelpwd.click();
	},
	modif_waiter:function(sys_pk,e)
	{
		var params=`?waiter=${sys_pk}`;
		controller.add_datawaiter(params,e,sys_pk);
	},
	active_modif:function(sys_pk,e)
	{
		views.SetRotulo("edit");
		var btnmodif=document.querySelector("#btnaction");
		btnmodif.classList.remove("hidden");
		btnmodif.innerHTML="Aceptar";
		var cancel=document.querySelector("#btncancelar");
		cancel.classList.remove("hidden");
		 cancel.setAttribute("onclick",`controller.cancel_modif(this)`);
		 e.classList.add("hidden");

		 var tab=document.querySelector(".tab-content");
		 tab.style.pointerEvents="";
	},
	add_datawaiter:function(params="",e,sys_pk="")
	{
		var codigo=document.querySelector("#waiter_codigo");
		var nombre=document.querySelector("#waiter_nombre");
		var telefono=document.querySelector("#waiter_telefono");
		var notas=document.querySelector("#waiter_notas");
		var email=document.querySelector("#waiter_email");

		var access_m=document.querySelector("#accessmovil");
		var selectcc=document.querySelector("#selectcc");
		var selectzn=document.querySelector("#selectzn");

		var pwdbefore=document.querySelector("#pwdbefore");
		var pwd=document.querySelector("#pwd");
		var pwdconfirm=document.querySelector("#pwdconfirm");

		var btn=document.querySelector("#"+e.id);

		if(selectcc.value=="")
		{
			alert("El Centro de Consumo es requerido.");
			return;
		}
		
		if(selectzn.value=="")
		{
			alert("La zona es requerida.");
			return;
		}

		if(codigo.value=="")
		{
			alert("El código es requerido.");
			return;
		}
		if(nombre.value=="")
		{
			alert("El nombre es requerido.");
			return ;
		}

		if(pwd.value!=pwdconfirm.value)
		{
			alert("La contraseña no coinciden.");
			return;
		}
		var changepwd=false;
		if(pwd.value!="" && pwdconfirm!=""){changepwd=true;}
		btn.classList.add("disabled");
		var uri=url+`?entity=waiters${params.replaceAll("?","&")}`;
		var data={
			code:codigo.value,
			email:email.value,
			name:nombre.value,
			notes:notas.value,
			telephone:telefono.value,
			access_m:access_m.checked,
			cc:selectcc.value,
			zn:selectzn.value,
			pwdbefore:pwdbefore.value,
			pwd:pwd.value,
			cofig_expiracion:cofig_expiracion,
			changepwd:changepwd
		}

		model.invoke_service(uri,data,
			function(data)
			{
				btn.classList.remove("disabled");
				list_waiters=data;
				views.list_waiters(data);
				var newbtn=document.querySelector("#btnnewaiter");
				newbtn.click();
				// if(sys_pk!="")
				// {
				// 	var row=document.querySelector("#waiter_"+sys_pk);
				// 	row.click();
				// }else{
					
				// }
			}
			,function(error){
				btn.classList.remove("disabled",false);
				alert(error.message);
			}
			,"POST",false);
	},
	cancel_modif:function(e)
	{
		views.SetRotulo("waiter");

		var btnmodif=document.querySelector("#btnmodifi");
		var btnaction=document.querySelector("#btnaction");
		var btncancel=document.querySelector("#btncancelar");

		btnmodif.classList.remove("hidden");
		e.classList.add("hidden");
		btnaction.classList.add("hidden");

		var tab=document.querySelector(".tab-content");
		 tab.style.pointerEvents="none";

		 var btncancelpwd=document.querySelector("#btnchangepwd");
		 if(btncancelpwd.innerHTML=="Cancelar")
		 	btncancelpwd.click();
	},
	change_pwd:function(e)
	{
		var groupboxchangepwd=document.querySelector(".fieldchangepwd");
		groupboxchangepwd.classList.remove("disabled");

		var btn=document.querySelector("#"+e.id);
		btn.innerHTML="Cancelar";
		btn.setAttribute("onclick",`controller.cancel_changepwd(this)`);
	},
	cancel_changepwd:function(e)
	{
		var groupboxchangepwd=document.querySelector(".fieldchangepwd");
		groupboxchangepwd.classList.add("disabled");
		var btn=document.querySelector("#"+e.id);
		btn.innerHTML="Cambiar contraseña";
		btn.setAttribute("onclick",`controller.change_pwd(this)`);

		var pwdbefore=document.querySelector("#pwdbefore");
		var pwd=document.querySelector("#pwd");
		var pwdconfirm=document.querySelector("#pwdconfirm");

		pwdbefore.value="";
		pwd.value="";
		pwdconfirm.value="";
	},
	login:function(e)
	{
		var waiter=document.querySelector("#selectwaiter");
		var pwd=document.querySelector("#pwdlogin");
		var btn=document.querySelector("#"+e.id);

		var uri=url+"?entity=waiters&login=true";

		var data={
			waiter:waiter.value,
			pwd:pwd.value
		}

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
				window.location.href=`/?view=vw_principal&dmtm_token=${data.token}`;
			}
			,function(error){
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
      open_view:function(idview,params="")
      {
        window.location.href="./?view="+idview+params;
      }

}