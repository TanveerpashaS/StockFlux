require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const store = require('./store')
const validate = require('./validate')
const schemas = require('./schemas')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

store.ensureFile()

// HTTP + socket.io
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

// Helper: compute aggregated stock totals from ledger
function computeStockTotals(userId = null) {
  const ledger = store.getAll('ledger')
  const filtered = userId ? ledger.filter(e => e.userId === userId) : ledger
  const totals = {}
  for (const e of filtered) {
    totals[e.sku] = totals[e.sku] || { total: 0, byLocation: {} }
    totals[e.sku].total += e.qty_change
    const loc = e.location || 'UNPLACED'
    totals[e.sku].byLocation[loc] = (totals[e.sku].byLocation[loc] || 0) + e.qty_change
  }
  return totals
}

// Real-time: allow clients to join rooms for skus or locations
io.on('connection', (socket) => {
  socket.on('subscribe_sku', (sku) => { if (sku) socket.join(`sku:${sku}`) })
  socket.on('unsubscribe_sku', (sku) => { if (sku) socket.leave(`sku:${sku}`) })
  socket.on('subscribe_location', (loc) => { if (loc) socket.join(`loc:${loc}`) })
  socket.on('unsubscribe_location', (loc) => { if (loc) socket.leave(`loc:${loc}`) })
})

function broadcastStockUpdate(sku) {
  const totals = computeStockTotals()
  const payload = { sku, total: totals[sku]?.total || 0, byLocation: totals[sku]?.byLocation || {} }
  io.to(`sku:${sku}`).emit('stock_update', payload)
  // also emit global update
  io.emit('stock_update', payload)
}

// --- Auth ---
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body
  const v = validate.validateSignup(req.body)
  if (!v.ok) return res.status(400).json({ error: v.error })
  const users = store.getAll('users')
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'email exists' })
  const hash = await bcrypt.hash(password, 10)
  const user = { id: uuidv4(), name: name || null, email: email.toLowerCase(), password: hash, createdAt: Date.now() }
  users.push(user)
  store.saveAll('users', users)
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  const users = store.getAll('users')
  const u = users.find(x => x.email === email)
  if (!u) return res.status(401).json({ error: 'invalid credentials' })
  const ok = await bcrypt.compare(password, u.password)
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })
  const token = jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: u.id, name: u.name, email: u.email } })
})

app.get('/auth/me', (req, res) => {
  const h = req.headers.authorization
  if (!h) return res.status(401).json({ error: 'missing auth' })
  const token = h.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const users = store.getAll('users')
    const u = users.find(x => x.id === payload.sub)
    if (!u) return res.status(404).json({ error: 'user not found' })
    return res.json({ id: u.id, name: u.name, email: u.email })
  } catch (err) { return res.status(401).json({ error: 'invalid token' }) }
})

app.post('/auth/request-otp', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email required' })
  const users = store.getAll('users')
  const u = users.find(x => x.email === email)
  if (!u) return res.status(400).json({ error: 'email not found' })
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const otps = store.getAll('otps')
  otps.push({ id: uuidv4(), email, code, expiresAt: Date.now() + 15 * 60 * 1000 })
  store.saveAll('otps', otps)
  console.log(`OTP for ${email}: ${code}`)
  res.json({ ok: true })
})

app.post('/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'email, code and newPassword required' })
  const otps = store.getAll('otps')
  const idx = otps.findIndex(o => o.email === email && o.code === code && o.expiresAt > Date.now())
  if (idx === -1) return res.status(400).json({ error: 'invalid or expired code' })
  otps.splice(idx, 1)
  store.saveAll('otps', otps)
  const users = store.getAll('users')
  const u = users.find(x => x.email === email)
  if (!u) return res.status(400).json({ error: 'user not found' })
  u.password = await bcrypt.hash(newPassword, 10)
  store.saveAll('users', users)
  res.json({ ok: true })
})

// Auth middleware
function authMiddleware(req, res, next) {
  const h = req.headers.authorization
  if (!h) return res.status(401).json({ error: 'missing auth' })
  const token = h.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (err) { return res.status(401).json({ error: 'invalid token' }) }
}

