import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import type { HorarioClinica } from '../../services/citaService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (horarios: HorarioClinica[]) => void;
  horarios: HorarioClinica[];
}

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const HorarioConfigModal: React.FC<Props> = ({ isOpen, onClose, onSave, horarios }) => {
  const [form, setForm] = useState<HorarioClinica[]>([]);

  useEffect(() => {
    if (horarios.length > 0) {
      setForm([...horarios]);
    } else {
      // Default
      setForm(Array.from({ length: 7 }, (_, i) => ({
        id: 0,
        dia_semana: i,
        hora_apertura: '08:00',
        hora_cierre: '18:00',
        es_laborable: i >= 1 && i <= 5,
      })));
    }
  }, [horarios, isOpen]);

  const updateDay = (diaSemana: number, field: string, value: any) => {
    setForm(prev => prev.map(h =>
      h.dia_semana === diaSemana ? { ...h, [field]: value } : h
    ));
  };

  // Ordenar: Lunes(1) a Domingo(0)
  const sorted = [...form].sort((a, b) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.indexOf(a.dia_semana) - order.indexOf(b.dia_semana);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Horarios de la Clínica"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Guardar</button>
        </>
      }
    >
      <div className="horario-config-grid">
        {sorted.map(h => (
          <div key={h.dia_semana} className={`horario-config-row ${!h.es_laborable ? 'disabled' : ''}`}>
            <label className="horario-day-label">
              <input
                type="checkbox"
                checked={h.es_laborable}
                onChange={e => updateDay(h.dia_semana, 'es_laborable', e.target.checked)}
              />
              {DIAS_ES[h.dia_semana]}
            </label>
            <input
              type="time"
              className="form-input form-input-sm"
              value={h.hora_apertura}
              onChange={e => updateDay(h.dia_semana, 'hora_apertura', e.target.value)}
              disabled={!h.es_laborable}
            />
            <span className="horario-separator">a</span>
            <input
              type="time"
              className="form-input form-input-sm"
              value={h.hora_cierre}
              onChange={e => updateDay(h.dia_semana, 'hora_cierre', e.target.value)}
              disabled={!h.es_laborable}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default HorarioConfigModal;
