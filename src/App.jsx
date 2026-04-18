import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Animales from './pages/Animales'
import Resumen from './pages/Resumen'

function App() {
  const [currentPage, setCurrentPage] = useState('dash')

  const showPage = (page, tabElement) => {
    setCurrentPage(page)
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'))
    tabElement.classList.add('active')
  }

  return (
    <div>
      <div className="nav">
        <div className="nav-brand">Mi<span>Rodeo</span></div>
        <div className={`nav-tab ${currentPage === 'dash' ? 'active' : ''}`} onClick={(e) => showPage('dash', e.target)}>Inicio</div>
        <div className={`nav-tab ${currentPage === 'animales' ? 'active' : ''}`} onClick={(e) => showPage('animales', e.target)}>Animales</div>
        <div className={`nav-tab ${currentPage === 'resumen' ? 'active' : ''}`} onClick={(e) => showPage('resumen', e.target)}>Resumen</div>
      </div>

      <div className={`page ${currentPage === 'dash' ? 'active' : ''}`}>
        <Dashboard />
      </div>

      <div className={`page ${currentPage === 'animales' ? 'active' : ''}`}>
        <Animales />
      </div>

      <div className={`page ${currentPage === 'resumen' ? 'active' : ''}`}>
        <Resumen />
      </div>

      <div className="toast" id="toast"></div>
    </div>
  )
}

export default App
