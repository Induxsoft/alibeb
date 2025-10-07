
var url="#<@end_point_service>"; //sys-beta.induxsoft.net
var model={
	 invoke_service:function(url,params,callback_success, callback_fail, http_method,reload=true,async=true) {
          if (!http_method) http_method="POST";

          request={
              type: http_method,
              url: url,
              contentType:"application/json;charset=utf-8;",
              async:async,
              crossDomain: true,
              headers:{'admin':ws},
              success: function(r){
                  var res = JSON.parse(JSON.stringify(r));
                  if (res.success)
                  {
                      if (callback_success)
                          callback_success(res.data);
                  }
                  else
                  {
                      if (callback_fail)
                          callback_fail(res);
                  }
              },
              error: function(r){
                  alert("Ocurrió un error al invocar el servicio.\n\r"+JSON.stringify(r));
              }
          };

          if (params)
          {
          	request.dataType="json";
          	request.data=JSON.stringify(params);
          }


          $.ajax(request).always(function(){
              if(reload)
                  location.reload();
          });
      }
}