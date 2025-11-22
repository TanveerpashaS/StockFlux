import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard(){
  const [kpis, setKpis] = useState(null)
  const [recent, setRecent] = useState([])
  const [filters, setFilters] = useState({ type: '', status: '', warehouse: '', category: '' })
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    try{
      const r = await axios.get('/api/dashboard')
      setKpis(r.data)
      const ledger = await axios.get('/api/ledger')
      setRecent(ledger.data.slice().reverse().slice(0,15))
      const wh = await axios.get('/api/warehouses').catch(() => ({data: []}))
      setWarehouses(wh.data || [])
      const cat = await axios.get('/api/categories').catch(() => ({data: []}))
      setCategories(cat.data || [])
    }catch(e){ }
  }

  const filteredRecent = recent.filter(r => {
    if (filters.type && r.type !== filters.type) return false
    if (filters.status && r.status !== filters.status) return false
    if (filters.warehouse && r.location !== filters.warehouse) return false
    if (filters.category && r.category !== filters.category) return false
    return true
  })

  const kpiCards = [
    { label: 'Total Products', value: kpis?.totalProducts || 0, icon: '📦', color: '#312E81', gradient: 'linear-gradient(135deg, #312E81 0%, #4C1D95 100%)', desc: 'Active SKUs' },
    { label: 'Low Stock Items', value: kpis?.lowStockCount || 0, icon: '⚠️', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', desc: 'Need Reorder' },
    { label: 'Pending Receipts', value: kpis?.pendingReceipts || 0, icon: '📥', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', desc: 'Incoming Stock' },
    { label: 'Pending Deliveries', value: kpis?.pendingDeliveries || 0, icon: '📤', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', desc: 'Outgoing Orders' },
    { label: 'Internal Transfers', value: kpis?.transfersScheduled || 0, icon: '🔄', color: '#2DD4BF', gradient: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', desc: 'Scheduled Moves' }
  ]

  return (
    <div style={{width:'100%',height:'100%'}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:28,fontWeight:800,color:'#1F2937',marginBottom:6,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-0.5px'}}>Dashboard</h1>
        <p style={{fontSize:14,color:'#6B7280'}}>Real-time snapshot of your inventory operations</p>
      </div>

      {/* KPI Cards */}
      {kpis ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:16,marginBottom:28}}>
          {kpiCards.map((card, idx) => (
            <div key={idx} style={{background:'white',borderRadius:14,padding:'18px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #F3F4F6',transition:'all 0.3s ease',cursor:'default'}} onMouseEnter={(e) => {e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 24px rgba(0,0,0,0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:11,background:card.gradient,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 4px 12px ${card.color}40`}}>{card.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:'#6B7280',fontWeight:600,marginBottom:2,lineHeight:1.3}}>{card.label}</div>
                  <div style={{fontSize:11,color:'#9CA3AF'}}>{card.desc}</div>
                </div>
              </div>
              <div style={{fontSize:32,fontWeight:800,color:card.color,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-1px'}}>{card.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:'center',padding:60,color:'#9CA3AF'}}>
          <div style={{fontSize:32,marginBottom:12}}>⏳</div>
          <div>Loading dashboard data...</div>
        </div>
      )}

      {/* Filters */}
      <div style={{background:'white',borderRadius:14,padding:'20px 22px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #F3F4F6',marginBottom:20}}>
        <div style={{fontSize:15,fontWeight:700,color:'#1F2937',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:18}}>🔍</span> Dynamic Filters
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:14}}>
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Document Type</label>
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',transition:'border-color 0.2s'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'}>
              <option value="">All Types</option>
              <option value="receipt">📥 Receipt</option>
              <option value="delivery">📤 Delivery</option>
              <option value="transfer">🔄 Internal Transfer</option>
              <option value="adjustment">⚙️ Adjustment</option>
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',transition:'border-color 0.2s'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'}>
              <option value="">All Status</option>
              <option value="draft">📝 Draft</option>
              <option value="waiting">⏳ Waiting</option>
              <option value="ready">✅ Ready</option>
              <option value="done">✔️ Done</option>
              <option value="canceled">❌ Canceled</option>
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Warehouse / Location</label>
            <select value={filters.warehouse} onChange={(e) => setFilters({...filters, warehouse: e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',transition:'border-color 0.2s'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'}>
              <option value="">All Locations</option>
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Product Category</label>
            <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',transition:'border-color 0.2s'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        {(filters.type || filters.status || filters.warehouse || filters.category) && (
          <button onClick={() => setFilters({ type: '', status: '', warehouse: '', category: '' })} style={{marginTop:16,padding:'8px 16px',background:'#F3F4F6',border:'none',borderRadius:8,fontSize:13,fontWeight:600,color:'#6B7280',cursor:'pointer',transition:'all 0.2s'}} onMouseEnter={(e)=>{e.target.style.background='#E5E7EB'}} onMouseLeave={(e)=>{e.target.style.background='#F3F4F6'}}>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Recent Activity Table */}
      <section>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:700,color:'#1F2937',fontFamily:'Plus Jakarta Sans, Poppins',marginBottom:4}}>Recent Activity</h2>
            <p style={{fontSize:13,color:'#6B7280'}}>Latest inventory movements • {filteredRecent.length} records</p>
          </div>
        </div>
        <div style={{background:'white',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #F3F4F6',overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#F9FAFB',borderBottom:'1px solid #F3F4F6'}}>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Type</th>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Product</th>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Quantity</th>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Location</th>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Status</th>
                  <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.length > 0 ? filteredRecent.map((r, idx) => (
                  <tr key={r.id} style={{borderBottom:'1px solid #F3F4F6',transition:'background 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.background='#F9FAFB'} onMouseLeave={(e)=>e.currentTarget.style.background='white'}>
                    <td style={{padding:'16px 20px'}}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:6,background:'#F3F4F6',fontSize:13,fontWeight:600,color:'#374151'}}>
                        {r.type === 'receipt' ? '📥' : r.type === 'delivery' ? '📤' : r.type === 'transfer' ? '🔄' : '⚙️'} {r.type}
                      </span>
                    </td>
                    <td style={{padding:'16px 20px'}}>
                      <div style={{fontWeight:700,color:'#1F2937',fontSize:14}}>{r.sku}</div>
                      {r.product_name && <div style={{fontSize:12,color:'#9CA3AF',marginTop:2}}>{r.product_name}</div>}
                    </td>
                    <td style={{padding:'16px 20px'}}>
                      <span style={{fontSize:16,fontWeight:700,color:r.qty_change>0?'#10B981':'#EF4444'}}>
                        {r.qty_change>0?'+':''}{r.qty_change}
                      </span>
                    </td>
                    <td style={{padding:'16px 20px',fontSize:14,color:'#6B7280'}}>{r.location}</td>
                    <td style={{padding:'16px 20px'}}>
                      <span style={{display:'inline-block',padding:'4px 10px',borderRadius:6,fontSize:12,fontWeight:600,background:r.status==='done'?'#D1FAE5':r.status==='ready'?'#DBEAFE':r.status==='waiting'?'#FEF3C7':'#F3F4F6',color:r.status==='done'?'#059669':r.status==='ready'?'#2563EB':r.status==='waiting'?'#D97706':'#6B7280'}}>
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td style={{padding:'16px 20px',fontSize:13,color:'#9CA3AF',whiteSpace:'nowrap'}}>{new Date(r.ts).toLocaleString('en-US', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{padding:40,textAlign:'center',color:'#9CA3AF'}}>
                      <div style={{fontSize:32,marginBottom:12}}>📋</div>
                      <div>No activity records found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
