import React from 'react'
export default function ProductsIcon({ className = '', size = 20 }){
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7.5L12 3l9 4.5v6L12 21 3 13.5v-6z" fill="currentColor" opacity="0.96"/>
      <path d="M12 3v18" stroke="rgba(255,255,255,0.08)" strokeWidth="0" />
    </svg>
  )
}
