import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Extract user info from JWT token in localStorage
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Decode JWT manually (base64 decode the payload)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ name: payload.name || 'User', email: payload.email || '' })
      } catch (err) {
        console.error('Error decoding token:', err)
      }
    }
  }, [])

  async function handleChangePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('All password fields are required')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await axios.patch('/api/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      alert('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (err) {
      alert('Error changing password: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
  }

  // Get initials for avatar
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{ width: '100%', height: '100vh', overflowY: 'auto', padding: 24, background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1F2937', marginBottom: 6, fontFamily: 'Plus Jakarta Sans, Poppins' }}>Profile</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Manage your account settings and preferences</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Profile Card */}
        <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20, overflow: 'hidden' }}>
          {/* Banner */}
          <div style={{ height: 120, background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)' }}></div>
          
          {/* Avatar & Info */}
          <div style={{ padding: 32, position: 'relative', marginTop: -60 }}>
            <div style={{ display: 'flex', alignItems: 'end', gap: 24, marginBottom: 24 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: 700, color: '#FFF', border: '4px solid #FFF', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>{user.name}</h2>
                <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 12 }}>{user.email}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#DBEAFE', color: '#1E40AF', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    <span>👤</span> Active User
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#D1FAE5', color: '#065F46', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                    <span>✓</span> Verified
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20, background: '#F9FAFB', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Account Created</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>November 2024</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Last Login</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 32, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Security Settings</h3>
              <p style={{ fontSize: 13, color: '#6B7280' }}>Manage your password and security preferences</p>
            </div>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm ? (
            <div style={{ background: '#F9FAFB', padding: 24, borderRadius: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Re-enter new password"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}
                  style={{ padding: '10px 20px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleChangePassword}
                  disabled={loading}
                  style={{ padding: '10px 20px', background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🔒
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 2 }}>Password Protected</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>Your account is secured with a strong password</div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions Card */}
        <div style={{ background: '#FFF', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', marginBottom: 20 }}>Account Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={handleLogout}
              style={{ padding: '12px 20px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'}
              onMouseOut={e => e.currentTarget.style.background = '#FEF2F2'}
            >
              <span>🚪</span> Logout
            </button>

            <div style={{ marginTop: 16, padding: 16, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Delete Account</div>
                  <div style={{ fontSize: 12, color: '#78350F' }}>Contact system administrator to delete your account. This action cannot be undone.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
