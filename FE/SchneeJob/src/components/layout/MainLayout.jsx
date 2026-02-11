import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-slate-200 transition-colors duration-200">
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
