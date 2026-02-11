import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiX, FiSearch, FiBell, FiMessageSquare, FiUser,
  FiChevronDown, FiLogOut, FiSettings, FiBriefcase, FiHeart,
  FiGlobe, FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatWidgetContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isJobSeeker, isEmployer, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { getTotalUnreadCount } = useChat();
  const { t, language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/jobs', label: t('jobs') },
    { to: '/companies', label: t('companies') },
    { to: '/about', label: t('about') }
  ];

  const getProfileMenuItems = () => {
    if (isJobSeeker) {
      return [
        { to: '/profile', label: t('myProfile'), icon: FiUser },
        { to: '/applications', label: t('myApplications'), icon: FiBriefcase },
        { to: '/saved-jobs', label: t('savedJobs'), icon: FiHeart },
        { to: '/settings', label: t('settings'), icon: FiSettings }
      ];
    }
    if (isEmployer) {
      return [
        { to: '/employer/dashboard', label: t('dashboard'), icon: FiBriefcase },
        { to: '/employer/company', label: t('companyProfile'), icon: FiUser },
        { to: '/employer/jobs', label: t('manageJobs'), icon: FiBriefcase },
        { to: '/settings', label: t('settings'), icon: FiSettings }
      ];
    }
    if (isAdmin) {
      return [
        { to: '/admin', label: t('dashboard'), icon: FiBriefcase },
        { to: '/admin/users', label: t('users'), icon: FiUser },
        { to: '/settings', label: t('settings'), icon: FiSettings }
      ];
    }
    return [];
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              SchneeJob
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`${t('search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${location.pathname === link.to
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => changeLanguage(language === 'vi' ? 'en' : 'vi')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1 text-gray-600 dark:text-gray-300"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              <FiGlobe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiMessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {getTotalUnreadCount() > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {getTotalUnreadCount()}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              Không có thông báo
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notif) => (
                              <Link
                                key={notif.id}
                                to={notif.link}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  setIsNotificationOpen(false);
                                }}
                                className={`block p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary-50' : ''
                                  }`}
                              >
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {notif.title}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                  {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                              </Link>
                            ))
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setIsNotificationOpen(false)}
                          className="block p-3 text-center text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                        >
                          Xem tất cả
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <FiChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {user?.fullName || user?.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          {getProfileMenuItems().map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <item.icon className="w-5 h-5" />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <FiLogOut className="w-5 h-5" />
                            {t('logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-600" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`${t('search')} việc làm...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100"
          >
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === link.to
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
