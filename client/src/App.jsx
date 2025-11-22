import React, { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import MultiRowForm from './components/MultiRowForm'
import Sparkline from './components/Sparkline'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Receipts from './pages/Receipts'
import Deliveries from './pages/Deliveries'
import Transfers from './pages/Transfers'
import Adjustments from './pages/Adjustments'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Reset from './pages/Reset'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
axios.defaults.baseURL = API

function setAuthToken(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete axios.defaults.headers.common['Authorization']
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [kpis, setKpis] = useState(null)
  const [products, setProducts] = useState([])
  const [err, setErr] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      // decode user lightly (we stored minimal info on login response)
    } else {
      setAuthToken(null)
    }
  }, [token])

  // On mount, validate any existing token with the server and redirect appropriately
  useEffect(() => {
    async function validate() {
      const t = localStorage.getItem('token')
      if (!t) return
      try {
        setAuthToken(t)
        const r = await axios.get('/auth/me')
        setUser(r.data)
        setToken(t)
        setView('dashboard')
      } catch (err) {
        // invalid token — clear
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setAuthToken(null)
        setAuthMode('login')
      }
    }
    validate()
  }, [])

  useEffect(() => {
    fetchDashboard()
    fetchProducts()
    socketRef.current = io(API)
    socketRef.current.on('stock_update', (p) => {
      setProducts(prev => prev.map(prod => prod.sku === p.sku ? { ...prod, stock: p.total, byLocation: p.byLocation } : prod))
    })
    return () => socketRef.current.disconnect()
  }, [])

  async function fetchDashboard() {
    try {
      const r = await axios.get(`${API}/api/dashboard`)
      setKpis(r.data)
    } catch (e) {
      // ignore
    }
  }

  async function fetchProducts() {
    try {
      const r = await axios.get(`${API}/api/products`)
      setProducts(r.data)
    } catch (e) {
      // ignore
    }
  }

  // Called by Login/Signup pages on successful auth
  function onAuthSuccess(data){
    if (!data) return
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user || null)
    // ensure we show the main dashboard after successful auth
    setView('dashboard')
    setAuthMode('login')
  }

  function doLogout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setAuthMode('login')
    setView('dashboard')
  }

  async function createProduct(e) {
    e.preventDefault()
    setErr(null)
    const f = Object.fromEntries(new FormData(e.target))
    if (!f.name || !f.sku) return setErr('Name and SKU are required')
    try {
      await axios.post(`${API}/api/products`, { ...f, initialStock: Number(f.initialStock || 0) })
      fetchProducts()
    } catch (err) {
      setErr(err.response?.data?.error || 'Create failed')
    }
  }
  
  // Accept either event (old form) or payload from MultiRowForm
  async function postReceipt(e) {
    setErr(null)
    let supplier = null, items = []
    if (e && e.preventDefault) {
      e.preventDefault()
      const f = Object.fromEntries(new FormData(e.target))
      supplier = f.supplier
      items = [{ sku: f.sku, qty: Number(f.qty), location: f.location || 'UNPLACED' }]
    } else if (e && typeof e === 'object') {
      // payload from MultiRowForm: e = { supplier?, items }
      supplier = e.supplier || null
      items = (e.items || []).map(it => ({ sku: it.sku, qty: Number(it.qty), location: it.location || 'UNPLACED' }))
    }
    const r = await axios.post('/api/receipts', { supplier, items })
    fetchProducts(); fetchDashboard()
    return r.data
  }

  async function postDelivery(e) {
    setErr(null)
    let customer = null, items = []
    if (e && e.preventDefault) {
      e.preventDefault()
      const f = Object.fromEntries(new FormData(e.target))
      customer = f.customer
      items = [{ sku: f.sku, qty: Number(f.qty), location: f.location || 'UNPLACED' }]
    } else if (e && typeof e === 'object') {
      customer = e.customer || null
      items = (e.items || []).map(it => ({ sku: it.sku, qty: Number(it.qty), location: it.location || 'UNPLACED' }))
    }
    const r = await axios.post('/api/deliveries', { customer, items })
    fetchProducts(); fetchDashboard()
    return r.data
  }

  return (
    <div className="app" style={{maxWidth:'none',margin:0,padding:0,minHeight:'100vh'}}>
      {/* If not authenticated, show standalone auth pages (no sidebar) */}
      {!token ? (
        <main className="auth-page">
          {authMode === 'login' && <Login onSuccess={onAuthSuccess} toSignup={() => setAuthMode('signup')} toReset={() => setAuthMode('reset')} />}
          {authMode === 'signup' && <Signup onSuccess={onAuthSuccess} toLogin={() => setAuthMode('login')} />}
          {authMode === 'reset' && <Reset toLogin={() => setAuthMode('login')} />}
        </main>
      ) : (
        <div className="layout" style={{gridTemplateColumns: sidebarCollapsed ? '70px 1fr' : '260px 1fr', gap:0, minHeight:'100vh'}}>
          <Sidebar view={view} setView={setView} onLogout={doLogout} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <div className="content" style={{padding:'24px 32px', background:'var(--bg)', minHeight:'100vh', overflowY:'auto', height:'100vh'}}>
            {view === 'dashboard' && <Dashboard />}
            {view === 'products' && <Products />}
            {view === 'receipts' && <Receipts />}
            {view === 'deliveries' && <Deliveries />}
            {view === 'transfers' && <Transfers />}
            {view === 'adjustments' && <Adjustments />}
            {view === 'history' && <History />}
            {view === 'settings' && <Settings />}
            {view === 'profile' && <Profile onLogout={doLogout} />}
          </div>
        </div>
      )}
    </div>
  )
}
