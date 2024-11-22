var linea =
{
    table:null, tableId:'',
    _entity:0,
    init()
    {
        this.line_file=document.getElementById("line_file");
        this.name_file=document.getElementById("name_file");
        const check_visible = document.querySelector('#check_visible');
        const ipt_visible = document.querySelector('#ipt_visible');
        this.table = document.getElementById(this.tableId);

        if (check_visible && ipt_visible) check_visible.addEventListener('change', e => { ipt_visible.value = (check_visible.checked ? 1 : 0) });

        if(this.line_file)this.line_file.addEventListener("change",()=>
        {
            linea.ShowNameFile();
            if(linea._entity>0)linea.uploadFile();
        });
    },
    getCurrentContext()
    {
        const id = (this.table?.DataArray[this.table.CurrentRowIndex()]?.sys_pk ?? "");
        return { item_id:id, context: {} }
    },
    uploadFile(url="")
    {
        if(!this.line_file || this.line_file.files.length<1 || this.line_file.value.trim()=="")return;
        
        let formData = new FormData();
        for (let i = 0; i < this.line_file.files.length; i++) 
        {
            const f = this.line_file.files[i];
            formData.append(f.name,f);
        }
     
        formData.append("upload",true);
        InduxsoftCrudlModel.InvokeService(url, formData,
            success => 
            {
                window.location.reload();
            },
            failure => 
            {
                this.line_file.value="";
                linea.ShowNameFile();
                alert("Ocurrió un error al subir las imagenes.\n\n"+JSON.stringify(failure));
            },
            'PATCH', false, true, '', true
        );
    },
    ShowNameFile()
    {
        if(!this.name_file)return;

        if(this.line_file.files.length<1)this.name_file.innerHTML="";
        else
        {
            var f = this.line_file.files[0];
            this.name_file.innerHTML="Elemento seleccionado: "+f.name;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    linea.init();
});