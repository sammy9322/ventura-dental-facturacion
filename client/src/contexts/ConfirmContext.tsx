import React, { createContext, useState, useContext, ReactNode } from 'react';

type ConfirmOptions = { title?: string; message: string; confirmText?: string; cancelText?: string; isDanger?: boolean; };

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
    const formattedOpts = typeof opts === 'string' ? { message: opts, title: 'Confirmar Acción', isDanger: true } : opts;
    setOptions({
      title: 'Confirmar Acción',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      isDanger: true,
      ...formattedOpts
    });
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver.resolve(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="modal-overlay" onClick={handleCancel} style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{options.title}</h3>
              <button className="modal-close" onClick={handleCancel}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {options.message}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleCancel}>
                {options.cancelText}
              </button>
              <button
                className={`btn ${options.isDanger ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
