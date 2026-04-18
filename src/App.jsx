import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Animales from './pages/Animales'
import Resumen from './pages/Resumen'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')

  const renderTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />
      case 'animales':
        return <Animales />
      case 'resumen':
        return <Resumen />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="App">
      <div className="main-content">
        {renderTab()}
      </div>
      <div className="tab-bar">
        <button
          className={currentTab === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentTab('dashboard')}
          title="Dashboard"
        >
          <span style={{ fontSize: '24px' }}>📊</span>
          <span>Dashboard</span>
        </button>
        <button
          className={currentTab === 'animales' ? 'active' : ''}
          onClick={() => setCurrentTab('animales')}
          title="Animales"
        >
          <span style={{ fontSize: '24px' }}>🐄</span>
          <span>Animales</span>
        </button>
        <button
          className={currentTab === 'resumen' ? 'active' : ''}
          onClick={() => setCurrentTab('resumen')}
          title="Resumen"
        >
          <span style={{ fontSize: '24px' }}>📈</span>
          <span>Resumen</span>
        </button>
      </div>
    </div>
  )
}

export default App
