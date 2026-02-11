import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaCog,
  FaBell,
  FaLock,
  FaGlobe,
  FaPalette,
  FaShieldAlt,
  FaTrash,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ... (state and handlers can be reused, focusing on layout changes here)
  const [settings, setSettings] = useState({
    // Account Settings
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    messages: true,
    marketing: false,

    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    searchable: true,

    // Appearance
    theme: 'light',
    fontSize: 'medium',
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = () => {
    // ... validation logic ...
    toast.success('Đổi mật khẩu thành công!');
    // ... reset logic ...
  };

  const handleSaveNotifications = () => toast.success('Cài đặt thông báo đã được lưu!');
  const handleSavePrivacy = () => toast.success('Cài đặt quyền riêng tư đã được lưu!');
  const handleDeleteAccount = () => {
    toast.success('Yêu cầu xóa tài khoản đã được gửi.');
    setShowDeleteModal(false);
  };

  const tabs = [
    { id: 'account', label: 'Tài khoản', icon: FaUser, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'notifications', label: 'Thông báo', icon: FaBell, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'privacy', label: 'Quyền riêng tư', icon: FaShieldAlt, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'appearance', label: 'Giao diện', icon: FaPalette, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'language', label: 'Ngôn ngữ', icon: FaGlobe, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <div className="h-80 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center pb-24">
          <div className="ml-8 md:ml-0 z-10">
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors w-fit">
              <FaHome />
              <span className="text-sm font-medium">Trang chủ</span>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Cài đặt</h1>
            <p className="text-gray-400">Quản lý tùy chọn cá nhân và bảo mật</p>
          </div>
          <FaCog className="text-[12rem] text-white/5 absolute -right-10 -bottom-10 rotate-12" />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden sticky top-24">
              <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 text-center">
                <div className="w-20 h-20 rounded-full mx-auto bg-white dark:bg-gray-800 p-1 shadow-sm mb-3">
                  <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.name} alt="User" className="w-full h-full rounded-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                      ? 'bg-gray-900 dark:bg-primary-600 text-white shadow-lg shadow-gray-900/20 dark:shadow-primary-600/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : tab.bg}`}>
                      <tab.icon className={activeTab === tab.id ? 'text-white' : tab.color} />
                    </div>
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
                >
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 min-h-[500px]"
            >
              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FaLock className="text-blue-500" /> Bảo mật tài khoản
                    </h2>
                    <div className="grid gap-6">
                      <div className="form-group">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Email đăng nhập</label>
                        <input type="email" value={settings.email} disabled className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Đổi mật khẩu</h3>
                        <div className="space-y-4">
                          <input
                            type="password"
                            placeholder="Mật khẩu hiện tại"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="password"
                              placeholder="Mật khẩu mới"
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:text-white"
                            />
                            <input
                              type="password"
                              placeholder="Nhập lại mật khẩu mới"
                              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:text-white"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                              Cập nhật mật khẩu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                      <FaExclamationTriangle /> Vùng nguy hiểm
                    </h2>
                    <div className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl p-6 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-red-800 dark:text-red-300">Xóa tài khoản vĩnh viễn</h4>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">Hành động này không thể hoàn tác.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition">
                        Xóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tùy chọn thông báo</h2>
                  <div className="grid gap-4">
                    {[
                      { id: 'jobAlerts', title: 'Cảnh báo việc làm', desc: 'Nhận thông báo khi có việc làm mới phù hợp.' },
                      { id: 'applicationUpdates', title: 'Trạng thái ứng tuyển', desc: 'Thông báo khi nhà tuyển dụng xem hoặc phản hồi hồ sơ.' },
                      { id: 'marketing', title: 'Tin tức & Khuyến mãi', desc: 'Nhận thông tin cập nhật về sự kiện và ưu đãi.' }
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.title}</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                          <input type="checkbox" id={item.id} className="peer appearance-none w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full checked:bg-yellow-500 cursor-pointer transition-colors" />
                          <label htmlFor={item.id} className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-6 transition-transform cursor-pointer"></label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quyền riêng tư</h2>
                  <div className="space-y-4">
                    <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                      <h3 className="font-bold text-green-900 dark:text-green-300 mb-4">Ai có thể thấy hồ sơ của bạn?</h3>
                      <div className="space-y-3">
                        {['Công khai (Khuyến nghị)', 'Chỉ nhà tuyển dụng đã xác thực', 'Riêng tư'].map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer hover:shadow-sm transition">
                            <input type="radio" name="privacy" defaultChecked={idx === 0} className="text-green-600 focus:ring-green-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs to keep full structure valid */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Giao diện</h2>
                  <div className="space-y-4">
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-4">Chế độ hiển thị</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setMode('light')}
                          className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${theme === 'light'
                            ? 'border-purple-500 bg-white shadow-md'
                            : 'border-transparent bg-white/50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 hover:border-purple-200'
                            }`}
                        >
                          <FaSun className="text-yellow-500 text-2xl" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Sáng</span>
                          {theme === 'light' && <FaCheck className="text-purple-500" />}
                        </button>
                        <button
                          onClick={() => setMode('dark')}
                          className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${theme === 'dark'
                            ? 'border-purple-500 bg-gray-800 text-white shadow-md'
                            : 'border-transparent bg-white/50 hover:bg-gray-100 hover:border-purple-200'
                            }`}
                        >
                          <FaMoon className="text-indigo-400 text-2xl" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">Tối</span>
                          {theme === 'dark' && <FaCheck className="text-purple-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'language' && <div className="text-center py-20 text-gray-400">Cài đặt ngôn ngữ ở đây</div>}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal - Same logic, improved UI */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400 text-2xl">
              <FaTrash />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Xác nhận xóa?</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Tài khoản của bạn sẽ bị xóa vĩnh viễn sau 30 ngày. Bạn có chắc chắn muốn tiếp tục không?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">Hủy bỏ</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/30">Xóa ngay</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
