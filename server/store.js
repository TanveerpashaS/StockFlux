const fs = require('fs')
const path = require('path')

const FILE = path.join(__dirname, 'store.json')

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    const initial = {
      users: [],
      products: [],
      warehouses: [],
      locations: [],
      ledger: [],
      receipts: [],
      deliveries: [],
      transfers: [],
      adjustments: [],
      otps: []
    }
    fs.writeFileSync(FILE, JSON.stringify(initial, null, 2))
  }
}

function read() {
  ensureFile()
  const raw = fs.readFileSync(FILE, 'utf8')
  return JSON.parse(raw || '{}')
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

function getAll(collection) {
  const d = read()
  return d[collection] || []
}

function saveAll(collection, arr) {
  const d = read()
  d[collection] = arr
  write(d)
}

module.exports = { ensureFile, read, write, getAll, saveAll }
