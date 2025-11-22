import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [stockTotals, setStockTotals] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editingAdjustment, setEditingAdjustment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [form, setForm] = useState({
    warehouse: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'Draft',
    items: [{ productId: '', productName: '', systemQty: 0, countedQty: '', difference: 0 }]
  })

  useEffect(() => {
    fetchAdjustments()
    fetchProducts()
    fetchWarehouses()
  }, [])

  async function fetchAdjustments() {
    try {
      const res = await axios.get('/api/adjustments')
      setAdjustments(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products')
      const prods = res.data || []
      setProducts(prods)
      
      // Build stock totals lookup
      const totals = {}
      prods.forEach(p => {
        totals[p.id] = { total: p.stock || 0, byLocation: p.byLocation || {} }
      })
      setStockTotals(totals)
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

  function handleAddRow() {
    setForm({ ...form, items: [...form.items, { productId: '', productName: '', systemQty: 0, countedQty: '', difference: 0 }] })
  }

  function handleRemoveRow(idx) {
    const updated = form.items.filter((_, i) => i !== idx)
    setForm({ ...form, items: updated.length ? updated : [{ productId: '', productName: '', systemQty: 0, countedQty: '', difference: 0 }] })
  }

  function handleItemChange(idx, field, value) {
    const updated = [...form.items]
    updated[idx][field] = value
    
    if (field === 'productId') {
      const prod = products.find(p => p.id === value)
      if (prod) {
        updated[idx].productName = prod.name
        updated[idx].sku = prod.sku
        // Get system qty for selected warehouse
        const systemQty = (stockTotals[prod.id]?.byLocation && stockTotals[prod.id].byLocation[form.warehouse]) || 0
        updated[idx].systemQty = systemQty
        updated[idx].difference = (Number(updated[idx].countedQty) || 0) - systemQty
      }
    }
    
    if (field === 'countedQty') {
      const systemQty = updated[idx].systemQty || 0
      updated[idx].difference = (Number(value) || 0) - systemQty
    }
    
    setForm({ ...form, items: updated })
  }

  // Recalculate system quantities when warehouse changes
  useEffect(() => {
    if (form.warehouse && form.items.length) {
      const updated = form.items.map(item => {
        if (item.productId) {
          const systemQty = (stockTotals[item.productId]?.byLocation && stockTotals[item.productId].byLocation[form.warehouse]) || 0
          return { ...item, systemQty, difference: (Number(item.countedQty) || 0) - systemQty }
        }
        return item
      })
      setForm({ ...form, items: updated })
    }
  }, [form.warehouse])

  async function handleSubmit() {
    if (!form.warehouse) {
      alert('Please select a warehouse')
      return
    }
    const validItems = form.items.filter(it => it.productId && it.countedQty !== '')
    if (!validItems.length) {
      alert('Please add at least one product with counted quantity')
      return
    }

    const totalItems = validItems.length
    const payload = {
      warehouse: form.warehouse,
      adjustmentDate: form.adjustmentDate,
      reason: form.reason,
      status: form.status,
      items: validItems.map(it => ({ 
        productId: it.productId, 
        productName: it.productName, 
        sku: it.sku, 
        systemQty: it.systemQty, 
        countedQty: Number(it.countedQty), 
        difference: it.difference 
      })),
      totalItems
    }

    try {
      if (editingAdjustment) {
        await axios.put(`/api/adjustments/${editingAdjustment.id}`, payload)
      } else {
        await axios.post('/api/adjustments', payload)
      }
      setShowModal(false)
      setEditingAdjustment(null)
      resetForm()
      fetchAdjustments()
      fetchProducts() // Refresh to get updated stock
    } catch (err) {
      alert('Error saving adjustment: ' + (err.response?.data?.error || err.message))
    }
  }

  function resetForm() {
    setForm({
      warehouse: '',
      adjustmentDate: new Date().toISOString().split('T')[0],
      reason: '',
      status: 'Draft',
      items: [{ productId: '', productName: '', systemQty: 0, countedQty: '', difference: 0 }]
    })
  }

  function handleEdit(adjustment) {
    setEditingAdjustment(adjustment)
    setForm({
      warehouse: adjustment.warehouse,
      adjustmentDate: adjustment.adjustmentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      reason: adjustment.reason || '',
      status: adjustment.status,
      items: adjustment.items?.length ? adjustment.items : [{ productId: '', productName: '', systemQty: 0, countedQty: '', difference: 0 }]
    })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this adjustment?')) return
    try {
      await axios.delete(`/api/adjustments/${id}`)
      fetchAdjustments()
    } catch (err) {
      alert('Error deleting adjustment: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await axios.patch(`/api/adjustments/${id}/status`, { status: newStatus })
      fetchAdjustments()
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleValidate(adjustment) {
    if (adjustment.status === 'Done') {
      alert('Adjustment already validated')
      return
    }
    if (!confirm('Validate this adjustment? Stock levels will be updated to match counted quantities.')) return
    try {
      await axios.post(`/api/adjustments/${adjustment.id}/validate`)
      fetchAdjustments()
      fetchProducts() // Refresh to show updated stock
      alert('Adjustment validated successfully!')
    } catch (err) {
      alert('Error validating adjustment: ' + (err.response?.data?.error || err.message))
    }
  }

  const filtered = adjustments.filter(a => {
    const matchSearch = !searchTerm || 
      (a.warehouse?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.reason?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.id?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = !statusFilter || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: adjustments.length,
    draft: adjustments.filter(a => a.status === 'Draft').length,
    pending: adjustments.filter(a => a.status === 'Pending Review').length,
    completed: adjustments.filter(a => a.status === 'Done').length
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Poppins' }}>Inventory Adjustments</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Fix stock discrepancies and update inventory counts</p>
        </div>
        <button onClick={() => { resetForm(); setEditingAdjustment(null); setShowModal(true) }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }}>+ New Adjustment</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Adjustments', value: stats.total, color: '#8B5CF6', icon: '📊' },
          { label: 'Draft', value: stats.draft, color: '#94A3B8', icon: '📝' },
          { label: 'Pending Review', value: stats.pending, color: '#F59E0B', icon: '⏳' },
          { label: 'Completed', value: stats.completed, color: '#10B981', icon: '✅' }
        ].map(stat => (
          <div key={stat.label} style={{ background: '#FFF', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ background: '#FFF', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 16, display: 'flex', gap: 12 }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by warehouse, reason, or ID..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14, minWidth: 150 }}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Adjustments Table */}
      <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Warehouse</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Reason</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Items</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(adjustment => (
              <tr key={adjustment.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{adjustment.id?.slice(0, 8)}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{adjustment.warehouse}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#6B7280' }}>{adjustment.reason || 'No reason'}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{adjustment.totalItems || adjustment.items?.length || 0}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#6B7280' }}>{new Date(adjustment.adjustmentDate || adjustment.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>
                  <select value={adjustment.status} onChange={e => handleStatusChange(adjustment.id, e.target.value)} disabled={adjustment.status === 'Done'} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid #E5E7EB', background: adjustment.status === 'Done' ? '#D1FAE5' : adjustment.status === 'Pending Review' ? '#FEF3C7' : '#F3F4F6', color: adjustment.status === 'Done' ? '#065F46' : adjustment.status === 'Pending Review' ? '#92400E' : '#6B7280' }}>
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Done">Done</option>
                  </select>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {adjustment.status !== 'Done' && (
                      <button onClick={() => handleValidate(adjustment)} style={{ padding: '6px 12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✓ Validate</button>
                    )}
                    <button onClick={() => handleEdit(adjustment)} disabled={adjustment.status === 'Done'} style={{ padding: '6px 12px', background: adjustment.status === 'Done' ? '#E5E7EB' : '#3B82F6', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: adjustment.status === 'Done' ? 'not-allowed' : 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(adjustment.id)} style={{ padding: '6px 12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No adjustments found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', borderRadius: 12, width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>{editingAdjustment ? 'Edit Adjustment' : 'New Adjustment'}</h2>
              <button onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm() }} style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Warehouse *</label>
                  <select value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.name}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date</label>
                  <input type="date" value={form.adjustmentDate} onChange={e => setForm({ ...form, adjustmentDate: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                    <option value="Draft">Draft</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason</label>
                <input type="text" placeholder="e.g. Physical count discrepancy, damaged goods" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Stock Count *</label>
                  <button onClick={handleAddRow} style={{ padding: '6px 12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Product</button>
                </div>
                <div style={{ background: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                    <div>Product</div>
                    <div>System Qty</div>
                    <div>Counted Qty</div>
                    <div>Difference</div>
                    <div></div>
                  </div>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <select value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)} disabled={!form.warehouse} style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                      <option value="">Select product</option>
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name} ({prod.sku})</option>
                      ))}
                    </select>
                    <input type="number" value={item.systemQty} disabled style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, background: '#F9FAFB', color: '#6B7280' }} />
                    <input type="number" placeholder="Counted" value={item.countedQty} onChange={e => handleItemChange(idx, 'countedQty', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
                    <div style={{ padding: '8px 12px', borderRadius: 6, fontSize: 14, fontWeight: 700, textAlign: 'center', background: item.difference === 0 ? '#F3F4F6' : item.difference > 0 ? '#D1FAE5' : '#FEE2E2', color: item.difference === 0 ? '#6B7280' : item.difference > 0 ? '#059669' : '#DC2626' }}>
                      {item.difference > 0 ? '+' : ''}{item.difference}
                    </div>
                    <button onClick={() => handleRemoveRow(idx)} disabled={form.items.length === 1} style={{ padding: '8px 12px', background: form.items.length === 1 ? '#E5E7EB' : '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, cursor: form.items.length === 1 ? 'not-allowed' : 'pointer' }}>×</button>
                  </div>
                ))}
                {!form.warehouse && (
                  <div style={{ padding: 12, background: '#FEF3C7', color: '#92400E', borderRadius: 8, fontSize: 13, marginTop: 8 }}>⚠️ Select a warehouse first to see current stock levels</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                <button onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm() }} style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSubmit} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save Adjustment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
