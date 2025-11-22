import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onSuccess, toSignup, toReset }){
  const [err, setErr] = useState(null)

  async function submit(e){
    e.preventDefault()
    setErr(null)
    const f = Object.fromEntries(new FormData(e.target))
    try{
      const r = await axios.post('/auth/login', f)
      onSuccess(r.data)
    }catch(e){ setErr(e.response?.data?.error || 'Login failed') }
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',margin:0,padding:0,overflow:'hidden'}}>
      {/* Left Side - Branding */}
      <div style={{flex:1,background:'linear-gradient(135deg, #312E81 0%, #1e1b4b 50%, #0f172a 100%)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'80px 60px',position:'relative',overflow:'hidden',margin:0}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 20% 50%, rgba(45,212,191,0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(251,191,36,0.1), transparent 50%)',pointerEvents:'none'}}></div>
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:460}}>
          <div style={{width:120,height:120,margin:'0 auto 40px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',borderRadius:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,fontWeight:800,color:'white',boxShadow:'0 25px 70px rgba(45,212,191,0.5)',animation:'float 3s ease-in-out infinite'}}>SF</div>
          <h1 style={{fontSize:52,fontWeight:800,color:'white',marginBottom:20,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-2px'}}>StockFlux</h1>
          <p style={{fontSize:20,color:'rgba(255,255,255,0.85)',lineHeight:1.7,marginBottom:12}}>Modern Inventory Management System</p>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.65)',lineHeight:1.6}}>Track, manage, and optimize your inventory in real-time with powerful analytics and seamless workflows.</p>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'80px',background:'#FAFBFC',margin:0}}>
        <div style={{width:'100%',maxWidth:460}}>
          <div style={{marginBottom:48}}>
            <h2 style={{fontSize:36,fontWeight:800,color:'#1F2937',marginBottom:12,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-0.5px'}}>Welcome back</h2>
            <p style={{fontSize:16,color:'#6B7280',lineHeight:1.5}}>Sign in to your account to continue managing your inventory</p>
          </div>
          
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:20}}>
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>Email</label>
              <input name="email" type="email" placeholder="you@company.com" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
            </div>
            
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>Password</label>
              <input name="password" type="password" placeholder="••••••••" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
            </div>
            
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14,color:'#6B7280'}}>
                <input type="checkbox" style={{width:16,height:16,cursor:'pointer'}} /> Remember me
              </label>
              <a onClick={toReset} style={{fontSize:14,color:'#2DD4BF',cursor:'pointer',fontWeight:600,textDecoration:'none'}}>Forgot password?</a>
            </div>
            
            <button type="submit" style={{width:'100%',padding:'14px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 14px rgba(45,212,191,0.4)',marginTop:8}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>Sign In</button>
            
            {err && <div style={{padding:'12px',background:'#FEE2E2',color:'#DC2626',borderRadius:10,fontSize:14,textAlign:'center'}}>{err}</div>}
          </form>
          
          <div style={{marginTop:32,textAlign:'center',fontSize:14,color:'#6B7280'}}>
            Don't have an account? <a onClick={toSignup} style={{color:'#2DD4BF',cursor:'pointer',fontWeight:700,textDecoration:'none'}}>Create an account</a>
          </div>
        </div>
      </div>
    </div>
  )
}
