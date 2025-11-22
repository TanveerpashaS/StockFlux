import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function History() {
  const [ledger, setLedger] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])
  
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    warehouse: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  useEffect(() => {
    fetchLedger()
    fetchProducts()
    fetchWarehouses()
  }, [])

  async function fetchLedger() {
    try {
      const res = await axios.get('/api/ledger')
      setLedger(res.data.slice().reverse())
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products')
      const prods = res.data || []
      setProducts(prods)
      const cats = [...new Set(prods.map(p => p.category).filter(Boolean))]
      setCategories(cats)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchWarehouses() {
    try {
      const res = await axios.get('/api/warehouses')
      setWarehouses(res.data?.length ? res.data : [{ id: '1', name: 'Main Warehouse' }, { id: '2', name: 'Warehouse A' }, { id: '3', name: 'Production Floor' }])
    } catch (err) {
      setWarehouses([{ id: '1', name: 'Main Warehouse' }, { id: '2', name: 'Warehouse A' }, { id: '3', name: 'Production Floor' }])
    }
  }

  const filtered = ledger.filter(entry => {
    // Type filter
    if (filters.type && entry.type !== filters.type) return false
    
    // Status filter
    if (filters.status && entry.status !== filters.status) return false
    
    // Warehouse filter
    if (filters.warehouse && entry.location !== filters.warehouse) return false
    
    // Category filter
    if (filters.category && entry.category !== filters.category) return false
    
    // Date range filter
    if (filters.dateFrom) {
      const entryDate = new Date(entry.ts).toISOString().split('T')[0]
      if (entryDate < filters.dateFrom) return false
    }
    if (filters.dateTo) {
      const entryDate = new Date(entry.ts).toISOString().split('T')[0]
      if (entryDate > filters.dateTo) return false
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchSku = entry.sku?.toLowerCase().includes(searchLower)
      const matchProduct = entry.productName?.toLowerCase().includes(searchLower)
      const matchRef = entry.ref?.toLowerCase().includes(searchLower)
      if (!matchSku && !matchProduct && !matchRef) return false
    }
    
    return true
  })

  const stats = {
    totalMovements: ledger.length,
    receipts: ledger.filter(e => e.type === 'receipt').length,
    deliveries: ledger.filter(e => e.type === 'delivery').length,
    transfers: ledger.filter(e => e.type === 'transfer').length,
    adjustments: ledger.filter(e => e.type === 'adjustment').length
  }

  function getTypeIcon(type) {
    switch(type) {
      case 'receipt': return '📥'
      case 'delivery': return '📤'
      case 'transfer': return '🔄'
      case 'adjustment': return '📊'
      default: return '📦'
    }
  }

  function getTypeColor(type) {
    switch(type) {
      case 'receipt': return '#F59E0B'
      case 'delivery': return '#3B82F6'
      case 'transfer': return '#2DD4BF'
      case 'adjustment': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  function resetFilters() {
    setFilters({
      type: '',
      status: '',
      warehouse: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    })
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Poppins' }}>Move History</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Complete ledger of all inventory movements and transactions</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Movements', value: stats.totalMovements, color: '#6B7280', icon: '📦' },
          { label: 'Receipts', value: stats.receipts, color: '#F59E0B', icon: '📥' },
          { label: 'Deliveries', value: stats.deliveries, color: '#3B82F6', icon: '📤' },
          { label: 'Transfers', value: stats.transfers, color: '#2DD4BF', icon: '🔄' },
          { label: 'Adjustments', value: stats.adjustments, color: '#8B5CF6', icon: '📊' }
        ].map(stat => (
          <div key={stat.label} style={{ background: '#FFF', padding: 18, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', marginBottom: 3 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#FFF', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', margin: 0 }}>🔍 Filters</h3>
          <button onClick={resetFilters} style={{ padding: '6px 12px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Document Type</label>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}>
              <option value="">All Types</option>
              <option value="receipt">Receipt</option>
              <option value="delivery">Delivery</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Warehouse</label>
            <select value={filters.warehouse} onChange={e => setFilters({...filters, warehouse: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}>
              <option value="">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.name}>{wh.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Category</label>
            <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Search</label>
            <input type="text" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} placeholder="Search by SKU, product, or reference..." style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Date From</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>Date To</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#6B7280' }}>
          Showing <span style={{ fontWeight: 700, color: '#1F2937' }}>{filtered.length}</span> of <span style={{ fontWeight: 700, color: '#1F2937' }}>{ledger.length}</span> movements
        </div>
      </div>

      {/* Movements Table */}
      <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ maxHeight: 'calc(100vh - 520px)', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Reference</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{getTypeIcon(entry.type)}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: getTypeColor(entry.type), textTransform: 'capitalize' }}>{entry.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{entry.productName || '-'}</td>
                  <td style={{ padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#6B7280' }}>{entry.sku || '-'}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: entry.qty_change > 0 ? '#10B981' : '#EF4444' }}>
                      {entry.qty_change > 0 ? '+' : ''}{entry.qty_change}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: '#374151' }}>{entry.location || '-'}</td>
                  <td style={{ padding: 12, fontSize: 12 }}>
                    {entry.category ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: '#F3F4F6', borderRadius: 5, fontSize: 11, fontWeight: 600, color: '#6B7280' }}>{entry.category}</span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF' }}>{entry.ref?.slice(0, 8) || '-'}</td>
                  <td style={{ padding: 12 }}>
                    {entry.status ? (
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: entry.status === 'done' ? '#D1FAE5' : entry.status === 'pending' ? '#FEF3C7' : '#FEE2E2', color: entry.status === 'done' ? '#065F46' : entry.status === 'pending' ? '#92400E' : '#DC2626', textTransform: 'capitalize' }}>
                        {entry.status}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(entry.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>No movements found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters or date range</div>
          </div>
        )}
      </div>
    </div>
  )
}
