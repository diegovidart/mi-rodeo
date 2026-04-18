import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function ModalMover({ animal, onClose }) {
  const [newUbicacion, setNewUbicacion] = useState('')
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!newUbicacion) {
      setError('Selecciona una ubicación')
      setLoading(false)
      return
    }

    if (newUbicacion === animal.ubicacion) {
      setError('El animal ya está en esa ubicación')
      setLoading(false)
      return
    }

    // Insert movimiento
    const { error: movError } = await supabase
      .from('movimientos')
      .insert([{
        animal_id: animal.id,
        ubicacion_anterior: animal.ubicacion,
        ubicacion_nueva: newUbicacion,
        obs,
        fecha: new Date().toISOString().split('T')[0]
      }])

    if (movError) {
      console.error(movError)
      setError('Error al registrar el movimiento')
      setLoading(false)
      return
    }

    // Update ubicacion
    const { error: updateError } = await supabase
      .from('animales')
      .update({ ubicacion: newUbicacion })
      .eq('id', animal.id)

    if (updateError) {
      console.error(updateError)
      setError('Error al mover el animal')
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>📍 Mover Animal #{animal.num_visible}</h2>

        <div style={{
          backgroundColor: 'var(--green-pale)',
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Ubicación actual:</div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>{animal.ubicacion}</div>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--red-bg)',
            border: `1px solid var(--red)`,
            color: 'var(--red)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Nueva Ubicación
            </div>
            <select
              value={newUbicacion}
              onChange={(e) => setNewUbicacion(e.target.value)}
              required
              autoFocus
            >
              <option value="">— Seleccionar ubicación —</option>
              <option value="Diego">Diego</option>
              <option value="Granja">Granja</option>
              <option value="Ruta">Ruta</option>
              <option value="Maciel">Maciel</option>
            </select>
          </label>

          <label>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Motivo del movimiento (opcional)
            </div>
            <textarea
              placeholder="Ej: Traslado para rotación..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Moviendo...' : '✓ Confirmar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ModalMover