import React from 'react'
export default function SettingsIcon({ className = '', size = 20 }){
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 012.28 16.88l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.7 0 1.28-.42 1.51-1a1.65 1.65 0 00-.33-1.82L4.3 3.22A2 2 0 017.12.39l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V1a2 2 0 014 0v.09c.2.9.77 1.51 1.51 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06A2 2 0 0119.7 3.22l-.06.06a1.65 1.65 0 00-.33 1.82v.09c.23.61.81 1 1.51 1H21a2 2 0 010 4h-.09c-.9 0-1.28.42-1.51 1z" stroke="currentColor" strokeWidth="0" fill="none" />
    </svg>
  )
}
