import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeContext';

export const MainLayout: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`layout ${theme}`}>
      <Sidebar />
      <main className="main-content animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
