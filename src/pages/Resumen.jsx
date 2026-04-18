import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Resumen() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    const { data: animals, error } = await supabase
      .from('animales')
      .select('*')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const total = animals.length
    const avgKg = total > 0 ? animals.reduce((sum, a) => sum + (a.kg_hoy || 0), 0) / total : 0
    const byCategoria = animals.reduce((acc, a) => {
      acc[a.categoria] = (acc[a.categoria] || 0) + 1
      return acc
    }, {})

    const conPeso = animals.filter(a => a.kg_hoy).length
    const sinPeso = total - conPeso

    setStats({ total, avgKg, byCategoria, conPeso, sinPeso })
    setLoading(false)
  }

  const exportCSV = () => {
    const headers = ['ID', 'Num Visible', 'Categoria', 'Pelo', 'Ubicacion', 'Lote', 'KG Hoy']
    supabase.from('animales').select('*').then(({ data }) => {
      const rows = [headers.join(',')]
      if (data) {
        data.forEach(animal => {
          rows.push([
            animal.id,
            animal.num_visible,
            animal.categoria,
            animal.pelo,
            animal.ubicacion,
            animal.lote,
            animal.kg_hoy || ''
          ].join(','))
        })
      }
      const csv = rows.join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animales_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="container">
      <div style={{ padding: '20px 0 0 0' }}>
        <h1>Resumen</h1>
      </div>

      {loading ? (
        <div className="loading">Cargando estadísticas...</div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{stats.total}</div>
              <div className="metric-label">Total Animales</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{stats.avgKg?.toFixed(1)}</div>
              <div className="metric-label">Promedio KG</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{stats.conPeso}</div>
              <div className="metric-label">Pesados</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">{stats.sinPeso}</div>
              <div className="metric-label">Sin Pesar</div>
            </div>
          </div>

          {/* Categories Section */}
          <h2 style={{ marginTop: '24px' }}>Por Categoría</h2>
          <div className="card">
            <div className="stats-list">
              {Object.entries(stats.byCategoria || {}).map(([cat, count]) => (
                <div key={cat} className="stat-item">
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{cat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Details */}
          <h2 style={{ marginTop: '24px' }}>Detalles</h2>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                  Porcentaje Pesado
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                  {stats.total > 0 ? ((stats.conPeso / stats.total) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `conic-gradient(var(--accent-primary) 0deg ${(stats.conPeso / stats.total) * 360 || 0}deg, var(--border-color) ${(stats.conPeso / stats.total) * 360 || 0}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📊
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            className="btn"
            onClick={exportCSV}
            style={{ width: '100%', marginTop: '20px' }}
          >
            📥 Descargar CSV
          </button>

          {/* Refresh Button */}
          <button
            className="btn btn-secondary"
            onClick={fetchStats}
            style={{ width: '100%', marginTop: '8px', marginBottom: '20px' }}
          >
            🔄 Actualizar
          </button>
        </>
      )}
    </div>
  )
}

export default Resumen