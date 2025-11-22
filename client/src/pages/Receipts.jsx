import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    waiting: 0,
    done: 0
  });

  const [formData, setFormData] = useState({
    supplier: '',
    warehouse: 'Main Warehouse',
    expectedDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    items: [{ productId: '', productName: '', quantity: '', unitPrice: '' }]
  });

  useEffect(() => {
    fetchReceipts();
    fetchProducts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/receipts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceipts(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      draft: data.filter(r => r.status === 'Draft').length,
      waiting: data.filter(r => r.status === 'Waiting').length,
      done: data.filter(r => r.status === 'Done').length
    });
  };

  const handleAddRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', productName: '', quantity: '', unitPrice: '' }]
    });
  };

  const handleRemoveRow = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        productName: product?.name || ''
      };
    } else {
      newItems[index][field] = value;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const validItems = formData.items.filter(item => item.productId && item.quantity > 0);
      if (validItems.length === 0) {
        alert('Please add at least one product with quantity');
        return;
      }

      const receiptData = {
        ...formData,
        items: validItems,
        totalItems: validItems.reduce((sum, item) => sum + parseInt(item.quantity), 0),
        totalValue: validItems.reduce((sum, item) => sum + (parseInt(item.quantity) * parseFloat(item.unitPrice || 0)), 0)
      };

      if (editingReceipt) {
        await axios.put(`http://localhost:4000/api/receipts/${editingReceipt.id}`, receiptData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:4000/api/receipts', receiptData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      fetchReceipts();
      closeModal();
    } catch (error) {
      console.error('Failed to save receipt:', error);
      alert('Failed to save receipt');
    }
  };

  const handleValidate = async (receipt) => {
    if (!window.confirm('Validate this receipt? Stock will be increased automatically.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4000/api/receipts/${receipt.id}/validate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReceipts();
      alert('Receipt validated! Stock has been updated.');
    } catch (error) {
      console.error('Failed to validate receipt:', error);
      alert('Failed to validate receipt');
    }
  };

  const handleStatusChange = async (receipt, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:4000/api/receipts/${receipt.id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReceipts();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this receipt?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/receipts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReceipts();
    } catch (error) {
      console.error('Failed to delete receipt:', error);
    }
  };

  const openModal = (receipt = null) => {
    if (receipt) {
      setEditingReceipt(receipt);
      setFormData({
        supplier: receipt.supplier,
        warehouse: receipt.warehouse,
        expectedDate: receipt.expectedDate,
        status: receipt.status,
        items: receipt.items || [{ productId: '', productName: '', quantity: '', unitPrice: '' }]
      });
    } else {
      setEditingReceipt(null);
      setFormData({
        supplier: '',
        warehouse: 'Main Warehouse',
        expectedDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        items: [{ productId: '', productName: '', quantity: '', unitPrice: '' }]
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReceipt(null);
    setFormData({
      supplier: '',
      warehouse: 'Main Warehouse',
      expectedDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      items: [{ productId: '', productName: '', quantity: '', unitPrice: '' }]
    });
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    const matchesSearch = receipt.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return '#6b7280';
      case 'Waiting': return '#f59e0b';
      case 'Ready': return '#3b82f6';
      case 'Done': return '#10b981';
      case 'Canceled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
              📦 Receipts
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              Manage incoming stock from suppliers
            </p>
          </div>
          <button
            onClick={() => openModal()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
            }}
          >
            + New Receipt
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {[
            { label: 'Total Receipts', value: stats.total, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '📦' },
            { label: 'Draft', value: stats.draft, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '📝' },
            { label: 'Waiting', value: stats.waiting, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '⏳' },
            { label: 'Completed', value: stats.done, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', icon: '✅' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: stat.gradient
              }} />
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="🔍 Search by supplier or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>ID</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Supplier</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Warehouse</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Items</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Total Qty</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Expected Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>
                  #{receipt.id}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a' }}>
                  {receipt.supplier}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {receipt.warehouse}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {receipt.items?.length || 0} items
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1a1a1a', fontWeight: '600' }}>
                  {receipt.totalItems || 0}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {new Date(receipt.expectedDate).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <select
                    value={receipt.status}
                    onChange={(e) => handleStatusChange(receipt, e.target.value)}
                    disabled={receipt.status === 'Done'}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: receipt.status === 'Done' ? 'not-allowed' : 'pointer',
                      background: getStatusColor(receipt.status),
                      color: 'white'
                    }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Ready">Ready</option>
                    <option value="Done">Done</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {receipt.status !== 'Done' && (
                      <button
                        onClick={() => handleValidate(receipt)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Validate
                      </button>
                    )}
                    <button
                      onClick={() => openModal(receipt)}
                      style={{
                        padding: '8px 16px',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReceipts.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '15px' }}>
                  No receipts found. Create your first receipt to get started! 📦
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '28px 32px',
              borderBottom: '2px solid #f3f4f6',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                {editingReceipt ? 'Edit Receipt' : 'Create New Receipt'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Add supplier and products to receive incoming stock
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Warehouse
                  </label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Warehouse 1">Warehouse 1</option>
                    <option value="Warehouse 2">Warehouse 2</option>
                    <option value="Production Floor">Production Floor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Expected Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Ready">Ready</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Products *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      color: '#14b8a6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Product
                  </button>
                </div>

                <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Product</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Quantity</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Unit Price</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280', width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              required
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">Select product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              required
                              placeholder="0"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              placeholder="0.00"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              disabled={formData.items.length === 1}
                              style={{
                                padding: '8px 12px',
                                background: formData.items.length === 1 ? '#f3f4f6' : '#fee2e2',
                                color: formData.items.length === 1 ? '#9ca3af' : '#ef4444',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: formData.items.length === 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '2px solid #f3f4f6' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                  }}
                >
                  {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
