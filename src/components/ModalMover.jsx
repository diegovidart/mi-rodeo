import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function ModalMover({ animal, onClose }) {
  const [nueva, setNueva] = useState(animal.ubicacion)
  const [obs, setObs] = useState('')

  const saveMover = async () => {
    const { error } = await supabase
      .from('animales')
      .update({ ubicacion: nueva })
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
        <div className="modal-title">Mover a otra ubicación</div>
        <div className="form-grp">
          <label className="form-lbl">Ubicación actual</label>
          <input className="form-in" value={animal.ubicacion} disabled />
        </div>
        <div className="form-grp">
          <label className="form-lbl">Nueva ubicación</label>
          <select className="form-sel" value={nueva} onChange={(e) => setNueva(e.target.value)}>
            <option value="Diego">Diego</option>
            <option value="Granja">Granja</option>
            <option value="Ruta">Ruta</option>
            <option value="Maciel">Maciel</option>
          </select>
        </div>
        <div className="form-grp">
          <label className="form-lbl">Observación (opcional)</label>
          <input className="form-in" type="text" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Motivo del movimiento" />
        </div>
        <button className="btn-primary" onClick={saveMover}>Confirmar movimiento</button>
        <button className="btn-cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}

export default ModalMover