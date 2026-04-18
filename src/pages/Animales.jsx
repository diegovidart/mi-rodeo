import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ModalPesaje from '../components/ModalPesaje'
import ModalMover from '../components/ModalMover'

function Animales() {
  const [animales, setAnimales] = useState([])
  const [filteredAnimales, setFilteredAnimales] = useState([])
  const [search, setSearch] = useState('')
  const [ubicacionFilter, setUbicacionFilter] = useState('')
  const [peloFilter, setPeloFilter] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [showPesajeModal, setShowPesajeModal] = useState(false)
  const [showMoverModal, setShowMoverModal] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnimales()
  }, [])

  useEffect(() => {
    filterAnimales()
  }, [animales, search, ubicacionFilter, peloFilter])

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

  const filterAnimales = () => {
    let filtered = animales

    if (search) {
      filtered = filtered.filter(animal =>
        animal.num_visible.toString().includes(search) ||
        animal.caravana2?.includes(search)
      )
    }

    if (ubicacionFilter) {
      filtered = filtered.filter(animal => animal.ubicacion === ubicacionFilter)
    }

    if (peloFilter) {
      filtered = filtered.filter(animal => animal.pelo === peloFilter)
    }

    setFilteredAnimales(filtered)
  }

  const handlePesaje = (animal) => {
    setSelectedAnimal(animal)
    setShowPesajeModal(true)
  }

  const handleMover = (animal) => {
    setSelectedAnimal(animal)
    setShowMoverModal(true)
  }

  const closeModals = () => {
    setShowPesajeModal(false)
    setShowMoverModal(false)
    setSelectedAnimal(null)
    fetchAnimales()
  }

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getStatusBadge = (animal) => {
    if (animal.kg_hoy) {
      return <span className="badge badge-primary">✓ Pesado</span>
    }
    return <span className="badge badge-red">⊘ Sin pesar</span>
  }

  return (
    <div className="container">
      <div style={{ padding: '20px 0 0 0' }}>
        <h1>Animales</h1>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por número o caravana..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={ubicacionFilter} onChange={(e) => setUbicacionFilter(e.target.value)}>
          <option value="">Todas ubicaciones</option>
          <option value="Diego">Diego</option>
          <option value="Granja">Granja</option>
          <option value="Ruta">Ruta</option>
          <option value="Maciel">Maciel</option>
        </select>
        <select value={peloFilter} onChange={(e) => setPeloFilter(e.target.value)}>
          <option value="">Todos colores</option>
          <option value="Negro">Negro</option>
          <option value="Blanco">Blanco</option>
          <option value="Gris">Gris</option>
          <option value="Rojo">Rojo</option>
        </select>
      </div>

      {/* Results Count */}
      {!loading && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          {filteredAnimales.length} animal{filteredAnimales.length !== 1 ? 'es' : ''} encontrado{filteredAnimales.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Animals List */}
      {loading ? (
        <div className="loading">Cargando animales...</div>
      ) : filteredAnimales.length === 0 ? (
        <div className="empty-state">
          <p>No hay animales que coincidan con los filtros</p>
        </div>
      ) : (
        <div>
          {filteredAnimales.map(animal => (
            <div key={animal.id} className="animal-card">
              <div
                className="animal-card-header"
                onClick={() => toggleExpanded(animal.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <span className="animal-number">#{animal.num_visible}</span>
                  <span className="animal-category">{animal.categoria}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    {getStatusBadge(animal)}
                  </div>
                </div>
                <span className={`expand-icon ${expandedId === animal.id ? 'open' : ''}`}>
                  ▼
                </span>
              </div>

              <div className={`animal-card-content ${expandedId === animal.id ? 'open' : ''}`}>
                <div className="info-row">
                  <span className="info-label">Pelo</span>
                  <span className="info-value">{animal.pelo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ubicación</span>
                  <span className="info-value">{animal.ubicacion}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Lote</span>
                  <span className="info-value">{animal.lote}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">KG Hoy</span>
                  <span className="info-value">{animal.kg_hoy || '—'}</span>
                </div>
                {animal.caravana2 && (
                  <>
                    <div className="info-row">
                      <span className="info-label">Caravana</span>
                      <span className="info-value">{animal.caravana2}</span>
                    </div>
                  </>
                )}

                <div className="animal-card-actions" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <button className="btn" onClick={() => handlePesaje(animal)}>
                    ⚖️ Pesaje
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleMover(animal)}>
                    📍 Mover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button
        className="btn"
        onClick={fetchAnimales}
        style={{ width: '100%', marginTop: '20px', marginBottom: '20px' }}
      >
        🔄 Actualizar
      </button>

      {showPesajeModal && <ModalPesaje animal={selectedAnimal} onClose={closeModals} />}
      {showMoverModal && <ModalMover animal={selectedAnimal} onClose={closeModals} />}
    </div>
  )
}

export default Animales