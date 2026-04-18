import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error en módulo [${this.props.moduleName || 'Desconocido'}]:`, error, errorInfo);
    // Aquí se podría integrar el servicio de notificación al admin en el futuro
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ 
          margin: '2rem', 
          textAlign: 'center', 
          padding: '3rem',
          border: '1px solid var(--danger)',
          background: 'rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ color: 'var(--danger)', fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 className="page-title" style={{ color: 'var(--text-primary)' }}>
            El módulo {this.props.moduleName ? `"${this.props.moduleName}"` : ''} no está disponible
          </h2>
          <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
            Ha ocurrido un error inesperado al cargar esta sección. El resto de la aplicación sigue funcionando.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={this.handleRetry}>
              Reintentar Cargar
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
              Volver al Inicio
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '2rem', textAlign: 'left', background: 'var(--surface-2)', padding: '1rem', borderRadius: '8px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Detalles técnicos (Desarrollo)</summary>
              <pre style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '1rem', overflowX: 'auto' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
