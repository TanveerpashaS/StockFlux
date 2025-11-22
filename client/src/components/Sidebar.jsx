import React from 'react'
import DashboardIcon from '../icons/DashboardIcon'
import ProductsIcon from '../icons/ProductsIcon'
import OpsIcon from '../icons/OpsIcon'
import LedgerIcon from '../icons/LedgerIcon'
import SettingsIcon from '../icons/SettingsIcon'

export default function Sidebar({ view, setView, onLogout, collapsed, onToggle }){
  const mainItems = [
    {k:'dashboard', label:'Dashboard', icon:<DashboardIcon size={18} />},
    {k:'products', label:'Products', icon:<ProductsIcon size={18} />},
  ]

  const operationsItems = [
    {k:'receipts', label:'Receipts', icon:<OpsIcon size={18} />, desc:'Incoming Stock'},
    {k:'deliveries', label:'Delivery Orders', icon:<OpsIcon size={18} />, desc:'Outgoing Stock'},
    {k:'adjustments', label:'Inventory Adjustment', icon:<OpsIcon size={18} />},
    {k:'transfers', label:'Internal Transfers', icon:<OpsIcon size={18} />},
  ]

  const otherItems = [
    {k:'history', label:'Move History', icon:<LedgerIcon size={18} />},
    {k:'settings', label:'Settings', icon:<SettingsIcon size={18} />},
  ]

  return (
    <aside className="sidebar" style={{position:'sticky',top:0,height:'100vh',padding:collapsed?'18px 10px':'20px',borderRadius:0,transition:'all 0.3s ease',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexShrink:0}}>
        {!collapsed && (
          <div className="brand" style={{flex:1}}>
            <div className="logo">SF</div>
            <div>
              <div style={{fontWeight:700,color:'white',fontSize:15}}>StockFlux</div>
              <div className="small" style={{color:'rgba(255,255,255,0.75)',fontSize:12}}>Inventory • Real-time</div>
            </div>
          </div>
        )}
        <button onClick={onToggle} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',padding:'8px',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',width:collapsed?'100%':'auto'}}>
          <span style={{fontSize:18}}>{collapsed ? '→' : '←'}</span>
        </button>
      </div>
      {collapsed && <div className="logo" style={{width:44,height:44,borderRadius:10,background:'linear-gradient(180deg,var(--secondary),#0aa38f)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,margin:'0 auto 20px',flexShrink:0}}>SF</div>}
      
      <nav style={{flex:1,overflowY:'auto',overflowX:'hidden',paddingBottom:8}}>
        {/* Main Items */}
        {mainItems.map(i => (
          <div key={i.k} className={`nav-item ${view===i.k?'active':''}`} onClick={() => setView(i.k)} style={{justifyContent:collapsed?'center':'flex-start',padding:collapsed?'12px':'12px 14px',marginBottom:4}} title={collapsed?i.label:''}>
            <div className="icon">{i.icon}</div>
            {!collapsed && <div>{i.label}</div>}
          </div>
        ))}

        {/* Operations Section */}
        {!collapsed && <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.5px',padding:'16px 14px 8px',fontWeight:700}}>Operations</div>}
        {collapsed && <div style={{height:1,background:'rgba(255,255,255,0.1)',margin:'12px 0'}}></div>}
        {operationsItems.map(i => (
          <div key={i.k} className={`nav-item ${view===i.k?'active':''}`} onClick={() => setView(i.k)} style={{justifyContent:collapsed?'center':'flex-start',padding:collapsed?'12px':'12px 14px',marginBottom:4}} title={collapsed?i.label:''}>
            <div className="icon">{i.icon}</div>
            {!collapsed && <div>{i.label}</div>}
          </div>
        ))}

        {/* Other Items */}
        {collapsed && <div style={{height:1,background:'rgba(255,255,255,0.1)',margin:'12px 0'}}></div>}
        {otherItems.map(i => (
          <div key={i.k} className={`nav-item ${view===i.k?'active':''}`} onClick={() => setView(i.k)} style={{justifyContent:collapsed?'center':'flex-start',padding:collapsed?'12px':'12px 14px',marginBottom:4}} title={collapsed?i.label:''}>
            <div className="icon">{i.icon}</div>
            {!collapsed && <div>{i.label}</div>}
          </div>
        ))}
      </nav>

      {/* Profile Menu at Bottom */}
      <div style={{paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.1)',marginTop:8,flexShrink:0}}>
        <div className={`nav-item ${view==='profile'?'active':''}`} onClick={() => setView('profile')} style={{justifyContent:collapsed?'center':'flex-start',padding:collapsed?'10px':'10px 14px',marginBottom:3,display:'flex',alignItems:'center',gap:8}} title={collapsed?'My Profile':''}>
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>My Profile</span>
            </>
          )}
        </div>
        <div className="nav-item" onClick={onLogout} style={{justifyContent:collapsed?'center':'flex-start',padding:collapsed?'10px':'10px 14px',marginBottom:0,display:'flex',alignItems:'center',gap:8}} title={collapsed?'Logout':''}>
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Logout</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
