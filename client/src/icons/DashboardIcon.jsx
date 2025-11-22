import React from 'react'
export default function DashboardIcon({ className = '', size = 20 }){
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.95" />
      <rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="13" y="10" width="8" height="11" rx="2" fill="currentColor" opacity="0.35" />
    </svg>
  )
}
