import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeContext';

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
