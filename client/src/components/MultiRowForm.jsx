import React, { useState } from 'react'

export default function MultiRowForm({ fields = [], extra = [], onSubmit, submitLabel = 'Submit' }) {
  const [rows, setRows] = useState([{ id: Date.now(), data: {} }])

  function setField(rowId, name, value) {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, data: { ...r.data, [name]: value } } : r))
  }

  function addRow() { setRows(prev => [...prev, { id: Date.now()+Math.random(), data: {} }]) }
  function removeRow(id) { setRows(prev => prev.filter(r => r.id !== id)) }

  async function submit(e) {
    e.preventDefault()
    const extraVals = Object.fromEntries(new FormData(e.target))
    const items = rows.map(r => ({ ...r.data }))
    await onSubmit({ ...extraVals, items })
    setRows([{ id: Date.now(), data: {} }])
  }

  return (
    <form onSubmit={submit} className="form" style={{flexDirection:'column'}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        {extra.map(x => <input key={x.name} name={x.name} placeholder={x.placeholder} />)}
      </div>
      {rows.map(r => (
        <div key={r.id} style={{display:'flex',gap:10,alignItems:'center',marginTop:12}}>
          {fields.map(f => (
            <input key={f.name} name={f.name} placeholder={f.placeholder} value={r.data[f.name]||''} onChange={e => setField(r.id, f.name, e.target.value)} />
          ))}
          <button type="button" onClick={() => removeRow(r.id)} className="secondary-btn">Remove</button>
        </div>
      ))}
      <div style={{display:'flex',gap:10,marginTop:12}}>
        <button type="button" onClick={addRow} className="secondary-btn">Add Row</button>
        <button type="submit" className="primary-btn">{submitLabel}</button>
      </div>
    </form>
  )
}
