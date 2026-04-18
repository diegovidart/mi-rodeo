import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ModalPesaje from '../components/ModalPesaje'
import ModalMover from '../components/ModalMover'

function Animales() {
  const [animales, setAnimales] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [showPesajeModal, setShowPesajeModal] = useState(false)
  const [showMoverModal, setShowMoverModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnimales()
  }, [])

  useEffect(() => {
    renderList()
  }, [animales, filtro, busqueda])

  const fetchAnimales = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('animales')
      .select('*')

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setAnimales(data)
    setLoading(false)
  }

  const getFiltered = () => {
    return animales.filter(a => {
      const mf =
        filtro === 'todos' ? true :
        filtro === 'sinchip' ? a.observaciones === 'sin chip' :
        filtro === 'Amarillo' ? a.caravana2 === 'Amarillo' :
        filtro === 'Rojo' ? a.caravana2 === 'Rojo' :
        a.ubicacion === filtro
      if (!mf) return false
      if (!busqueda) return true
      return a.num_visible.toString().includes(busqueda) ||
        a.ubicacion?.toLowerCase().includes(busqueda) ||
        a.lote?.includes(busqueda) ||
        a.caravana2?.toLowerCase().includes(busqueda)
    })
  }

  const renderList = () => {
    const filtered = getFiltered()
    setFiltered(filtered)
  }

  const toggleDet = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const openPeso = (animal) => {
    setSelectedAnimal(animal)
    setShowPesajeModal(true)
  }

  const openMover = (animal) => {
    setSelectedAnimal(animal)
    setShowMoverModal(true)
  }

  const closeModals = () => {
    setShowPesajeModal(false)
    setShowMoverModal(false)
    setSelectedAnimal(null)
    fetchAnimales()
  }

  const setFilter = (btn) => {
    document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    setFiltro(btn.dataset.f)
  }

  const clearSearch = () => {
    setBusqueda('')
  }

  const exportCSV = () => {
    const csv = [
      ['NumVisible', 'NumCompleto', 'Caravana2', 'Ubicacion', 'Lote', 'KgIngreso', 'KgHoy', 'GananciaKg', 'Categoria', 'Obs'],
      ...filtered.map(a => [
        a.num_visible, a.id, a.caravana2, a.ubicacion, a.lote,
        a.kg_ingreso || '', a.kg_hoy || '',
        (a.kg_hoy && a.kg_ingreso) ? (a.kg_hoy - a.kg_ingreso).toFixed(1) : '',
        a.categoria, a.observaciones || ''
      ])
    ].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rodeo_filtrado.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="loading">Cargando animales...</div>
  }

  const toShow = filtered.slice(0, 200)

  return (
    <>
      <div className="sticky-ctrl">
        <div className="srch-wrap">
          <svg className="srch-ico" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#9A9A80" strokeWidth="1.3" />
            <path d="M9.5 9.5l2.5 2.5" stroke="#9A9A80" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className="srch-input"
            type="search"
            placeholder="Número, lote, ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.trim().toLowerCase())}
          />
          <span className="srch-clear" style={{ display: busqueda ? 'block' : 'none' }} onClick={clearSearch}>×</span>
        </div>
        <div className="fscroll">
          <button className="fbtn active" data-f="todos" onClick={(e) => setFilter(e.target)}>Todos</button>
          <button className="fbtn" data-f="Diego" onClick={(e) => setFilter(e.target)}>Diego</button>
          <button className="fbtn" data-f="Granja" onClick={(e) => setFilter(e.target)}>Granja</button>
          <button className="fbtn" data-f="Ruta" onClick={(e) => setFilter(e.target)}>Ruta</button>
          <button className="fbtn" data-f="Maciel" onClick={(e) => setFilter(e.target)}>Maciel</button>
          <button className="fbtn" data-f="Amarillo" onClick={(e) => setFilter(e.target)}>Amarillo</button>
          <button className="fbtn" data-f="Rojo" onClick={(e) => setFilter(e.target)}>Rojo</button>
          <button className="fbtn" data-f="sinchip" onClick={(e) => setFilter(e.target)}>Sin chip</button>
        </div>
      </div>
      <div className="list-bar">
        <span className="list-info">{filtered.length} animales</span>
        <button className="export-btn" onClick={exportCSV}>Exportar CSV</button>
      </div>
      <div className="a-list">
        {toShow.length === 0 ? (
          <div className="empty">Sin resultados.</div>
        ) : (
          toShow.map(a => {
            const bc = a.caravana2 === 'Amarillo' ? 'b-am' : 'b-ro'
            const init = a.num_visible.toString().slice(-4)
            const gan = a.kg_hoy && a.kg_ingreso ? '+' + (a.kg_hoy - a.kg_ingreso).toFixed(1) + ' kg' : ''
            return (
              <div key={a.id} className="a-card">
                <div className="a-main" onClick={() => toggleDet(a.id)}>
                  <div className="a-badge {bc}">{init}</div>
                  <div className="a-info">
                    <div className="a-num">{a.num_visible}</div>
                    <div className="a-meta">Lote {a.lote} · {a.caravana2}{a.observaciones ? ' · ' + a.observaciones : ''}</div>
                  </div>
                  <div className="a-right">
                    {a.kg_hoy ? <div className="a-kg">{a.kg_hoy}<span className="a-kg-u"> kg</span></div> : ''}
                    <div className="a-ubic">{a.ubicacion}</div>
                  </div>
                </div>
                <div className={`a-det ${expandedId === a.id ? 'open' : ''}`}>
                  {gan ? <div className="gain-row"><span className="gain-lbl">Ganancia estimada</span><span className="gain-val">{gan}</span></div> : ''}
                  <div className="dg">
                    <div><div className="di-lbl">N° completo</div><div className="di-val" style={{ fontSize: '11px' }}>{a.id}</div></div>
                    <div><div className="di-lbl">Caravana 2</div><div className="di-val">{a.caravana2 || '—'}</div></div>
                    <div><div className="di-lbl">Ubicación</div><div className="di-val">{a.ubicacion || '—'}</div></div>
                    <div><div className="di-lbl">Lote compra</div><div className="di-val">{a.lote || '—'}</div></div>
                    <div><div className="di-lbl">Kg ingreso</div><div className="di-val">{a.kg_ingreso ? a.kg_ingreso + ' kg' : '—'}</div></div>
                    <div><div className="di-lbl">Kg hoy</div><div className="di-val">{a.kg_hoy ? a.kg_hoy + ' kg' : '—'}</div></div>
                  </div>
                  {a.observaciones ? <div className="obs-row">Obs: {a.observaciones}</div> : ''}
                  <div className="det-actions">
                    <button className="det-btn primary" onClick={() => openPeso(a)}>+ Pesaje</button>
                    <button className="det-btn" onClick={() => openMover(a)}>Mover</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
        {filtered.length > 200 && <div style={{ textAlign: 'center', padding: '14px', fontSize: '12px', color: 'var(--text3)' }}>Mostrando 200 de {filtered.length}. Usá el buscador para filtrar.</div>}
      </div>

      {showPesajeModal && <ModalPesaje animal={selectedAnimal} onClose={closeModals} />}
      {showMoverModal && <ModalMover animal={selectedAnimal} onClose={closeModals} />}
    </>
  )
}

export default Animales