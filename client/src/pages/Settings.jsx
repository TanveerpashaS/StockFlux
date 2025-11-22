import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('warehouses')
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const [warehouseForm, setWarehouseForm] = useState({ name: '', address: '', type: 'Main' })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchWarehouses()
    fetchCategories()
  }, [])

  async function fetchWarehouses() {
    try {
      const res = await axios.get('/api/warehouses')
      setWarehouses(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchCategories() {
    try {
      const res = await axios.get('/api/categories')
      setCategories(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSaveWarehouse() {
    if (!warehouseForm.name) {
      alert('Warehouse name is required')
      return
    }
    try {
      if (editingWarehouse) {
        await axios.put(`/api/warehouses/${editingWarehouse.id}`, warehouseForm)
      } else {
        await axios.post('/api/warehouses', warehouseForm)
      }
      setShowWarehouseModal(false)
      setEditingWarehouse(null)
      setWarehouseForm({ name: '', address: '', type: 'Main' })
      fetchWarehouses()
    } catch (err) {
      alert('Error saving warehouse: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleDeleteWarehouse(id) {
    if (!confirm('Delete this warehouse? This cannot be undone.')) return
    try {
      await axios.delete(`/api/warehouses/${id}`)
      fetchWarehouses()
    } catch (err) {
      alert('Error deleting warehouse: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleSaveCategory() {
    if (!categoryForm.name) {
      alert('Category name is required')
      return
    }
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, categoryForm)
      } else {
        await axios.post('/api/categories', categoryForm)
      }
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '' })
      fetchCategories()
    } catch (err) {
      alert('Error saving category: ' + (err.response?.data?.error || err.message))
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this category? This cannot be undone.')) return
    try {
      await axios.delete(`/api/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert('Error deleting category: ' + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Poppins' }}>Settings</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Manage warehouses, categories, and system configuration</p>
      </div>

      {/* Tabs */}
      <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6' }}>
          <button onClick={() => setActiveTab('warehouses')} style={{ flex: 1, padding: '16px 24px', background: activeTab === 'warehouses' ? '#2DD4BF' : 'transparent', color: activeTab === 'warehouses' ? '#FFF' : '#6B7280', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            🏢 Warehouses
          </button>
          <button onClick={() => setActiveTab('categories')} style={{ flex: 1, padding: '16px 24px', background: activeTab === 'categories' ? '#2DD4BF' : 'transparent', color: activeTab === 'categories' ? '#FFF' : '#6B7280', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            📂 Categories
          </button>
          <button onClick={() => setActiveTab('system')} style={{ flex: 1, padding: '16px 24px', background: activeTab === 'system' ? '#2DD4BF' : 'transparent', color: activeTab === 'system' ? '#FFF' : '#6B7280', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            ⚙️ System
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 32 }}>
          {activeTab === 'warehouses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Warehouse Management</h2>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>Add and manage warehouse locations</p>
                </div>
                <button onClick={() => { setEditingWarehouse(null); setWarehouseForm({ name: '', address: '', type: 'Main' }); setShowWarehouseModal(true) }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ Add Warehouse</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {warehouses.map(wh => (
                  <div key={wh.id} style={{ background: '#F9FAFB', padding: 20, borderRadius: 12, border: '2px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>{wh.name}</h3>
                        <span style={{ display: 'inline-block', padding: '3px 10px', background: '#2DD4BF', color: '#FFF', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{wh.type || 'Main'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditingWarehouse(wh); setWarehouseForm({ name: wh.name, address: wh.address || '', type: wh.type || 'Main' }); setShowWarehouseModal(true) }} style={{ padding: '6px 10px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDeleteWarehouse(wh.id)} style={{ padding: '6px 10px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                    {wh.address && (
                      <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{wh.address}</p>
                    )}
                  </div>
                ))}
                {!warehouses.length && (
                  <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>No warehouses yet</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Click "Add Warehouse" to create your first location</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Category Management</h2>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>Organize products into categories</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); setShowCategoryModal(true) }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ Add Category</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ background: '#F9FAFB', padding: 20, borderRadius: 12, border: '2px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', margin: 0 }}>{cat.name}</h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '' }); setShowCategoryModal(true) }} style={{ padding: '6px 10px', background: '#3B82F6', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '6px 10px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                    {cat.description && (
                      <p style={{ fontSize: 13, color: '#6B7280', margin: 0, marginTop: 8 }}>{cat.description}</p>
                    )}
                  </div>
                ))}
                {!categories.length && (
                  <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>No categories yet</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Click "Add Category" to create your first category</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', marginBottom: 24 }}>System Configuration</h2>
              
              <div style={{ background: '#F9FAFB', padding: 24, borderRadius: 12, border: '2px solid #E5E7EB', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Application Info</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>Application Name</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>StockFlux IMS</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>Version</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>1.0.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ fontSize: 14, color: '#6B7280' }}>Environment</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>Development</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FEF3C7', padding: 20, borderRadius: 12, border: '2px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>System Settings Coming Soon</h3>
                    <p style={{ fontSize: 13, color: '#78350F', margin: 0 }}>Additional configuration options like notification preferences, backup settings, and security options will be available in future updates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Modal */}
      {showWarehouseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', borderRadius: 12, width: '90%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
              <button onClick={() => { setShowWarehouseModal(false); setEditingWarehouse(null) }} style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Warehouse Name *</label>
                <input type="text" value={warehouseForm.name} onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} placeholder="e.g. Main Warehouse" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Type</label>
                <select value={warehouseForm.type} onChange={e => setWarehouseForm({...warehouseForm, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}>
                  <option value="Main">Main</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Production">Production</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Address</label>
                <textarea value={warehouseForm.address} onChange={e => setWarehouseForm({...warehouseForm, address: e.target.value})} placeholder="Enter warehouse address..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowWarehouseModal(false); setEditingWarehouse(null) }} style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveWarehouse} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', borderRadius: 12, width: '90%', maxWidth: 500, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null) }} style={{ background: 'transparent', border: 'none', fontSize: 24, color: '#9CA3AF', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category Name *</label>
                <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. Raw Materials" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                <textarea value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} placeholder="Enter category description..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowCategoryModal(false); setEditingCategory(null) }} style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveCategory} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
