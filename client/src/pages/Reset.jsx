import React, { useState } from 'react'
import axios from 'axios'

export default function Reset({ toLogin }){
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [err, setErr] = useState(null)

  async function sendOtp(e){
    e.preventDefault()
    setErr(null)
    const f = Object.fromEntries(new FormData(e.target))
    setEmail(f.email)
    try{
      await axios.post('/auth/request-otp', { email: f.email })
      setStep(2)
    }catch(e){ setErr(e.response?.data?.error || 'Failed to send OTP') }
  }

  async function reset(e){
    e.preventDefault()
    setErr(null)
    const f = Object.fromEntries(new FormData(e.target))
    if (f.newPassword !== f.confirm) return setErr('Passwords do not match')
    try{
      await axios.post('/auth/reset-password', { email, code: f.otp, newPassword: f.newPassword })
      setStep(3)
    }catch(e){ setErr(e.response?.data?.error || 'Invalid OTP or reset failed') }
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,display:'flex',margin:0,padding:0,overflow:'hidden'}}>
      {/* Left Side - Branding */}
      <div style={{flex:1,background:'linear-gradient(135deg, #312E81 0%, #1e1b4b 50%, #0f172a 100%)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'80px 60px',position:'relative',overflow:'hidden',margin:0}}>
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 20% 50%, rgba(45,212,191,0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(251,191,36,0.1), transparent 50%)',pointerEvents:'none'}}></div>
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:460}}>
          <div style={{width:120,height:120,margin:'0 auto 40px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',borderRadius:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,fontWeight:800,color:'white',boxShadow:'0 25px 70px rgba(45,212,191,0.5)',animation:'float 3s ease-in-out infinite'}}>SF</div>
          <h1 style={{fontSize:52,fontWeight:800,color:'white',marginBottom:20,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-2px'}}>StockFlux</h1>
          <p style={{fontSize:20,color:'rgba(255,255,255,0.85)',lineHeight:1.7,marginBottom:12}}>Secure Password Recovery</p>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.65)',lineHeight:1.6}}>We'll send a one-time password to your email address. Keep your account secure with our encrypted reset process.</p>
        </div>
      </div>
      
      {/* Right Side - Reset Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'80px',background:'#FAFBFC',margin:0}}>
        <div style={{width:'100%',maxWidth:460}}>
          {step === 1 && (
            <>
              <div style={{marginBottom:48}}>
                <h2 style={{fontSize:36,fontWeight:800,color:'#1F2937',marginBottom:12,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-0.5px'}}>Reset password</h2>
                <p style={{fontSize:16,color:'#6B7280',lineHeight:1.5}}>Enter your email address and we'll send you a one-time password</p>
              </div>
              
              <form onSubmit={sendOtp} style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>Email address</label>
                  <input name="email" type="email" placeholder="you@company.com" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
                </div>
                
                <button type="submit" style={{width:'100%',padding:'14px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 14px rgba(45,212,191,0.4)',marginTop:8}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>Send OTP</button>
                
                {err && <div style={{padding:'12px',background:'#FEE2E2',color:'#DC2626',borderRadius:10,fontSize:14,textAlign:'center'}}>{err}</div>}
              </form>
              
              <div style={{marginTop:32,textAlign:'center',fontSize:14,color:'#6B7280'}}>
                Remember your password? <a onClick={toLogin} style={{color:'#2DD4BF',cursor:'pointer',fontWeight:700,textDecoration:'none'}}>Back to Sign In</a>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{marginBottom:48}}>
                <h2 style={{fontSize:36,fontWeight:800,color:'#1F2937',marginBottom:12,fontFamily:'Plus Jakarta Sans, Poppins',letterSpacing:'-0.5px'}}>Enter OTP</h2>
                <p style={{fontSize:16,color:'#6B7280',lineHeight:1.5}}>We've sent a one-time password to <strong>{email}</strong>. Check your inbox and enter it below.</p>
              </div>
              
              <form onSubmit={reset} style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>One-Time Password</label>
                  <input name="otp" placeholder="Enter 6-digit OTP" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none',letterSpacing:'4px',fontWeight:700}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
                  <div style={{fontSize:13,color:'#6B7280',marginTop:6}}>Check your email inbox or spam folder</div>
                </div>
                
                <div>
                  <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>New password</label>
                  <input name="newPassword" type="password" placeholder="••••••••" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
                </div>
                
                <div>
                  <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>Confirm new password</label>
                  <input name="confirm" type="password" placeholder="••••••••" required style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'2px solid #E5E7EB',fontSize:15,transition:'all 0.2s',background:'white',outline:'none'}} onFocus={(e)=>e.target.style.borderColor='#2DD4BF'} onBlur={(e)=>e.target.style.borderColor='#E5E7EB'} />
                </div>
                
                <button type="submit" style={{width:'100%',padding:'14px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 14px rgba(45,212,191,0.4)',marginTop:8}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>Reset Password</button>
                
                {err && <div style={{padding:'12px',background:'#FEE2E2',color:'#DC2626',borderRadius:10,fontSize:14,textAlign:'center'}}>{err}</div>}
              </form>
              
              <div style={{marginTop:32,textAlign:'center',fontSize:14,color:'#6B7280'}}>
                Didn't receive the code? <a onClick={(e)=>{e.preventDefault();setStep(1)}} style={{color:'#2DD4BF',cursor:'pointer',fontWeight:700,textDecoration:'none'}}>Resend OTP</a>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{textAlign:'center'}}>
              <div style={{width:80,height:80,margin:'0 auto 24px',background:'linear-gradient(135deg, #10B981 0%, #059669 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 30px rgba(16,185,129,0.3)'}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 style={{fontSize:32,fontWeight:800,color:'#1F2937',marginBottom:12,fontFamily:'Plus Jakarta Sans, Poppins'}}>Password reset successful!</h2>
              <p style={{fontSize:16,color:'#6B7280',marginBottom:32,lineHeight:1.5}}>Your password has been updated. You can now sign in with your new password.</p>
              <button onClick={toLogin} style={{padding:'14px 32px',background:'linear-gradient(135deg, #2DD4BF 0%, #10B981 100%)',color:'white',border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.3s',boxShadow:'0 4px 14px rgba(45,212,191,0.4)'}} onMouseEnter={(e)=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 6px 20px rgba(45,212,191,0.5)'}} onMouseLeave={(e)=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 4px 14px rgba(45,212,191,0.4)'}}>Back to Sign In</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
