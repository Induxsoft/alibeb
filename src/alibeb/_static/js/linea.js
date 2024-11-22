var linea =
{
    table:null, tableId:'',
    init()
    {
        this.line_file=document.getElementById("line_file");
        const check_visible = document.querySelector('#check_visible');
        const ipt_visible = document.querySelector('#ipt_visible');
        this.table = document.getElementById(this.tableId);

        if (check_visible && ipt_visible) check_visible.addEventListener('change', e => { ipt_visible.value = (check_visible.checked ? 1 : 0) });

        if(this.line_file)this.line_file.addEventListener("change",()=>{linea.uploadFile();});
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
            console.log(f.name)
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
                alert("Ocurrió un error al subir las imagenes.\n\n"+JSON.stringify(failure));
            },
            'PATCH', false, true, '', true
        );
    }
}
document.addEventListener('DOMContentLoaded', () => {
    linea.init();
});