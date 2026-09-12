

    var isactive=false;

    var event={
      load_variables:function()
      {
        var loading=document.querySelector(".loading");

      },
      resize:function()
      {
      }
      ,
      show_loading:function() {
        // loading.classList.remove("hidde_control");
      },
      hide_loading:function(){
        // loading.classList.add("hidde_control");
      },
      show_select:function()
      { 
        
        var inp=document.querySelector("#inp-mesa");
          var select =document.querySelector("#selet-tables")
        if(!isactive)
        {
          
          inp.style.display="none";
          select.style.display="flex";
          select.style.height="30px";
          isactive=true;
        }else
        {
          inp.style.display="";
          select.style.display="none";
          inp.focus();
          isactive=false;
        }
        
      }
      
     
    }

    // Arranque de la vista principal.
    //
    // Antes este archivo cargaba jQuery desde https://code.jquery.com y colgaba
    // el arranque de su onload. Como esta funcion es la unica que llama a
    // controller.get_tables(), un punto de venta sin internet se quedaba con la
    // pantalla de mesas vacia de forma permanente. jQuery se usaba unicamente
    // para cinco $(document).ready, asi que se elimino por completo.
    function initPrincipal()
    {
      event.load_variables();

      if (Number(module)) { controller.get_tables(); }
    }

    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", initPrincipal);
    else
      initPrincipal();
