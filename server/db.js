const fs = require('fs')
const path = require('path')

const FILE = path.join(__dirname, 'data.json')

function load() {
  try {
    if (!fs.existsSync(FILE)) {
      fs.writeFileSync(FILE, JSON.stringify({ watchlist: [] }, null, 2))
    }
    const raw = fs.readFileSync(FILE, 'utf8')
    return JSON.parse(raw || '{"watchlist":[]}')
  } catch (err) {
    return { watchlist: [] }
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

function getWatchlist() {
  const d = load()
  return d.watchlist || []
}

function addWatchlist(item) {
  const d = load()
  d.watchlist = d.watchlist || []
  d.watchlist.push(item)
  save(d)
}

function removeWatchlist(symbol) {
  const d = load()
  d.watchlist = (d.watchlist || []).filter(w => w.symbol !== symbol)
  save(d)
}

module.exports = { getWatchlist, addWatchlist, removeWatchlist }