// --- Products ---
app.get('/api/products', authMiddleware, (req, res) => {
  const products = store.getAll('products').filter(p => p.userId === req.user.id)
  const totals = computeStockTotals(req.user.id)
  const out = products.map(p => ({ ...p, stock: totals[p.sku]?.total || 0, byLocation: totals[p.sku]?.byLocation || {} }))
  res.json(out)
})

app.post('/api/products', authMiddleware, (req, res) => {
  const { name, sku, category, uom, initialStock = 0, initialLocation = 'UNPLACED', reorderLevel = 0 } = req.body
  const v = validate.validateProduct(req.body)
  if (!v.ok) return res.status(400).json({ error: v.error })
  const products = store.getAll('products')
  if (products.find(p => p.sku === sku && p.userId === req.user.id)) return res.status(400).json({ error: 'sku exists' })
  const p = { id: uuidv4(), userId: req.user.id, name, sku, category: category || null, uom: uom || null, reorderLevel }
  products.push(p)
  store.saveAll('products', products)
  if (initialStock && Number(initialStock) !== 0) {
    const ledger = store.getAll('ledger')
    ledger.push({ id: uuidv4(), userId: req.user.id, sku, qty_change: Number(initialStock), location: initialLocation, type: 'initial', ts: Date.now(), ref: null })
    store.saveAll('ledger', ledger)
    broadcastStockUpdate(sku)
  }
  res.json(p)
})

app.get('/api/products/:sku', authMiddleware, (req, res) => {
  const sku = req.params.sku
  const products = store.getAll('products')
  const p = products.find(x => x.sku === sku && x.userId === req.user.id)
  if (!p) return res.status(404).json({ error: 'not found' })
  const totals = computeStockTotals(req.user.id)
  res.json({ ...p, stock: totals[sku]?.total || 0, byLocation: totals[sku]?.byLocation || {} })
})

