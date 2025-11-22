const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSignup(payload) {
  const { email, password, name } = payload || {}
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) return { ok:false, error: 'invalid email' }
  if (!password || typeof password !== 'string' || password.length < 6) return { ok:false, error: 'password must be >= 6 chars' }
  if (name && typeof name !== 'string') return { ok:false, error: 'invalid name' }
  return { ok:true }
}

function validateProduct(payload) {
  const { name, sku } = payload || {}
  if (!name || typeof name !== 'string') return { ok:false, error: 'name required' }
  if (!sku || typeof sku !== 'string' || !/^[A-Za-z0-9_.-]{1,64}$/.test(sku)) return { ok:false, error: 'invalid sku' }
  return { ok:true }
}

function validateItemsArray(items) {
  if (!Array.isArray(items) || items.length === 0) return { ok:false, error: 'items must be non-empty array' }
  for (const it of items) {
    if (!it.sku || typeof it.sku !== 'string') return { ok:false, error: 'each item must have sku' }
    if (typeof it.qty === 'undefined' || isNaN(Number(it.qty))) return { ok:false, error: 'each item must have numeric qty' }
  }
  return { ok:true }
}

module.exports = { validateSignup, validateProduct, validateItemsArray }
