// Simple data model schemas (documentation + basic defaults)
module.exports = {
  User: {
    id: 'string (uuid)',
    name: 'string|null',
    email: 'string (unique)',
    password: 'string (hashed)',
    createdAt: 'number (timestamp)'
  },
  Product: {
    id: 'string (uuid)',
    name: 'string',
    sku: 'string (unique)',
    category: 'string|null',
    uom: 'string|null',
    reorderLevel: 'number'
  },
  Warehouse: {
    id: 'string (uuid)',
    name: 'string',
    locationCode: 'string',
    address: 'string|null'
  },
  Location: {
    id: 'string (uuid)',
    warehouseId: 'string',
    code: 'string',
    description: 'string|null'
  },
  LedgerEntry: {
    id: 'string (uuid)',
    sku: 'string',
    qty_change: 'number',
    location: 'string',
    type: 'initial|receipt|delivery|transfer_in|transfer_out|adjustment',
    ts: 'number',
    ref: 'string|null'
  },
  Receipt: {
    id: 'string', supplier: 'string|null', items: 'array of {sku,qty,location}', status: 'string', ts: 'number'
  },
  Delivery: {
    id: 'string', customer: 'string|null', items: 'array of {sku,qty,location}', status: 'string', ts: 'number'
  },
  Transfer: {
    id: 'string', fromLocation: 'string', toLocation: 'string', items: 'array of {sku,qty}', status: 'string', ts: 'number'
  },
  Adjustment: {
    id: 'string', location: 'string', items: 'array of {sku,countedQty}', status: 'string', ts: 'number'
  }
}
