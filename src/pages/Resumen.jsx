import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Resumen() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buildResumen()
  }, [])

  const buildResumen = async () => {
    setLoading(true)
    const { data: animals, error } = await supabase
      .from('animales')
      .select('*')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const ubicMap = {}
    let amCnt = 0, roCnt = 0, socCnt = 0, kgsI = [], kgsH = []
    animals.forEach(a => {
      if (a.ubicacion) ubicMap[a.ubicacion] = (ubicMap[a.ubicacion] || 0) + 1
      if (a.caravana2 === 'Amarillo') amCnt++
      else if (a.caravana2 === 'Rojo') roCnt++
      if (a.enCampo === 'De Sociedad') socCnt++
      if (a.kg_ingreso) kgsI.push(a.kg_ingreso)
      if (a.kg_hoy) kgsH.push(a.kg_hoy)
    })
    const pI = kgsI.length ? (kgsI.reduce((s, k) => s + k, 0) / kgsI.length).toFixed(1) : '—'
    const pH = kgsH.length ? (kgsH.reduce((s, k) => s + k, 0) / kgsH.length).toFixed(1) : '—'
    const gan = (pI !== '—' && pH !== '—') ? '+' + (parseFloat(pH) - parseFloat(pI)).toFixed(1) + ' kg' : '—'

    setData({
      rTotal: animals.length,
      rAm: amCnt,
      rRo: roCnt,
      rSoc: socCnt,
      rIngreso: pI + ' kg',
      rHoy: pH + ' kg',
      rGan: gan,
      rUbic: Object.entries(ubicMap).sort((a, b) => b[1] - a[1]).map(([u, c]) => ({ u, c }))
    })
    setLoading(false)
  }

  const exportAll = () => {
    const csv = [
      ['NumVisible', 'NumCompleto', 'Caravana2', 'Ubicacion', 'Lote', 'KgIngreso', 'KgHoy', 'GananciaKg', 'Categoria', 'Obs'],
      ...data.animals?.map(a => [
        a.num_visible, a.id, a.caravana2, a.ubicacion, a.lote,
        a.kg_ingreso || '', a.kg_hoy || '',
        (a.kg_hoy && a.kg_ingreso) ? (a.kg_hoy - a.kg_ingreso).toFixed(1) : '',
        a.categoria, a.observaciones || ''
      ]) || []
    ].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rodeo_completo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportFiltered = () => {
    // Similar to exportAll, but filtered
    exportAll()
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="res-body">
      <div className="res-card">
        <div className="res-card-title">Stock actual</div>
        <div className="res-row"><span className="res-key">Total animales</span><span className="res-val">{data.rTotal}</span></div>
        <div className="res-row"><span className="res-key">Caravanas Amarillas</span><span className="res-val am">{data.rAm}</span></div>
        <div className="res-row"><span className="res-key">Caravanas Rojas</span><span className="res-val ro">{data.rRo}</span></div>
        <div className="res-row"><span className="res-key">De Sociedad</span><span className="res-val">{data.rSoc}</span></div>
      </div>
      <div className="res-card">
        <div className="res-card-title">Pesos</div>
        <div className="res-row"><span className="res-key">Prom. kg ingreso</span><span className="res-val">{data.rIngreso}</span></div>
        <div className="res-row"><span className="res-key">Prom. kg estimado hoy</span><span className="res-val">{data.rHoy}</span></div>
        <div className="res-row"><span className="res-key">Ganancia promedio</span><span className="res-val green">{data.rGan}</span></div>
      </div>
      <div className="res-card">
        <div className="res-card-title">Por ubicación</div>
        <div id="rUbic">
          {data.rUbic?.map(({ u, c }) => (
            <div key={u} className="res-row"><span className="res-key">{u}</span><span className="res-val">{c}</span></div>
          ))}
        </div>
      </div>
      <div className="res-card">
        <div className="res-card-title">Histórico vendidos</div>
        <div className="res-row"><span className="res-key">Total vendidos</span><span className="res-val">5.081</span></div>
        <div className="res-row"><span className="res-key">USD prom. por animal</span><span className="res-val green">$1.038,96</span></div>
        <div className="res-row"><span className="res-key">Días prom. pastoreo</span><span className="res-val">280 días</span></div>
        <div className="res-row"><span className="res-key">Kg/día promedio</span><span className="res-val">0.928 kg</span></div>
      </div>
      <div className="res-card">
        <div className="res-card-title">Exportar</div>
        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '10px' }}>Descargá el listado completo o el filtro activo en CSV.</div>
        <div className="export-row">
          <button className="exp-btn green" onClick={exportAll}>Todo el rodeo</button>
          <button className="exp-btn" onClick={exportFiltered}>Filtro actual</button>
        </div>
      </div>
    </div>
  )
}

export default Resumen