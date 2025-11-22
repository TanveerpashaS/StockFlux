import React, { useMemo, useEffect, useState } from 'react'
import axios from 'axios'

export default function Sparkline({ sku, width = 140, height = 40 }) {
  const [points, setPoints] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const r = await axios.get('/api/ledger')
        const ledger = r.data.filter(e => e.sku === sku).sort((a,b) => a.ts - b.ts)
        const series = []
        let acc = 0
        for (const entry of ledger) { acc += entry.qty_change; series.push({ t: entry.ts, v: acc }) }
        if (mounted) setPoints(series)
      } catch (e) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [sku])

  const path = useMemo(() => {
    if (!points.length) return ''
    const vals = points.map(p => p.v)
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const gap = points.length > 1 ? (width / (points.length - 1)) : width
    const d = points.map((p, i) => {
      const x = i * gap
      const y = max === min ? height / 2 : height - ((p.v - min) / (max - min)) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
    return d
  }, [points, width, height])

  if (!points.length) return <svg className="spark" width={width} height={height} style={{color:'var(--secondary)'}} />
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{color:'var(--secondary)'}}>
      <path d={path} stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{transition:'stroke-dashoffset 420ms ease, opacity 350ms ease'}} />
    </svg>
  )
}
