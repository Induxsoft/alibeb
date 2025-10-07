
var url="#<@end_point_service>";
var model={
	 invoke_service:function(url,params,callback_success, callback_fail, http_method,reload=true,async=true) {
          if (!http_method) http_method="POST";

          request={
              type: http_method,
              url: url,
              contentType:"application/json;charset=utf-8;",
              async:async,
              crossDomain: true,
              headers:{'admin': `${ws}`},
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
var definitive=definitive || {};
var jquery_url="https://code.jquery.com/jquery-3.6.0.min.js";

function on_doc_ready() {
    $(document).ready(() => {
    if (definitive.onready) 
      definitive.onready();
  });
}

if(typeof jQuery=='undefined') {
    var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'text/javascript';
    jqTag.src = jquery_url;
    jqTag.onload = on_doc_ready;
    headTag.appendChild(jqTag);
} else {
     on_doc_ready();
}