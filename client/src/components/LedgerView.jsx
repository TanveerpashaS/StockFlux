import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function LedgerView(){
  const [rows, setRows] = useState([])
  useEffect(()=>{axios.get('/api/ledger').then(r=>setRows(r.data.slice().reverse())).catch(()=>{})},[])
  return (
    <div className="card">
      <table className="table">
        <thead><tr><th>Time</th><th>SKU</th><th>Change</th><th>Location</th><th>Type</th><th>Ref</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}><td style={{whiteSpace:'nowrap'}}>{new Date(r.ts).toLocaleString()}</td><td>{r.sku}</td><td style={{color:r.qty_change>0? 'var(--success)':'var(--danger)'}}>{r.qty_change>0? '+'+r.qty_change:r.qty_change}</td><td>{r.location}</td><td>{r.type}</td><td>{r.ref||'-'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
