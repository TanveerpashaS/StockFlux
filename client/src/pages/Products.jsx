import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Modal from '../components/Modal'

function ProductForm({ initial = {}, onSave, onClose }){
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data || [])).catch(() => {})
  }, [])

  async function submit(e){
    e.preventDefault()
    setError(null)
    const f = Object.fromEntries(new FormData(e.target))
    try{
      if (initial.sku) {
        await axios.put(`/api/products/${initial.sku}`, f)
      } else {
        await axios.post('/api/products', { ...f, initialStock: Number(f.initialStock||0), reorderLevel: Number(f.reorderLevel||0) })
      }
      onSave()
    }catch(err){ setError(err.response?.data?.error || 'Failed to save product') }
  }

  return (
    <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:18}}>
      <div>
        <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Product Name *</label>
        <input name="name" defaultValue={initial.name||''} placeholder="e.g. Steel Rods" required style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,transition:'all 0.2s',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>SKU / Code *</label>
          <input name="sku" defaultValue={initial.sku||''} placeholder="e.g. SR-001" required disabled={Boolean(initial.sku)} style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:initial.sku?'#F9FAFB':'white',cursor:initial.sku?'not-allowed':'text',outline:'none'}} />
        </div>
        <div>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Unit of Measure</label>
          <input name="uom" defaultValue={initial.uom||'units'} placeholder="e.g. pcs, kg, liters" style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,transition:'all 0.2s',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Category</label>
          <select name="category" defaultValue={initial.category||''} style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',transition:'all 0.2s'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value="Raw Materials">Raw Materials</option>
            <option value="Finished Goods">Finished Goods</option>
            <option value="Consumables">Consumables</option>
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Reorder Level</label>
          <input name="reorderLevel" type="number" defaultValue={initial.reorderLevel||10} placeholder="10" style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,transition:'all 0.2s',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
        </div>
      </div>
      {!initial.sku && (
        <div>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Initial Stock (Optional)</label>
          <input name="initialStock" type="number" placeholder="0" style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,transition:'all 0.2s',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
          <div style={{fontSize:12,color:'#9CA3AF',marginTop:6}}>Starting inventory quantity for this product</div>
        </div>
      )}
      {error && <div style={{padding:'12px 16px',background:'#FEE2E2',color:'#DC2626',borderRadius:10,fontSize:14}}>{error}</div>}
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button type="submit" style={{flex:1,padding:'12px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 14px rgba(45,212,191,0.4)'}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>
          {initial.sku ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={onClose} style={{padding:'12px 24px',background:'#F3F4F6',color:'#6B7280',border:'none',borderRadius:10,fontSize:15,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}} onMouseEnter={(e)=>e.target.style.background='#E5E7EB'} onMouseLeave={(e)=>e.target.style.background='#F3F4F6'}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function Products(){
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(()=>{ fetch() },[])
  async function fetch(){ 
    try{ 
      const r = await axios.get('/api/products')
      setProducts(r.data)
    }catch(e){} 
  }

  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name+p.sku).toLowerCase().includes(q.toLowerCase())
    const matchCategory = !categoryFilter || p.category === categoryFilter
    const matchStock = stockFilter === 'all' || 
                      (stockFilter === 'low' && p.stock <= (p.reorderLevel || 0)) ||
                      (stockFilter === 'out' && p.stock === 0) ||
                      (stockFilter === 'in-stock' && p.stock > (p.reorderLevel || 0))
    return matchSearch && matchCategory && matchStock
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const lowStockCount = products.filter(p => p.stock <= (p.reorderLevel || 0) && p.stock > 0).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div style={{width:'100%',height:'100%'}}>
      {/* Header with Stats */}
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div>
            <h1 style={{fontSize:28,fontWeight:800,color:'#1F2937',marginBottom:6,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-0.5px'}}>Products</h1>
            <p style={{fontSize:14,color:'#6B7280'}}>Manage your product catalog and inventory levels</p>
          </div>
          <button onClick={()=>{setEditing(null);setOpen(true)}} style={{padding:'12px 24px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px rgba(45,212,191,0.4)',transition:'all 0.3s'}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>
            <span style={{fontSize:18}}>+</span> Add Product
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:24}}>
          <div style={{background:'linear-gradient(135deg, #312E81 0%, #4C1D95 100%)',borderRadius:14,padding:'20px 24px',color:'white'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>Total Products</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:'Plus Jakarta Sans, Poppins'}}>{products.length}</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #10B981 0%, #059669 100%)',borderRadius:14,padding:'20px 24px',color:'white'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>Total Stock</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:'Plus Jakarta Sans, Poppins'}}>{totalStock}</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',borderRadius:14,padding:'20px 24px',color:'white'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>Low Stock</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:'Plus Jakarta Sans, Poppins'}}>{lowStockCount}</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',borderRadius:14,padding:'20px 24px',color:'white'}}>
            <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>Out of Stock</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:'Plus Jakarta Sans, Poppins'}}>{outOfStockCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{background:'white',borderRadius:14,padding:'20px 24px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #F3F4F6',display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:'1 1 280px'}}>
            <input value={q} onChange={e=>setQ(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,outline:'none',transition:'all 0.2s'}} placeholder="🔍 Search by name or SKU..." onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
          </div>
          <div style={{flex:'0 0 auto'}}>
            <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',minWidth:160}}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{flex:'0 0 auto'}}>
            <select value={stockFilter} onChange={e=>setStockFilter(e.target.value)} style={{padding:'10px 14px',borderRadius:10,border:'2px solid #E5E7EB',fontSize:14,background:'white',cursor:'pointer',outline:'none',minWidth:160}}>
              <option value="all">All Stock Levels</option>
              <option value="in-stock">✅ In Stock</option>
              <option value="low">⚠️ Low Stock</option>
              <option value="out">❌ Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div style={{background:'white',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',border:'1px solid #F3F4F6',overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F9FAFB',borderBottom:'1px solid #F3F4F6'}}>
                <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Product</th>
                <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>SKU</th>
                <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Category</th>
                <th style={{padding:'16px 20px',textAlign:'left',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Unit</th>
                <th style={{padding:'16px 20px',textAlign:'center',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Stock</th>
                <th style={{padding:'16px 20px',textAlign:'center',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Reorder Level</th>
                <th style={{padding:'16px 20px',textAlign:'center',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Status</th>
                <th style={{padding:'16px 20px',textAlign:'center',fontSize:12,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map(p => {
                const stockStatus = p.stock === 0 ? 'out' : p.stock <= (p.reorderLevel || 0) ? 'low' : 'ok'
                return (
                  <tr key={p.sku} style={{borderBottom:'1px solid #F3F4F6',transition:'background 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.background='#F9FAFB'} onMouseLeave={(e)=>e.currentTarget.style.background='white'}>
                    <td style={{padding:'16px 20px'}}>
                      <div style={{fontWeight:700,color:'#1F2937',fontSize:14}}>{p.name}</div>
                    </td>
                    <td style={{padding:'16px 20px',fontFamily:'monospace',fontSize:13,color:'#6B7280'}}>{p.sku}</td>
                    <td style={{padding:'16px 20px'}}>
                      {p.category ? <span style={{display:'inline-block',padding:'4px 10px',borderRadius:6,background:'#F3F4F6',fontSize:12,fontWeight:600,color:'#374151'}}>{p.category}</span> : <span style={{color:'#D1D5DB'}}>—</span>}
                    </td>
                    <td style={{padding:'16px 20px',fontSize:13,color:'#6B7280'}}>{p.uom || 'units'}</td>
                    <td style={{padding:'16px 20px',textAlign:'center'}}>
                      <div onClick={()=>setSelectedProduct(p)} style={{cursor:'pointer',display:'inline-block'}} title="Click to see warehouse breakdown">
                        <span style={{fontSize:18,fontWeight:800,color:stockStatus==='out'?'#EF4444':stockStatus==='low'?'#F59E0B':'#10B981'}}>{p.stock || 0}</span>
                        {p.byLocation && Object.keys(p.byLocation).length > 0 && <span style={{fontSize:10,color:'#9CA3AF',marginLeft:4}}>▼</span>}
                      </div>
                    </td>
                    <td style={{padding:'16px 20px',textAlign:'center',fontSize:14,color:'#9CA3AF'}}>{p.reorderLevel || 0}</td>
                    <td style={{padding:'16px 20px',textAlign:'center'}}>
                      <span style={{display:'inline-block',padding:'4px 12px',borderRadius:6,fontSize:12,fontWeight:700,background:stockStatus==='out'?'#FEE2E2':stockStatus==='low'?'#FEF3C7':'#D1FAE5',color:stockStatus==='out'?'#DC2626':stockStatus==='low'?'#D97706':'#059669'}}>
                        {stockStatus==='out'?'Out of Stock':stockStatus==='low'?'Low Stock':'In Stock'}
                      </span>
                    </td>
                    <td style={{padding:'16px 20px',textAlign:'center'}}>
                      <button onClick={()=>{setEditing(p);setOpen(true)}} style={{padding:'6px 14px',background:'#F3F4F6',border:'none',borderRadius:8,fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer',transition:'all 0.2s'}} onMouseEnter={(e)=>e.target.style.background='#E5E7EB'} onMouseLeave={(e)=>e.target.style.background='#F3F4F6'}>
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="8" style={{padding:60,textAlign:'center',color:'#9CA3AF'}}>
                    <div style={{fontSize:48,marginBottom:16}}>📦</div>
                    <div style={{fontSize:16,fontWeight:600,color:'#6B7280'}}>No products found</div>
                    <div style={{fontSize:14,marginTop:8}}>Try adjusting your filters or add a new product</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={open} title={editing ? 'Edit Product' : 'Add New Product'} onClose={() => setOpen(false)}>
        <ProductForm initial={editing||{}} onSave={() => { setOpen(false); fetch() }} onClose={() => setOpen(false)} />
      </Modal>

      {/* Stock Breakdown Modal */}
      {selectedProduct && (
        <div onClick={()=>setSelectedProduct(null)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div onClick={(e)=>e.stopPropagation()} style={{background:'white',borderRadius:16,padding:32,maxWidth:500,width:'90%',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}}>
            <div style={{marginBottom:24}}>
              <h2 style={{fontSize:20,fontWeight:700,color:'#1F2937',marginBottom:4}}>{selectedProduct.name}</h2>
              <p style={{fontSize:14,color:'#6B7280'}}>Stock by Warehouse</p>
            </div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:14,color:'#6B7280',marginBottom:12}}>SKU: <span style={{fontFamily:'monospace',fontWeight:600,color:'#374151'}}>{selectedProduct.sku}</span></div>
              <div style={{padding:16,background:'#F9FAFB',borderRadius:12,marginBottom:16}}>
                <div style={{fontSize:13,color:'#6B7280',marginBottom:4}}>Total Stock</div>
                <div style={{fontSize:32,fontWeight:800,color:'#1F2937'}}>{selectedProduct.stock || 0} <span style={{fontSize:14,fontWeight:400,color:'#9CA3AF'}}>{selectedProduct.uom || 'units'}</span></div>
              </div>
              {selectedProduct.byLocation && Object.keys(selectedProduct.byLocation).length > 0 ? (
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#6B7280',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px'}}>Warehouse Breakdown</div>
                  {Object.entries(selectedProduct.byLocation).map(([location, qty]) => (
                    <div key={location} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'white',border:'1px solid #E5E7EB',borderRadius:10,marginBottom:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:'#2DD4BF'}}></div>
                        <span style={{fontSize:14,fontWeight:600,color:'#374151'}}>{location}</span>
                      </div>
                      <span style={{fontSize:16,fontWeight:700,color:qty > 0 ? '#10B981' : '#EF4444'}}>{qty} {selectedProduct.uom || 'units'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{padding:20,textAlign:'center',color:'#9CA3AF',fontSize:14}}>No warehouse data available</div>
              )}
            </div>
            <button onClick={()=>setSelectedProduct(null)} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