app.put('/api/products/:sku', authMiddleware, (req, res) => {
  const sku = req.params.sku
  const products = store.getAll('products')
  const idx = products.findIndex(x => x.sku === sku && x.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  const updated = { ...products[idx], ...req.body, userId: req.user.id }
  products[idx] = updated
  store.saveAll('products', products)
  res.json(updated)
})

app.delete('/api/products/:sku', authMiddleware, (req, res) => {
  const sku = req.params.sku
  let products = store.getAll('products')
  products = products.filter(x => !(x.sku === sku && x.userId === req.user.id))
  store.saveAll('products', products)
  res.json({ ok: true })
})

// --- Operations (Receipts/Deliveries/Transfers/Adjustments) ---
app.post('/api/receipts', authMiddleware, (req, res) => {
  const { supplier, warehouse, expectedDate, status = 'Draft', items = [] } = req.body
  if (!items || items.length === 0) return res.status(400).json({ error: 'items required' })
  const receipts = store.getAll('receipts')
  const id = uuidv4()
  const rec = { 
    id, 
    userId: req.user.id,
    supplier: supplier || null, 
    warehouse: warehouse || 'Main Warehouse',
    expectedDate: expectedDate || new Date().toISOString().split('T')[0],
    status: status,
    items,
    totalItems: items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0),
    totalValue: items.reduce((sum, item) => sum + (parseInt(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0),
    ts: Date.now() 
  }
  receipts.push(rec)
  store.saveAll('receipts', receipts)
  res.json(rec)
})

app.put('/api/receipts/:id', authMiddleware, (req, res) => {
  const id = req.params.id
  const receipts = store.getAll('receipts')
  const idx = receipts.findIndex(r => r.id === id && r.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  
  const { supplier, warehouse, expectedDate, status, items = [] } = req.body
  const updated = {
    ...receipts[idx],
    supplier: supplier || receipts[idx].supplier,
    warehouse: warehouse || receipts[idx].warehouse,
    expectedDate: expectedDate || receipts[idx].expectedDate,
    status: status || receipts[idx].status,
    items: items.length > 0 ? items : receipts[idx].items,
    totalItems: items.length > 0 ? items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0) : receipts[idx].totalItems,
    totalValue: items.length > 0 ? items.reduce((sum, item) => sum + (parseInt(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0) : receipts[idx].totalValue
  }
  receipts[idx] = updated
  store.saveAll('receipts', receipts)
  res.json(updated)
})

app.patch('/api/receipts/:id/status', authMiddleware, (req, res) => {
  const id = req.params.id
  const { status } = req.body
  const receipts = store.getAll('receipts')
  const idx = receipts.findIndex(r => r.id === id && r.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  receipts[idx].status = status
  store.saveAll('receipts', receipts)
  res.json(receipts[idx])
})

app.post('/api/receipts/:id/validate', authMiddleware, (req, res) => {
  const id = req.params.id
  const receipts = store.getAll('receipts')
  const receipt = receipts.find(r => r.id === id && r.userId === req.user.id)
  if (!receipt) return res.status(404).json({ error: 'not found' })
  if (receipt.status === 'Done') return res.status(400).json({ error: 'already validated' })
  
  // Update stock in ledger
  const ledger = store.getAll('ledger')
  const products = store.getAll('products')
  
  for (const item of receipt.items) {
    const product = products.find(p => p.id === item.productId && p.userId === req.user.id)
    if (product) {
      ledger.push({ 
        id: uuidv4(), 
        userId: req.user.id,
        sku: product.sku, 
        qty_change: Number(item.quantity), 
        location: receipt.warehouse, 
        type: 'receipt', 
        ts: Date.now(), 
        ref: id 
      })
      broadcastStockUpdate(product.sku)
    }
  }
  
  store.saveAll('ledger', ledger)
  receipt.status = 'Done'
  store.saveAll('receipts', receipts)
  res.json(receipt)
})

app.delete('/api/receipts/:id', authMiddleware, (req, res) => {
  const id = req.params.id
  let receipts = store.getAll('receipts')
  receipts = receipts.filter(r => r.id !== id)
  store.saveAll('receipts', receipts)
  res.json({ ok: true })
})

app.post('/api/deliveries', authMiddleware, (req, res) => {
  const { customer, warehouse, deliveryDate, status = 'Draft', items = [] } = req.body
  if (!items || items.length === 0) return res.status(400).json({ error: 'items required' })
  const deliveries = store.getAll('deliveries')
  const id = uuidv4()
  const del = { 
    id, 
    userId: req.user.id,
    customer: customer || null, 
    warehouse: warehouse || 'Main Warehouse',
    deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
    status: status,
    items,
    totalItems: items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0),
    ts: Date.now() 
  }
  deliveries.push(del)
  store.saveAll('deliveries', deliveries)
  res.json(del)
})

app.put('/api/deliveries/:id', authMiddleware, (req, res) => {
  const id = req.params.id
  const deliveries = store.getAll('deliveries')
  const idx = deliveries.findIndex(d => d.id === id && d.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  
  const { customer, warehouse, deliveryDate, status, items = [] } = req.body
  const updated = {
    ...deliveries[idx],
    customer: customer || deliveries[idx].customer,
    warehouse: warehouse || deliveries[idx].warehouse,
    deliveryDate: deliveryDate || deliveries[idx].deliveryDate,
    status: status || deliveries[idx].status,
    items: items.length > 0 ? items : deliveries[idx].items,
    totalItems: items.length > 0 ? items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0) : deliveries[idx].totalItems
  }
  deliveries[idx] = updated
  store.saveAll('deliveries', deliveries)
  res.json(updated)
})

app.patch('/api/deliveries/:id/status', authMiddleware, (req, res) => {
  const id = req.params.id
  const { status } = req.body
  const deliveries = store.getAll('deliveries')
  const idx = deliveries.findIndex(d => d.id === id && d.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })
  deliveries[idx].status = status
  store.saveAll('deliveries', deliveries)
  res.json(deliveries[idx])
})

app.post('/api/deliveries/:id/validate', authMiddleware, (req, res) => {
  const id = req.params.id
  const deliveries = store.getAll('deliveries')
  const delivery = deliveries.find(d => d.id === id && d.userId === req.user.id)
  if (!delivery) return res.status(404).json({ error: 'not found' })
  if (delivery.status === 'Done') return res.status(400).json({ error: 'already validated' })
  
  // Update stock in ledger (decrease stock)
  const ledger = store.getAll('ledger')
  const products = store.getAll('products')
  
  for (const item of delivery.items) {
    const product = products.find(p => p.id === item.productId && p.userId === req.user.id)
    if (product) {
      ledger.push({ 
        id: uuidv4(), 
        userId: req.user.id,
        sku: product.sku, 
        qty_change: -Number(item.quantity), 
        location: delivery.warehouse, 
        type: 'delivery', 
        ts: Date.now(), 
        ref: id 
      })
      broadcastStockUpdate(product.sku)
    }
  }
  
  store.saveAll('ledger', ledger)
  delivery.status = 'Done'
  store.saveAll('deliveries', deliveries)
  res.json(delivery)
})

app.delete('/api/deliveries/:id', authMiddleware, (req, res) => {
  const id = req.params.id
  let deliveries = store.getAll('deliveries')
  deliveries = deliveries.filter(d => d.id !== id)
  store.saveAll('deliveries', deliveries)
  res.json({ ok: true })
})

// Transfers - Create
app.post('/api/transfers', authMiddleware, (req, res) => {
  const { fromWarehouse, toWarehouse, transferDate, status = 'Draft', items = [], totalItems } = req.body
  if (!fromWarehouse || !toWarehouse) return res.status(400).json({ error: 'fromWarehouse and toWarehouse required' })
  if (!items.length) return res.status(400).json({ error: 'items required' })
  const transfers = store.getAll('transfers')
  const id = uuidv4()
  const t = { id, userId: req.user.id, fromWarehouse, toWarehouse, transferDate, status, items, totalItems, createdAt: Date.now() }
  transfers.push(t)
  store.saveAll('transfers', transfers)
  res.json(t)
})

// Transfers - Update
app.put('/api/transfers/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { fromWarehouse, toWarehouse, transferDate, status, items, totalItems } = req.body
  const transfers = store.getAll('transfers')
  const idx = transfers.findIndex(t => t.id === id && t.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Transfer not found' })
  if (transfers[idx].status === 'Done') return res.status(400).json({ error: 'Cannot edit validated transfer' })
  transfers[idx] = { ...transfers[idx], fromWarehouse, toWarehouse, transferDate, status, items, totalItems, updatedAt: Date.now() }
  store.saveAll('transfers', transfers)
  res.json(transfers[idx])
})

// Transfers - Update Status
app.patch('/api/transfers/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const transfers = store.getAll('transfers')
  const transfer = transfers.find(t => t.id === id && t.userId === req.user.id)
  if (!transfer) return res.status(404).json({ error: 'Transfer not found' })
  if (transfer.status === 'Done') return res.status(400).json({ error: 'Cannot change status of validated transfer' })
  transfer.status = status
  store.saveAll('transfers', transfers)
  res.json(transfer)
})

// Transfers - Validate (move stock)
app.post('/api/transfers/:id/validate', authMiddleware, (req, res) => {
  const { id } = req.params
  const transfers = store.getAll('transfers')
  const transfer = transfers.find(t => t.id === id && t.userId === req.user.id)
  if (!transfer) return res.status(404).json({ error: 'Transfer not found' })
  if (transfer.status === 'Done') return res.status(400).json({ error: 'Transfer already validated' })
  
  const ledger = store.getAll('ledger')
  const products = store.getAll('products')
  
  for (const item of transfer.items) {
    const product = products.find(p => p.id === item.productId && p.userId === req.user.id)
    if (!product) continue
    
    // Remove from source warehouse
    ledger.push({
      id: uuidv4(),
      userId: req.user.id,
      productId: item.productId,
      productName: item.productName,
      sku: product.sku,
      category: product.category,
      qty_change: -Number(item.quantity),
      location: transfer.fromWarehouse,
      type: 'transfer',
      status: 'done',
      ref: id,
      ts: Date.now()
    })
    
    // Add to destination warehouse
    ledger.push({
      id: uuidv4(),
      userId: req.user.id,
      productId: item.productId,
      productName: item.productName,
      sku: product.sku,
      category: product.category,
      qty_change: Number(item.quantity),
      location: transfer.toWarehouse,
      type: 'transfer',
      status: 'done',
      ref: id,
      ts: Date.now()
    })
    
    broadcastStockUpdate(product.sku)
  }
  
  store.saveAll('ledger', ledger)
  transfer.status = 'Done'
  transfer.validatedAt = Date.now()
  store.saveAll('transfers', transfers)
  res.json(transfer)
})

// Transfers - Delete
app.delete('/api/transfers/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const transfers = store.getAll('transfers')
  const filtered = transfers.filter(t => t.id !== id)
  store.saveAll('transfers', filtered)
  res.json({ ok: true })
})

// Adjustments - Create
app.post('/api/adjustments', authMiddleware, (req, res) => {
  const { warehouse, adjustmentDate, reason, status = 'Draft', items = [], totalItems } = req.body
  if (!warehouse) return res.status(400).json({ error: 'warehouse required' })
  if (!items.length) return res.status(400).json({ error: 'items required' })
  const adjustments = store.getAll('adjustments')
  const id = uuidv4()
  const a = { id, userId: req.user.id, warehouse, adjustmentDate, reason, status, items, totalItems, createdAt: Date.now() }
  adjustments.push(a)
  store.saveAll('adjustments', adjustments)
  res.json(a)
})

// Adjustments - Update
app.put('/api/adjustments/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { warehouse, adjustmentDate, reason, status, items, totalItems } = req.body
  const adjustments = store.getAll('adjustments')
  const idx = adjustments.findIndex(a => a.id === id && a.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Adjustment not found' })
  if (adjustments[idx].status === 'Done') return res.status(400).json({ error: 'Cannot edit validated adjustment' })
  adjustments[idx] = { ...adjustments[idx], warehouse, adjustmentDate, reason, status, items, totalItems, updatedAt: Date.now() }
  store.saveAll('adjustments', adjustments)
  res.json(adjustments[idx])
})

// Adjustments - Update Status
app.patch('/api/adjustments/:id/status', authMiddleware, (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const adjustments = store.getAll('adjustments')
  const adjustment = adjustments.find(a => a.id === id && a.userId === req.user.id)
  if (!adjustment) return res.status(404).json({ error: 'Adjustment not found' })
  if (adjustment.status === 'Done') return res.status(400).json({ error: 'Cannot change status of validated adjustment' })
  adjustment.status = status
  store.saveAll('adjustments', adjustments)
  res.json(adjustment)
})

// Adjustments - Validate (apply stock changes)
app.post('/api/adjustments/:id/validate', authMiddleware, (req, res) => {
  const { id } = req.params
  const adjustments = store.getAll('adjustments')
  const adjustment = adjustments.find(a => a.id === id && a.userId === req.user.id)
  if (!adjustment) return res.status(404).json({ error: 'Adjustment not found' })
  if (adjustment.status === 'Done') return res.status(400).json({ error: 'Adjustment already validated' })
  
  const ledger = store.getAll('ledger')
  const products = store.getAll('products')
  const totals = computeStockTotals()
  
  for (const item of adjustment.items) {
    const product = products.find(p => p.id === item.productId && p.userId === req.user.id)
    if (!product) continue
    
    const currentQty = (totals[product.sku]?.byLocation && totals[product.sku].byLocation[adjustment.warehouse]) || 0
    const countedQty = Number(item.countedQty)
    const difference = countedQty - currentQty
    
    if (difference !== 0) {
      ledger.push({
        id: uuidv4(),
        userId: req.user.id,
        productId: item.productId,
        productName: item.productName,
        sku: product.sku,
        category: product.category,
        qty_change: difference,
        location: adjustment.warehouse,
        type: 'adjustment',
        status: 'done',
        ref: id,
        reason: adjustment.reason || 'Stock adjustment',
        ts: Date.now()
      })
      broadcastStockUpdate(product.sku)
    }
  }
  
  store.saveAll('ledger', ledger)
  adjustment.status = 'Done'
  adjustment.validatedAt = Date.now()
  store.saveAll('adjustments', adjustments)
  res.json(adjustment)
})

// Adjustments - Delete
app.delete('/api/adjustments/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const adjustments = store.getAll('adjustments')
  const filtered = adjustments.filter(a => a.id !== id)
  store.saveAll('adjustments', filtered)
  res.json({ ok: true })
})

