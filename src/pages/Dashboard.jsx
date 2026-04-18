import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [metrics, setMetrics] = useState({
    total: 0,
    byUbicacion: {},
    byLote: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    const { data: animals, error } = await supabase
      .from('animales')
      .select('ubicacion, lote, categoria')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const total = animals.length
    const byUbicacion = animals.reduce((acc, animal) => {
      acc[animal.ubicacion] = (acc[animal.ubicacion] || 0) + 1
      return acc
    }, {})

    const byLote = animals.reduce((acc, animal) => {
      acc[animal.lote] = (acc[animal.lote] || 0) + 1
      return acc
    }, {})

    setMetrics({ total, byUbicacion, byLote })
    setLoading(false)
  }

  const getTopUbicacion = () => {
    const entries = Object.entries(metrics.byUbicacion)
    if (entries.length === 0) return { name: 'N/A', count: 0 }
    return {
      name: entries.reduce((a, b) => a[1] > b[1] ? a : b)[0],
      count: Math.max(...entries.map(e => e[1]))
    }
  }

  const topUbicacion = getTopUbicacion()

  return (
    <div className="container">
      <div style={{ padding: '20px 0 0 0' }}>
        <h1>Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <>
          {/* Metrics Grid 2x2 */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{metrics.total}</div>
              <div className="metric-label">Total Animales</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{Object.keys(metrics.byUbicacion).length}</div>
              <div className="metric-label">Ubicaciones</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{topUbicacion.name}</div>
              <div className="metric-label">Ubicación Más Poblada</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{Object.keys(metrics.byLote).length}</div>
              <div className="metric-label">Lotes Registrados</div>
            </div>
          </div>

          {/* Locations Section */}
          <h2 style={{ marginTop: '24px' }}>Por Ubicación</h2>
          <div className="stats-section">
            <div className="stats-list">
              {Object.entries(metrics.byUbicacion).map(([ubicacion, count]) => (
                <div key={ubicacion} className="stat-item">
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{ubicacion}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lots Section */}
          <h2>Por Lote</h2>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Object.entries(metrics.byLote).map(([lote, count]) => (
                <div key={lote} style={{
                  padding: '12px',
                  backgroundColor: 'var(--green-pale)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {lote}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="btn"
            onClick={fetchMetrics}
            style={{ width: '100%', marginTop: '20px', marginBottom: '20px' }}
          >
            🔄 Actualizar
          </button>
        </>
      )}
    </div>
  )
}

export default Dashboard