import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiBriefcase, FiFileText, FiBarChart2,
  FiSettings, FiLogOut, FiMenu, FiX, FiShield, FiAlertTriangle,
  FiBell, FiMessageSquare, FiClipboard, FiBookOpen, FiTrendingUp
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/admin', icon: FiHome, label: 'Tổng quan', end: true },
    { to: '/admin/users', icon: FiUsers, label: 'Quản lý người dùng' },
    { to: '/admin/jobs', icon: FiBriefcase, label: 'Quản lý việc làm' },
    { to: '/admin/companies', icon: FiFileText, label: 'Quản lý công ty' },
    { to: '/admin/company-requests', icon: FiClipboard, label: 'Đơn đăng ký công ty' },
    { to: '/admin/moderation', icon: FiAlertTriangle, label: 'Kiểm duyệt' },
    {
      label: 'Cài đặt dữ liệu',
      submenu: [
        { to: '/admin/skills', icon: FiTrendingUp, label: 'Quản lý Kỹ Năng' },
        { to: '/admin/industries', icon: FiBookOpen, label: 'Quản lý Ngành Nghề' },
        { to: '/admin/education-levels', icon: FiBookOpen, label: 'Quản lý Học Vấn' },
      ]
    },
    { to: '/admin/statistics', icon: FiBarChart2, label: 'Thống kê & Báo cáo' },
    { to: '/admin/roles', icon: FiShield, label: 'Phân quyền' },
    { to: '/admin/settings', icon: FiSettings, label: 'Cài đặt hệ thống' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200 selection:bg-primary-500/30">
      {/* Top Bar */}
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 text-white fixed top-0 left-0 right-0 z-40 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
            >
              {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold hidden sm:block">
                SchneeJob
              </span>
              <span className="text-sm text-gray-400 hidden sm:block">/ Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <FiMessageSquare className="w-5 h-5" />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <FiShield className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-gray-900 text-gray-300 transition-transform duration-300 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Admin Badge */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
              <FiShield className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-white">Administrator</p>
                <p className="text-xs text-gray-500">Full Access</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.to || item.label}>
                  {item.submenu ? (
                    // Group with submenu
                    <div>
                      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <ul className="space-y-1 pl-2">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.to}>
                            <NavLink
                              to={subitem.to}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                  ? 'bg-primary-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`
                              }
                            >
                              <subitem.icon className="w-5 h-5" />
                              {subitem.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    // Regular menu item
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-xs text-gray-500">Jobs</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">2.4k</p>
                <p className="text-xs text-gray-500">Users</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors w-full"
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

export default AdminLayout;
