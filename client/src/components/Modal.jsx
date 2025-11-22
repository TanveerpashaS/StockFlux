import React from 'react'

export default function Modal({ open, title, onClose, children }){
  if (!open) return null
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(15,23,42,0.28), rgba(15,23,42,0.38))'}} onClick={onClose}></div>
      <div style={{width:'min(920px,96%)',background:'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',borderRadius:18,padding:20,boxShadow:'var(--shadow-lg)',zIndex:70,backdropFilter:'blur(6px)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
