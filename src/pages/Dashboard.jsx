import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const [data, setData] = useState({
    total: 0,
    amCnt: 0,
    roCnt: 0,
    ubicMap: {},
    loteMap: {},
    avgIngreso: 0,
    avgHoy: 0,
    ganancia: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buildDash()
  }, [])

  const buildDash = async () => {
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
    let amCnt = 0, roCnt = 0
    const ubicMap = {}
    const loteMap = {}
    const kgsI = [], kgsH = []

    animals.forEach(a => {
      if (a.ubicacion) ubicMap[a.ubicacion] = (ubicMap[a.ubicacion] || 0) + 1
      if (a.lote) loteMap[a.lote] = (loteMap[a.lote] || 0) + 1
      if (a.caravana2 === 'Amarillo') amCnt++
      else if (a.caravana2 === 'Rojo') roCnt++
      if (a.kg_ingreso) kgsI.push(a.kg_ingreso)
      if (a.kg_hoy) kgsH.push(a.kg_hoy)
    })

    const avgIngreso = kgsI.length ? (kgsI.reduce((s, k) => s + k, 0) / kgsI.length).toFixed(1) : '—'
    const avgHoy = kgsH.length ? (kgsH.reduce((s, k) => s + k, 0) / kgsH.length).toFixed(1) : '—'
    const ganancia = (avgIngreso !== '—' && avgHoy !== '—') ? '+' + (parseFloat(avgHoy) - parseFloat(avgIngreso)).toFixed(1) + ' kg' : '—'

    setData({ total, amCnt, roCnt, ubicMap, loteMap, avgIngreso, avgHoy, ganancia })
    setLoading(false)
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <>
      <div className="dash-hdr">
        <div className="dash-title">Rodeo al día</div>
        <div className="metrics">
          <div className="metric">
            <div className="metric-lbl">Total</div>
            <div className="metric-val">{data.total}</div>
            <div className="metric-sub">animales</div>
          </div>
          <div className="metric">
            <div className="metric-lbl">Promedio</div>
            <div className="metric-val">{data.avgIngreso}<span className="u"> kg</span></div>
            <div className="metric-sub">ingreso</div>
          </div>
          <div className="metric">
            <div className="metric-lbl">Promedio</div>
            <div className="metric-val">{data.avgHoy}<span className="u"> kg</span></div>
            <div className="metric-sub">hoy</div>
          </div>
          <div className="metric">
            <div className="metric-lbl">Ganancia</div>
            <div className="metric-val">{data.ganancia}</div>
            <div className="metric-sub">promedio</div>
          </div>
        </div>
      </div>
      <div className="dash-body">
        <div className="sec-title">Por ubicación</div>
        <div className="ubic-grid">
          {Object.entries(data.ubicMap).map(([u, c]) => (
            <div key={u} className="ubic-card">
              <div className="ubic-name">{u}</div>
              <div className="ubic-cnt">{c}</div>
              <div className="ubic-sub">animales</div>
            </div>
          ))}
        </div>
        <div className="sec-title">Por caravana</div>
        <div className="car-row">
          <div className="car-pill am">
            <div className="car-lbl am">Amarillos</div>
            <div className="car-cnt am" id="cntAm">{data.amCnt}</div>
          </div>
          <div className="car-pill ro">
            <div className="car-lbl ro">Rojos</div>
            <div className="car-cnt ro" id="cntRo">{data.roCnt}</div>
          </div>
        </div>
        <div className="sec-title">Por lote</div>
        <div className="lote-list">
          {Object.entries(data.loteMap).sort((a, b) => b[1] - a[1]).map(([l, c]) => {
            const max = Math.max(...Object.values(data.loteMap))
            const pct = (c / max) * 100
            return (
              <div key={l} className="lote-row">
                <div className="lote-num">{l}</div>
                <div className="lote-bar-w">
                  <div className="lote-bar" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="lote-cnt">{c}</div>
                <div className="lote-kg">animales</div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Dashboard