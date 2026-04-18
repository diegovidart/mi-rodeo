import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function ModalPesaje({ animal, onClose }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [kg, setKg] = useState('')
  const [obs, setObs] = useState('')

  const savePeso = async () => {
    const kgNum = parseFloat(kg)
    if (!kgNum || kgNum <= 0) {
      alert('Ingresá un peso válido.')
      return
    }
    const { error } = await supabase
      .from('animales')
      .update({ kg_hoy: kgNum })
      .eq('id', animal.id)
    if (error) {
      console.error(error)
      return
    }
    onClose()
  }

  return (
    <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-handle"></div>
        <div className="modal-title">Registrar pesaje</div>
        <div className="form-grp">
          <label className="form-lbl">Fecha</label>
          <input className="form-in" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="form-grp">
          <label className="form-lbl">Peso (kg)</label>
          <input className="form-in" type="number" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="Ej: 420" min="0" step="0.1" />
        </div>
        <div className="form-grp">
          <label className="form-lbl">Observación (opcional)</label>
          <input className="form-in" type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ej: pesaje mensual" />
        </div>
        <button className="btn-primary" onClick={savePeso}>Guardar pesaje</button>
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

export default ModalPesaje