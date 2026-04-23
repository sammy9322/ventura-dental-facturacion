import React from 'react';
import Sidebar from './07_Sidebar'; // Usando el Sidebar que cree en la raiz (temporalmente)
import { useTheme } from '../06_ThemeContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`app-layout ${theme}`}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
