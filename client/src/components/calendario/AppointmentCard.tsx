import React from 'react';
import type { Cita } from '../../services/citaService';

const MACRO_COLORS: Record<string, string> = {
  'Ortodoncia': '#4A90D9',
  'Endodoncia': '#E74C3C',
  'Limpieza': '#2ECC71',
  'Corona': '#F39C12',
  'Extracción': '#9B59B6',
  'Blanqueamiento': '#1ABC9C',
  'Implante': '#E67E22',
  'Ortopedia': '#3498DB',
  'Resina': '#27AE60',
  'Radiografía': '#8E44AD',
  'Consulta': '#2980B9',
};

const ESTADO_COLORS: Record<string, string> = {
  programada: '#3498DB',
  confirmada: '#2ECC71',
  en_progreso: '#F39C12',
  completada: '#27AE60',
  cancelada: '#E74C3C',
  no_asistio: '#95A5A6',
};

interface Props {
  cita: Cita;
  compact?: boolean;
  onClick?: (cita: Cita) => void;
  onDragStart?: (e: React.DragEvent, cita: Cita) => void;
}

export const AppointmentCard: React.FC<Props> = ({ cita, compact, onClick, onDragStart }) => {
  const bgColor = cita.es_nota_personal
    ? '#95A5A6'
    : MACRO_COLORS[cita.macro_nombre || ''] || 'var(--brand-turquoise)';

  const estadoColor = ESTADO_COLORS[cita.estado] || '#95A5A6';

  const hora = new Date(cita.fecha_inicio).toLocaleTimeString('es-CR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div
      className={`appointment-card ${compact ? 'compact' : ''} ${cita.estado === 'cancelada' || cita.estado === 'no_asistio' ? 'dimmed' : ''}`}
      style={{ borderLeftColor: bgColor, '--appointment-bg': `${bgColor}18` } as React.CSSProperties}
      onClick={() => onClick?.(cita)}
      draggable={!!onDragStart}
      onDragStart={e => onDragStart?.(e, cita)}
    >
      <div className="appointment-card-header">
        <span className="appointment-time">{hora}</span>
        <span className="appointment-status-dot" style={{ backgroundColor: estadoColor }} />
      </div>
      <div className="appointment-card-body">
        <span className="appointment-title">
          {cita.es_nota_personal ? '📝 ' : ''}{cita.titulo}
        </span>
        {!compact && cita.paciente_nombre && (
          <span className="appointment-patient">{cita.paciente_nombre}</span>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
