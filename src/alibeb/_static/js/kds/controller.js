var list_cprods=null;
var pwd_iswritted=false;
var controller=
{
	get_cprods:function() 
	{
		var uri=`${url}?entity=cprods`;
        model.invoke_service(uri,null,function(data) 
		{
        	list_cprods=data;
         	views.print_cprods(data);
        },
        function(error) {
          alert(error.message);
        },"GET",false);
	},
	get_almcn:function(idselect) 
	{
		var uri=`${url}?entity=almcn`;
        model.invoke_service(uri,null,function(data) 
		{
        	var splt=idselect.split(",");
        	for (var i = 0; i < splt.length; i++) {
        		views.data_select(splt[i],data);
        	}
        },
        function(error) {
          alert(error.message);
        },"GET",false);
	},
	get_datacprod:function(sys_pk)
	{
		views.datacprods(sys_pk);
		views.tab_pointer_events();
		
	},
	
	delete_cprod:function(sys_pk,e)
	{
		var opcion = confirm("¿Esta seguro de eliminar el registro?");
		if (!opcion)
		return;
		
		e.stopPropagation();
		var uri=`${url}?entity=cprods&idcprod=${sys_pk}`;
        model.invoke_service(uri,null,function(data) 
		{
         list_cprods=data;
         views.print_cprods(data);
        },
        function(error) {
          alert(error.message);
        },"PUT",false);
	},
	modify:function(sys_pk,existfield=0)
	{
		views.hide_controls("btnmodifi");
		views.tab_pointer_events(true);
		views.show_controls("btnaction",function(e,sys_pk)
		{
			e.setAttribute("onclick",`controller.add_datacprod("",this,${sys_pk},${existfield})`);
		},sys_pk);
		views.show_controls("btncancelar");
		var codigo=document.querySelector("#cprod_codigo");
		codigo.focus();
	},
	cancel_modif:function(e)
	{
		views.hide_controls("btnaction,btncancelar");
		views.tab_pointer_events();
		views.show_controls("btnmodifi");
	},
	add_cprod:function()
	{
		views.hide_controls("btncancelar,btnmodifi");
		views.new_cprod();
		views.show_controls("btnaction",function(e){
			e.setAttribute("onclick","controller.add_datacprod('',this)")
		});
		views.change_pwd(true);
	},
	redirect:function(url="",params="")
	{
		window.location.href=`${url}${params}`;
	},
	add_datacprod:function(params="",e,sys_pk="",existfield=0)
	{
		var codigo=document.querySelector("#cprod_codigo");
		var descripcion=document.querySelector("#cprod_descripcion");
		var almcmt=document.querySelector("#cprod_amacenmp");
		var almcpt=document.querySelector("#cprod_amacenpt");
		var elemsys_pk=document.querySelector("#cprod_sys_pk");

		var pwdbefore=document.querySelector("#pwdbefore");
		var pwd=document.querySelector("#pwd");
		var pwdconfirm=document.querySelector("#pwdconfirm");

		var btn=document.querySelector("#"+e.id);
		var seg_act=document.querySelector("#seg_act");

		if(codigo.value=="")
		{
			alert("El código es requerido.");
			return;
		}
		if(descripcion.value=="")
		{
			alert("La descripción es requerido.");
			return ;
		}

		if(pwd.value!=pwdconfirm.value)
		{
			alert("La contraseña no coinciden.");
			return;
		}
		if(pwd_iswritted && !existfield && pwd.value=="" && pwdconfirm.value=="")
		{
			alert("La contraseña es requerido.");
			return;
		}
		var changepwd=false;
		if(existfield || (pwd.value!="" && pwdconfirm.value!="")){changepwd=true;}

		if(params!="" && sys_pk)
			params+="&idcprod="+sys_pk;
		else
			params+="&idcprod="+sys_pk;

		btn.classList.add("disabled");
		var uri=`${url}?entity=cprods${params}`;
		var data=
		{
			code:codigo.value,
			almcmt:almcmt.value,
			almcpt:almcpt.value,
			descripcion:descripcion.value,
			pwdbefore:pwdbefore.value,
			pwd:pwd.value,
			changepwd:changepwd,
			shortpool:seg_act.value
		}

		model.invoke_service(uri,data,
			function(data)
			{
				btn.classList.remove("disabled");
				list_cprods=data;
         		views.print_cprods(data);
				controller.add_cprod();
			}
			,function(error){
				btn.classList.remove("disabled",false);
				alert(error.message);
			}
			,"POST",false);
	},
	filterInt(evt, input) {
		// Backspace = 8, Enter = 13, ‘0′ = 48, ‘9′ = 57, ‘.’ = 46, ‘-’ = 43
		var key = window.Event ? evt.which : evt.keyCode;
		var chark = String.fromCharCode(key);
		var tempValue = input.value + chark;
		if (key >= 48 && key <= 57) {
			if (controller.filter(tempValue) === false) {
				return false;
			} else {
				return true;
			}
		} else {
			if (key == 8 || key == 13 || key == 0) {
				return true;
			} else {
				return false;
			}
		}
	},
	filter(__val__) {
		var preg = /^([0-9]+\.?[0-9]{0,2})$/;
		if (preg.test(__val__) === true) {
			return true;
		} else {
			return false;
		}
	
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