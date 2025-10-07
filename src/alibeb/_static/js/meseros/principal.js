let container = document.querySelector(".nav-admin");
let all_item_prop = document.querySelectorAll(".item_prop");
var design={
	select_propertie:function (propertie, btn){

	    container.childNodes.forEach(i=>{
	        i.style.backgroundColor = "transparent";
	        i.style.color = "#888";
	    });
	   btn.style.backgroundColor = "#fff";
	   btn.style.color = "#000";
	    
	    all_item_prop.forEach(item=>{
	        item.style.display = "none";
	    });

	    all_item_prop.forEach(item=>{
	        if(item.id == propertie)
	            item.style.display = "block";
	    });
	}
}