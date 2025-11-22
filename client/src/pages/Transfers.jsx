import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Transfers() {
  const [transfers, setTransfers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [form, setForm] = useState({
    fromWarehouse: '',
    toWarehouse: '',
    transferDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    items: [{ productId: '', productName: '', quantity: '' }]
  })

  useEffect(() => {
    fetchTransfers()
    fetchProducts()
    fetchWarehouses()
  }, [])

  async function fetchTransfers() {
    try {
      const res = await axios.get('/api/transfers')
      setTransfers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products')
      setProducts(res.data || [])
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
    setForm({ ...form, items: [...form.items, { productId: '', productName: '', quantity: '' }] })
  }

  function handleRemoveRow(idx) {
    const updated = form.items.filter((_, i) => i !== idx)
    setForm({ ...form, items: updated.length ? updated : [{ productId: '', productName: '', quantity: '' }] })
  }

  function handleItemChange(idx, field, value) {
    const updated = [...form.items]
    updated[idx][field] = value
    if (field === 'productId') {
      const prod = products.find(p => p.id === value)
      if (prod) {
        updated[idx].productName = prod.name
        updated[idx].sku = prod.sku
      }
    }
    setForm({ ...form, items: updated })
  }

  async function handleSubmit() {
    if (!form.fromWarehouse || !form.toWarehouse) {
      alert('Please select From and To warehouses')
      return
    }
    if (form.fromWarehouse === form.toWarehouse) {
      alert('From and To warehouses must be different')
      return
    }
    const validItems = form.items.filter(it => it.productId && it.quantity > 0)
    if (!validItems.length) {
      alert('Please add at least one product with quantity')
      return
    }

    const totalItems = validItems.reduce((sum, it) => sum + Number(it.quantity), 0)
    const payload = {
      fromWarehouse: form.fromWarehouse,
      toWarehouse: form.toWarehouse,
      transferDate: form.transferDate,
      status: form.status,
      items: validItems.map(it => ({ productId: it.productId, productName: it.productName, sku: it.sku, quantity: Number(it.quantity) })),
      totalItems
    }

    try {
      if (editingTransfer) {
        await axios.put(`/api/transfers/${editingTransfer.id}`, payload)
      } else {
        await axios.post('/api/transfers', payload)
      }
      setShowModal(false)
      setEditingTransfer(null)
      resetForm()
      fetchTransfers()
    } catch (err) {
      alert('Error saving transfer: ' + (err.response?.data?.error || err.message))
    }
  }

  function resetForm() {
    setForm({
      fromWarehouse: '',
      toWarehouse: '',
      transferDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: [{ productId: '', productName: '', quantity: '' }]
    })
  }

  function handleEdit(transfer) {
    setEditingTransfer(transfer)
    setForm({
      fromWarehouse: transfer.fromWarehouse,
      toWarehouse: transfer.toWarehouse,
      transferDate: transfer.transferDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: transfer.status,
      items: transfer.items?.length ? transfer.items : [{ productId: '', productName: '', quantity: '' }]
    })
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transfer?')) return
    try {
      await axios.delete(`/api/transfers/${id}`)
      fetchTransfers()
    } catch (err) {
      alert('Error deleting transfer: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await axios.patch(`/api/transfers/${id}/status`, { status: newStatus })
      fetchTransfers()
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleValidate(transfer) {
    if (transfer.status === 'Done') {
      alert('Transfer already validated')
      return
    }
    if (!confirm('Validate this transfer? Stock will be moved between warehouses.')) return
    try {
      await axios.post(`/api/transfers/${transfer.id}/validate`)
      fetchTransfers()
      alert('Transfer validated successfully!')
    } catch (err) {
      alert('Error validating transfer: ' + (err.response?.data?.error || err.message))
    }
  }

  const filtered = transfers.filter(t => {
    const matchSearch = !searchTerm || 
      (t.fromWarehouse?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.toWarehouse?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.id?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = !statusFilter || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: transfers.length,
    draft: transfers.filter(t => t.status === 'Draft').length,
    inTransit: transfers.filter(t => t.status === 'In Transit').length,
    completed: transfers.filter(t => t.status === 'Done').length
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Poppins' }}>Internal Transfers</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Move stock between warehouses and locations</p>
        </div>
        <button onClick={() => { resetForm(); setEditingTransfer(null); setShowModal(true) }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,212,191,0.3)' }}>+ New Transfer</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Transfers', value: stats.total, color: '#2DD4BF', icon: '🔄' },
          { label: 'Draft', value: stats.draft, color: '#94A3B8', icon: '📝' },
          { label: 'In Transit', value: stats.inTransit, color: '#F59E0B', icon: '🚚' },
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
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by warehouse or ID..." style={{ flex: 1, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 14, minWidth: 150 }}>
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="In Transit">In Transit</option>
          <option value="Done">Done</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {/* Transfers Table */}
      <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>From</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>To</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Items</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(transfer => (
              <tr key={transfer.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{transfer.id?.slice(0, 8)}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{transfer.fromWarehouse}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{transfer.toWarehouse}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#1F2937' }}>{transfer.totalItems || transfer.items?.length || 0}</td>
                <td style={{ padding: 12, fontSize: 13, color: '#6B7280' }}>{new Date(transfer.transferDate || transfer.ts).toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>
                  <select value={transfer.status} onChange={e => handleStatusChange(transfer.id, e.target.value)} disabled={transfer.status === 'Done'} style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid #E5E7EB', background: transfer.status === 'Done' ? '#D1FAE5' : transfer.status === 'In Transit' ? '#FEF3C7' : '#F3F4F6', color: transfer.status === 'Done' ? '#065F46' : transfer.status === 'In Transit' ? '#92400E' : '#6B7280' }}>
                    <option value="Draft">Draft</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {transfer.status !== 'Done' && transfer.status !== 'Canceled' && (
                      <button onClick={() => handleValidate(transfer)} style={{ padding: '6px 12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✓ Validate</button>
                    )}
                    <button onClick={() => handleEdit(transfer)} disabled={transfer.status === 'Done'} style={{ padding: '6px 12px', background: transfer.status === 'Done' ? '#E5E7EB' : '#3B82F6', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: transfer.status === 'Done' ? 'not-allowed' : 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(transfer.id)} style={{ padding: '6px 12px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No transfers found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', borderRadius: 12, width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>{editingTransfer ? 'Edit Transfer' : 'New Transfer'}</h2>
              <button onClick={() => { setShowModal(false); setEditingTransfer(null); resetForm() }} style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>From Warehouse *</label>
                  <select value={form.fromWarehouse} onChange={e => setForm({ ...form, fromWarehouse: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.name}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>To Warehouse *</label>
                  <select value={form.toWarehouse} onChange={e => setForm({ ...form, toWarehouse: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.name}>{wh.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Transfer Date</label>
                  <input type="date" value={form.transferDate} onChange={e => setForm({ ...form, transferDate: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                    <option value="Draft">Draft</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Products *</label>
                  <button onClick={handleAddRow} style={{ padding: '6px 12px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Product</button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <select value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                      <option value="">Select product</option>
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id}>{prod.name} ({prod.sku})</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Quantity" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
                    <button onClick={() => handleRemoveRow(idx)} disabled={form.items.length === 1} style={{ padding: '8px 12px', background: form.items.length === 1 ? '#E5E7EB' : '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, cursor: form.items.length === 1 ? 'not-allowed' : 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                <button onClick={() => { setShowModal(false); setEditingTransfer(null); resetForm() }} style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSubmit} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save Transfer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
