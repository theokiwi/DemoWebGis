export function Filters({view,categories,selected,onView,onCategories}:{view:string;categories:string[];selected:string[];onView:(v:'sus'|'total')=>void;onCategories:(v:string[])=>void}) {
  return <section className="filters" aria-labelledby="filters-title"><div><h2 id="filters-title">Recorte da análise</h2><p>O índice é recalculado para a oferta escolhida.</p></div>
    <fieldset><legend>Tipo de oferta</legend><label><input type="radio" name="view" checked={view==='sus'} onChange={()=>onView('sus')}/> Somente SUS</label><label><input type="radio" name="view" checked={view==='total'} onChange={()=>onView('total')}/> Oferta total</label></fieldset>
    <label className="select-label">Categoria<select multiple value={selected} onChange={event=>onCategories(Array.from(event.currentTarget.selectedOptions,value=>value.value))} aria-describedby="category-help"><option value="">Todas as categorias</option>{categories.map(category=><option key={category}>{category}</option>)}</select><small id="category-help">Use Ctrl ou Cmd para selecionar mais de uma.</small></label>
    {selected.length>0&&<button className="quiet-button" onClick={()=>onCategories([])}>Restaurar categorias</button>}
  </section>;
}
