import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import MultiRowForm from './components/MultiRowForm'
import LedgerView from './components/LedgerView'
import Sparkline from './components/Sparkline'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