// Dashboard KPIs
app.get('/api/dashboard', authMiddleware, (req, res) => {
  const products = store.getAll('products').filter(p => p.userId === req.user.id)
  const totals = computeStockTotals(req.user.id)
  const totalProducts = products.length
  const lowStock = products.filter(p => (totals[p.sku]?.total || 0) <= (p.reorderLevel || 0))
  const pendingReceipts = store.getAll('receipts').filter(r => r.userId === req.user.id && r.status !== 'Done' && r.status !== 'Canceled').length
  const pendingDeliveries = store.getAll('deliveries').filter(d => d.userId === req.user.id && d.status !== 'Done' && d.status !== 'Canceled').length
  const transfersScheduled = store.getAll('transfers').filter(t => t.userId === req.user.id && t.status !== 'Done' && t.status !== 'Canceled').length
  res.json({ totalProducts, lowStockCount: lowStock.length, pendingReceipts, pendingDeliveries, transfersScheduled })
})

// Simple endpoints to read ledger and operations
app.get('/api/ledger', authMiddleware, (req, res) => res.json(store.getAll('ledger').filter(l => l.userId === req.user.id)))
app.get('/api/receipts', authMiddleware, (req, res) => res.json(store.getAll('receipts').filter(r => r.userId === req.user.id)))
app.get('/api/deliveries', authMiddleware, (req, res) => res.json(store.getAll('deliveries').filter(d => d.userId === req.user.id)))
app.get('/api/transfers', authMiddleware, (req, res) => res.json(store.getAll('transfers').filter(t => t.userId === req.user.id)))
app.get('/api/adjustments', authMiddleware, (req, res) => res.json(store.getAll('adjustments').filter(a => a.userId === req.user.id)))

