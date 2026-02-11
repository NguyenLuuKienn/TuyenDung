import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings, FiGlobe, FiMail, FiShield, FiSave, FiAlertTriangle,
  FiBell, FiEye, FiCpu, FiLayout, FiCheck, FiRefreshCcw
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'SchneeJob',
    siteDescription: 'Nền tảng tuyển dụng hàng đầu',
    contactEmail: 'admin@schneejob.com',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'notifications@schneejob.com'
  });

  const tabs = [
    { id: 'general', label: 'Cơ bản', icon: FiGlobe },
    { id: 'system', label: 'Hệ thống', icon: FiShield },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'notifications', label: 'Thông báo', icon: FiBell },
    { id: 'advanced', label: 'Nâng cao', icon: FiCpu }
  ];

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Đã lưu các thay đổi hệ thống!');
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tên Website</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email Liên Hệ</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mô tả Website</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows="3"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </motion.div>
        );
      case 'system':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">Chế độ bảo trì</p>
                  <p className="text-gray-500 text-sm font-medium">Ngắt kết nối người dùng thông thường để bảo trì hệ thống.</p>
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`w-14 h-7 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Mở đăng ký tài khoản</p>
                  <p className="text-gray-500 text-xs font-medium">Cho phép người dùng mới đăng ký.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.allowRegistration ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowRegistration ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Kiểm duyệt công ty</p>
                  <p className="text-gray-500 text-xs font-medium">Bắt buộc Admin phê duyệt công ty mới.</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'email':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tài khoản SMTP</label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mật khẩu SMTP</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold text-sm transition-all border border-gray-600">
              <FiRefreshCcw className="w-4 h-4" />
              Gửi Email Thử Nghiệm
            </button>
          </motion.div>
        );
      default:
        return (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500">
            <FiCpu className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Chế độ này sẽ sớm được hoàn thiện</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cài đặt <span className="text-primary-500">Hệ thống</span></h1>
          <p className="text-gray-400 mt-1 font-medium">Quản lý cấu hình toàn diện cho nền tảng SchneeJob</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-primary-600/20"
        >
          {loading ? <FiRefreshCcw className="animate-spin w-5 h-5" /> : <FiSave className="w-5 h-5" />}
          <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-gray-400 hover:bg-gray-900/40 hover:text-white border border-transparent'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="ml-auto">
                  <FiCheck className="w-4 h-4" />
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-8 border border-gray-800/50 shadow-2xl min-h-[500px]">
            <div className="mb-8 pb-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-500">
                  {tabs.find(t => t.id === activeTab)?.icon({ className: "w-6 h-6" })}
                </div>
                <h2 className="text-2xl font-black text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Config v1.0</span>
            </div>

            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
