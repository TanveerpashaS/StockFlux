const express = require('express')
const app = express()

app.get('/test', (req, res) => {
  res.json({ ok: true })
})

app.listen(4001, () => {
  console.log('Test server on 4001')
})