// Warehouses API
app.get('/api/warehouses', authMiddleware, (req, res) => res.json(store.getAll('warehouses').filter(w => w.userId === req.user.id)))
app.post('/api/warehouses', authMiddleware, (req, res) => {
  const { name, address, type } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const warehouses = store.getAll('warehouses')
  const id = uuidv4()
  const wh = { id, userId: req.user.id, name, address, type, createdAt: Date.now() }
  warehouses.push(wh)
  store.saveAll('warehouses', warehouses)
  res.json(wh)
})
app.put('/api/warehouses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, address, type } = req.body
  const warehouses = store.getAll('warehouses')
  const idx = warehouses.findIndex(w => w.id === id && w.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Warehouse not found' })
  warehouses[idx] = { ...warehouses[idx], name, address, type, updatedAt: Date.now() }
  store.saveAll('warehouses', warehouses)
  res.json(warehouses[idx])
})
app.delete('/api/warehouses/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const warehouses = store.getAll('warehouses')
  const filtered = warehouses.filter(w => !(w.id === id && w.userId === req.user.id))
  store.saveAll('warehouses', filtered)
  res.json({ ok: true })
})

// Categories API
app.get('/api/categories', authMiddleware, (req, res) => res.json(store.getAll('categories').filter(c => c.userId === req.user.id)))
app.post('/api/categories', authMiddleware, (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const categories = store.getAll('categories')
  const id = uuidv4()
  const cat = { id, userId: req.user.id, name, description, createdAt: Date.now() }
  categories.push(cat)
  store.saveAll('categories', categories)
  res.json(cat)
})
app.put('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const { name, description } = req.body
  const categories = store.getAll('categories')
  const idx = categories.findIndex(c => c.id === id && c.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Category not found' })
  categories[idx] = { ...categories[idx], name, description, updatedAt: Date.now() }
  store.saveAll('categories', categories)
  res.json(categories[idx])
})
app.delete('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params
  const categories = store.getAll('categories')
  const filtered = categories.filter(c => !(c.id === id && c.userId === req.user.id))
  store.saveAll('categories', filtered)
  res.json({ ok: true })
})

// Profile - Change Password
app.patch('/api/profile/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' })
  }
  
  const users = store.getAll('users')
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
  
  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  user.password = hashedPassword
  user.updatedAt = Date.now()
  store.saveAll('users', users)
  
  res.json({ ok: true, message: 'Password updated successfully' })
})

process.on('uncaughtException', err => { console.error('Uncaught Exception:', err); process.exit(1) })
process.on('unhandledRejection', err => { console.error('Unhandled Rejection:', err); process.exit(1) })

server.listen(PORT, () => {
  console.log(`IMS server listening on ${PORT}`)
  console.log('Server started successfully')
})
