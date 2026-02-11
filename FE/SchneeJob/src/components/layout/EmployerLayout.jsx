import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome, FiFileText, FiBriefcase, FiUsers, FiBarChart2,
  FiSettings, FiLogOut, FiMenu, FiX, FiMessageSquare, FiBell, FiEdit
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatWidgetContext';
import companyService from '../../services/companyService';

const EmployerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [company, setCompany] = useState(null);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { openChat } = useChat();
  const navigate = useNavigate();

  // Load employer's company
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const response = await companyService.getMyCompany();
        setCompany(response.data);
      } catch (err) {
        console.error('Failed to load company:', err);
      }
    };

    if (user) {
      loadCompany();
    }
  }, [user]);

  const menuItems = [
    { to: '/employer/dashboard', icon: FiHome, label: 'Tổng quan' },
    { to: '/employer/jobs', icon: FiBriefcase, label: 'Quản lý tin tuyển dụng' },
    { to: '/employer/candidates', icon: FiUsers, label: 'Quản lý ứng viên' },
    { to: '/employer/posts', icon: FiEdit, label: 'Quản lý bài viết' },
    { to: '/employer/company', icon: FiFileText, label: 'Hồ sơ công ty' },
    { to: '/employer/statistics', icon: FiBarChart2, label: 'Thống kê' },
    { to: '/employer/settings', icon: FiSettings, label: 'Cài đặt' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                SchneeJob
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">/ Employer</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openChat()}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMessageSquare className="w-5 h-5 text-gray-600" />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FiBell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <img
                src={company?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${company?.name}`}
                alt="Company"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{company?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-sm transition-transform duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Company Info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={company?.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${company?.name}`}
                alt="Company"
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <p className="font-semibold text-gray-900">{company?.name}</p>
                <p className="text-sm text-gray-500">{company?.industry?.industryName}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Post Job Button */}
          <div className="p-4 border-t border-gray-100">
            <NavLink
              to="/employer/jobs/new"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiBriefcase className="w-5 h-5" />
              Đăng tin tuyển dụng
            </NavLink>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <FiLogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''
          }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default EmployerLayout;
