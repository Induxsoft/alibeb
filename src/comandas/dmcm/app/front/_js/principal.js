

    function myJQueryCode() {
      var current = 0;
        $(document).ready(() => {
          var hidden=false;

          // $(".hidden-panel1").click(function() {
          //   $(".list-products").slideToggle("slow");
          //   var listP=document.querySelector(".command-product");
          //   var panel=document.querySelector(".command");
          //   if(!hidden)
          //   {
          //     panel.setAttribute("style","display:flex !important;width:100% !important");
          //     hidden=true;
          //   }
          //   else
          //   {
          //     panel.setAttribute("style","");
          //     listP.setAttribute("style","");//width:4px
          //     hidden=false;
          //   }
            
          // });

          
          event.load_variables();
          if(Number(module))
            {controller.get_tables();}

          window.onresize=function(){
            // event.resize();
          };  
      });
    }

    if(typeof jQuery=='undefined') {
        var headTag = document.getElementsByTagName("head")[0];
        var jqTag = document.createElement('script');
        jqTag.type = 'text/javascript';
        jqTag.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqTag.onload = myJQueryCode;
        headTag.appendChild(jqTag);
    } else {
         myJQueryCode();
    }

    window.addEventListener('beforeunload',function(){
       // event.show_loading();
      });

      window.addEventListener('unload',function(){
       // event.hide_loading();
      });

      var isactive=false;
    var event={
      load_variables:function()
      {
        var loading=document.querySelector(".loading");

      },
      resize:function()
      {
        //$(".div-first").height(window.innerHeight-120); //-$("#master-nav").height()-$("#footer").height()
        // $(".div-first").width(window.innerWidth-100);
        // $(".editor-row").height(window.innerHeight-$("#panel-top").height()-$("#master-nav").height()-$("#footer").height()-5);
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