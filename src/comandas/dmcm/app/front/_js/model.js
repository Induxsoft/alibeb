
var url="#<@end_point_service>";
var model=
{
	 invoke_service:function(url,params,callback_success, callback_fail, http_method,reload=true,async=true) 
     {
          if (!http_method) http_method="POST";

          // Antes esta funcion usaba $.ajax, es decir que jQuery era la capa
          // HTTP completa de la aplicacion y se cargaba desde un CDN externo.
          // Reescrita con XMLHttpRequest para no depender de internet ni de
          // jQuery. Se conserva el contrato original, incluido async=false.
          var body=null;

          if (params)
          {
                if(typeof model_prn!=="undefined" && model_prn)
                      params["_config_prn"]=model_prn.GetConfigPrinter();

                body=JSON.stringify(params);
          }

          var xhr=new XMLHttpRequest();
          xhr.open(http_method,url,async);
          xhr.setRequestHeader("Content-Type","application/json;charset=utf-8;");
          xhr.setRequestHeader("Authorization","Bearer "+ws+"+"+token);
      
          function RedirigirLogin(mensaje, url_redir="") 
          {
            if (mensaje && mensaje.includes("@token_revocado")) 
            {
                  window.location.href = url_redir || "/?view=login";
                  return true;
            }

            return false;
          }
          // Equivale al .always() de jQuery: corre pase lo que pase.
          function always()
          {
                if(reload)location.reload();
          }

          function fail(detail)
          {
                alert("Ocurrió un error al invocar el servicio.\n\r"+detail);
                always();
          }

          function handle()
          {
                if(xhr.status<200 || xhr.status>=300)
                {
                      fail(JSON.stringify({status:xhr.status,statusText:xhr.statusText,responseText:xhr.responseText}));
                      return;
                }

                var res=null;
                var text=xhr.responseText||"";

                if(text.trim()==="")res={success:true,data:null};
                else
                {
                      try{ res=JSON.parse(text); }
                      catch(e)
                      {
                            fail("La respuesta no es JSON válido.\n\r"+text.substring(0,300));
                            return;
                      }
                }

                if (res && RedirigirLogin(res.message??"",res.url_redir??"")) return;

                if(res && res.success)
                {
                      if(callback_success)callback_success(res.data);
                }
                else if(callback_fail)callback_fail(res);

                always();
          }

          if(async)
          {
                xhr.onload=handle;
                xhr.onerror=function()
                {
                      fail(JSON.stringify({status:xhr.status,statusText:xhr.statusText}));
                };
          }

          try{ xhr.send(body); }
          catch(e)
          {
                if(e && RedirigirLogin(e.message??String(e)))return;

                fail(e && e.message ? e.message : String(e));
                return;
          }

          if(!async)handle();
      }
}
