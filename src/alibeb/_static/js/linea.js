var linea =
{
    table:null, tableId:'',
    init()
    {
        const check_visible = document.querySelector('#check_visible');
        const ipt_visible = document.querySelector('#ipt_visible');
        this.table = document.getElementById(this.tableId);

        if (check_visible && ipt_visible) check_visible.addEventListener('change', e => { ipt_visible.value = (check_visible.checked ? 1 : 0) });
    },
    getCurrentContext()
    {
        const id = (this.table?.DataArray[this.table.CurrentRowIndex()]?.sys_pk ?? "");
        return { item_id:id, context: {} }
    },
}
document.addEventListener('DOMContentLoaded', () => {
    linea.init();
});