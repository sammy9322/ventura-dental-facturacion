import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { Paciente } from '../types';

interface Props {
  onSelect: (paciente: Paciente) => void;
  selectedPaciente?: Paciente | null;
}

export default function PacienteSearch({ onSelect, selectedPaciente }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paciente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPaciente) {
      setQuery(selectedPaciente.nombre);
    }
  }, [selectedPaciente]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchPacientes = async (searchQuery: string) => {
    if (searchQuery.length < 1) { setResults([]); return; }
    try {
      const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setResults(data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error buscando pacientes:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPacientes(value), 300);
  };

  const handleSelect = (paciente: Paciente) => {
    setQuery(paciente.nombre);
    setIsOpen(false);
    setResults([]);
    onSelect(paciente);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); handleSelect(results[selectedIndex]); }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelect(null as unknown as Paciente);
    inputRef.current?.focus();
  };

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      <label className="form-label">Buscar Paciente</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.875rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
        />
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.5rem', paddingRight: query ? '2.5rem' : '1rem' }}
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && results.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((paciente, index) => (
            <div
              key={paciente.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(paciente)}
            >
              <div className="search-result-name">{paciente.nombre}</div>
              <div className="search-result-detail">
                DNI: {paciente.dni || 'N/A'} | Tel: {paciente.telefono || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 1 && (
        <div className="search-results">
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
            No se encontraron pacientes
          </div>
        </div>
      )}
    </div>
  );
}
