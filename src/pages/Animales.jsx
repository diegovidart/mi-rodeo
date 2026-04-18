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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({})
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

  const handleRowClick = (animal) => {
    setSelectedAnimal(animal)
    setEditForm({ ...animal })
    setShowEditModal(true)
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
    setShowEditModal(false)
    setSelectedAnimal(null)
    setEditForm({})
    fetchAnimales()
  }

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('animales')
      .update(editForm)
      .eq('id', selectedAnimal.id)

    if (error) {
      console.error('Error updating animal:', error)
      return
    }

    closeModals()
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
          <option value="HO">HO</option>
          <option value="AB">AB</option>
          <option value="HE">HE</option>
          <option value="CR">CR</option>
          <option value="otro">otro</option>
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

      {/* Animals Table */}
      {loading ? (
        <div className="loading">Cargando animales...</div>
      ) : filteredAnimales.length === 0 ? (
        <div className="empty-state">
          <p>No hay animales que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="animales-table">
            <thead>
              <tr>
                <th>NumVisible</th>
                <th>Categoría</th>
                <th>Pelo</th>
                <th>Ubicación</th>
                <th>Lote</th>
                <th>2da Caravana</th>
                <th>Observaciones</th>
                <th>Kg Ingreso</th>
                <th>Kg Hoy</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimales.map((animal, index) => (
                <tr key={animal.id} onClick={() => handleRowClick(animal)} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{animal.num_visible}</td>
                  <td>{animal.categoria}</td>
                  <td>{animal.pelo}</td>
                  <td>{animal.ubicacion}</td>
                  <td>{animal.lote}</td>
                  <td>{animal.caravana2}</td>
                  <td>{animal.observaciones || ''}</td>
                  <td>{animal.kg_ingreso}</td>
                  <td>{animal.kg_hoy || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeModals}>×</button>
            <h2>Editar Animal</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <label>
                NumVisible
                <input
                  type="number"
                  value={editForm.num_visible || ''}
                  onChange={(e) => setEditForm({ ...editForm, num_visible: e.target.value })}
                />
              </label>
              <label>
                Categoría
                <select
                  value={editForm.categoria || ''}
                  onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                >
                  <option value="Novillo">Novillo</option>
                  <option value="Novillito">Novillito</option>
                  <option value="Vaquillona">Vaquillona</option>
                  <option value="Vaca">Vaca</option>
                  <option value="Toro">Toro</option>
                </select>
              </label>
              <label>
                Pelo
                <select
                  value={editForm.pelo || ''}
                  onChange={(e) => setEditForm({ ...editForm, pelo: e.target.value })}
                >
                  <option value="HO">HO</option>
                  <option value="AB">AB</option>
                  <option value="HE">HE</option>
                  <option value="CR">CR</option>
                  <option value="otro">otro</option>
                </select>
              </label>
              <label>
                Ubicación
                <select
                  value={editForm.ubicacion || ''}
                  onChange={(e) => setEditForm({ ...editForm, ubicacion: e.target.value })}
                >
                  <option value="Diego">Diego</option>
                  <option value="Granja">Granja</option>
                  <option value="Ruta">Ruta</option>
                  <option value="Maciel">Maciel</option>
                </select>
              </label>
              <label>
                Lote
                <input
                  type="text"
                  value={editForm.lote || ''}
                  onChange={(e) => setEditForm({ ...editForm, lote: e.target.value })}
                />
              </label>
              <label>
                2da Caravana
                <select
                  value={editForm.caravana2 || ''}
                  onChange={(e) => setEditForm({ ...editForm, caravana2: e.target.value })}
                >
                  <option value="Amarillo">Amarillo</option>
                  <option value="Rojo">Rojo</option>
                </select>
              </label>
              <label>
                Observaciones
                <textarea
                  value={editForm.observaciones || ''}
                  onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                />
              </label>
              <label>
                Kg Ingreso
                <input
                  type="number"
                  value={editForm.kg_ingreso || ''}
                  onChange={(e) => setEditForm({ ...editForm, kg_ingreso: e.target.value })}
                />
              </label>
              <label>
                Kg Hoy
                <input
                  type="number"
                  value={editForm.kg_hoy || ''}
                  onChange={(e) => setEditForm({ ...editForm, kg_hoy: e.target.value })}
                />
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="btn">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Cancelar</button>
                <button type="button" className="btn" onClick={() => { closeModals(); handlePesaje(selectedAnimal); }}>Registrar pesaje</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPesajeModal && <ModalPesaje animal={selectedAnimal} onClose={closeModals} />}
      {showMoverModal && <ModalMover animal={selectedAnimal} onClose={closeModals} />}
    </div>
  )
}

export default Animales