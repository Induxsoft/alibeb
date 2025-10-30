var last_sys_pk=0;
var controller={
	get_commands:function() {
		 var uri=`${url}pos/dinner/kdf/?cprod=${cprod}`;
        model.invoke_service(uri,null,function(data) {
          views.print_commands(data);
          views.print_label_pedidos();
        },
        function(error) {
          alert(error.message);
        },"GET",false);
	},
  get_commands_last:function()
  {
     var uri=`${url}pos/dinner/kdf/${last_sys_pk}/?cprod=${cprod}`;
        model.invoke_service(uri,null,function(data) {
          if(data==null)
            return;
          views.print_commands(data,true);
          views.print_label_pedidos();
        },
        function(error) {
          alert(error.message);
        },"GET",false);
  },
  do_command:function(idkds,act="close",reload=false){
    // var opcion=confirm("¿Esta seguro de realizar la operación?");

    // if(!opcion)
    //   return;

    var uri=`${url}pos/dinner/kdf/${idkds}/?cprod=${cprod}`;
    var data={act:act}
      model.invoke_service(uri,data,function(data) {
        if(!reload)
          views.remove_command(data.idkdf);
        else
          controller.get_commands();
        views.print_label_pedidos();
      },
      function(error) {
        alert(error.message);
      },"PATCH",false);
  },
  view_history:function()
  {
    controller.show_modal("modal-historial");
  },
  show_modal:function(idmodal)
  {
    views.show_modal(idmodal);
  },
  close_modal:function(idmodal)
  {
    views.close_modal(idmodal);
  },
  get_commands_history:function()
  {
    var uri=`${url}pos/dinner/kdf/?cprod=${cprod}&history=true`;
    model.invoke_service(uri,null,function(data) {
      views.print_commands(data,false,"c-commands-history",true);
    },
    function(error) {
      alert(error.message);
    },"GET",false);
  },
  return_command:function(idkds)
  {
    controller.do_command(idkds,"re_open",true);
  },
  lifetime:function(time)
  {
    switch(Number(time))
    {
      case 1:
        return "1er. Tiempo";
        break;
      case 2:
        return "2do. Tiempo";
        break;
      case 3:
        return "3er. Tiempo";
        break;
      case 4:
        return "4to. Tiempo";
        break;
      case 5:
        return "5to. Tiempo";
        break;
      default:
        return "";
        break;
    }
  },
  startTime:function(sec,min,hr,idclock)
  {
    var elem=document.getElementById(idclock);
    if(elem)
    {
      sec++;
      if(sec>=60){
        min++;
        sec=0;
      }
      if(min>=60){
        hr++;
        min=0;
      }
      if(hr>=24)
        hr=1;
      //Add a zero in front of numbers<10
      hr = controller.checkTime(Number(hr));
      min = controller.checkTime(Number(min));
      sec = controller.checkTime(Number(sec));
      elem.innerHTML = hr + " : " + min + " : " + sec;
    }

     
    var time = setTimeout(function(){ controller.startTime(sec,min,hr,idclock) }, 1000);
  },
  checkTime:function(i)
  {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
  },
  redirect:function(view="",params="")
  {
    if(cprod!="")
      params+="&cprod="+cprod;
    if(ws!="")
      params+="&dm_scr="+ws;
    if(token!="")
      params+="&token="+token;
    window.location.href=`./?view=${view}${params}`;
  },
  workspace:function()
  {
    var ws=document.querySelector("#idws");
    controller.redirect("",`&dm_scr=${ws.value}`);
  },
  get_cprods:function(){
    var uri=`${url_admin}pos/dinner/dmcprods/`;
    //var data={pwd:valor}
    model.invoke_service(uri,null,function(data) {
     views.print_select(
      "select_cprods",data
     );
    },
    function(error) {
      alert(error.message);
    },"GET",false);
  },
  login:function(e){
    var pwd= document.querySelector("#pwd");
    var selct_cpro= document.querySelector("#select_cprods");
    
    if ( selct_cpro.value==""){
      alert("El campo centro de producción es requerido.");
      return;
    }
    if (pwd.value ==""){
      alert("El campo contraseña es requerido.");
      return;
    }
    var uri=`${url_admin}pos/dinner/dmcprod_login/${selct_cpro.value}/?pwd=${pwd.value}`;
     
     //var data ={pwd:pwd.value}
      
    model.invoke_service(uri,null,function(data) {
      console.log(data)
      cprod="";
      controller.redirect("kds","&cprod="+data.codigo+"&segact="+data.shortpool);
    },
    function(error) {
      alert(error.message);
    },"GET",false);
  },
  guid:function()
  {
    //guid con - //[1e7]+-1e3+-4e3+-8e3+-1e11
    //guid sin - //[1e7]+1e3+4e3+8e3+1e11
    return ([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

}