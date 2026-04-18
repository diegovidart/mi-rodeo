import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ModalPesaje({ animal, onClose }) {
  const [kg, setKg] = useState('')
  const [obs, setObs] = useState('')
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistorial()
  }, [animal])

  const fetchHistorial = async () => {
    const { data, error } = await supabase
      .from('pesajes')
      .select('*')
      .eq('animal_id', animal.id)
      .order('fecha', { ascending: false })
      .limit(10)

    if (error) {
      console.error(error)
      return
    }

    setHistorial(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!kg || parseFloat(kg) <= 0) {
      setError('Ingresa un peso válido')
      setLoading(false)
      return
    }

    const fecha = new Date().toISOString().split('T')[0]

    // Insert pesaje
    const { error: pesajeError } = await supabase
      .from('pesajes')
      .insert([{ animal_id: animal.id, fecha, kg: parseFloat(kg), obs }])

    if (pesajeError) {
      console.error(pesajeError)
      setError('Error al guardar el pesaje')
      setLoading(false)
      return
    }

    // Update kg_hoy
    const { error: updateError } = await supabase
      .from('animales')
      .update({ kg_hoy: parseFloat(kg) })
      .eq('id', animal.id)

    if (updateError) {
      console.error(updateError)
      setError('Error al actualizar el animal')
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
        <h2>⚖️ Pesaje - Animal #{animal.num_visible}</h2>

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
              Peso (kg)
            </div>
            <input
              type="number"
              step="0.1"
              placeholder="Ej: 450.5"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Observaciones (opcional)
            </div>
            <textarea
              placeholder="Agregar notas..."
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
            {loading ? '⏳ Guardando...' : '✓ Registrar Pesaje'}
          </button>
        </form>

        {/* Historial */}
        {historial.length > 0 && (
          <>
            <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Últimos Pesajes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {historial.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: idx === 0 ? 'var(--yellow-bg)' : 'var(--green-pale)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: idx === 0 ? 'var(--yellow)' : 'var(--accent-primary)',
                    fontWeight: '600'
                  }}
                >
                  <div>{p.fecha}: <strong>{p.kg} kg</strong></div>
                  {p.obs && <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{p.obs}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ModalPesaje