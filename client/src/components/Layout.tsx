import React from 'react';

interface Props { children: React.ReactNode }

/**
 * @deprecated El Layout ahora es manejado automáticamente por MainLayout en App.tsx.
 * Este componente solo retorna sus hijos para evitar duplicidad de Sidebar.
 */
export default function Layout({ children }: Props) {
  return <>{children}</>;
}
