import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaBriefcase, 
  FaUserCheck,
  FaBuilding,
  FaEnvelope,
  FaStar,
  FaExclamationCircle,
  FaCheckDouble,
  FaFilter
} from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotification();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'application':
        return <FaBriefcase className="text-blue-500" />;
      case 'interview':
        return <FaUserCheck className="text-green-500" />;
      case 'company':
        return <FaBuilding className="text-purple-500" />;
      case 'message':
        return <FaEnvelope className="text-orange-500" />;
      case 'saved':
        return <FaStar className="text-yellow-500" />;
      case 'alert':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FaBell className="text-2xl text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                <p className="text-gray-500">
                  Bạn có <span className="text-primary font-semibold">{unreadCount}</span> thông báo chưa đọc
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCheckDouble />
                <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrash />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-gray-400" />
            <span className="font-medium text-gray-700">Lọc thông báo:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'unread', label: 'Chưa đọc' },
              { value: 'read', label: 'Đã đọc' },
              { value: 'application', label: 'Ứng tuyển' },
              { value: 'interview', label: 'Phỏng vấn' },
              { value: 'message', label: 'Tin nhắn' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-lg p-5 cursor-pointer transition hover:shadow-xl ${
                    !notification.read ? 'border-l-4 border-primary' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-primary/10' : 'bg-gray-100'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-400 mt-2 block">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBell className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Không có thông báo
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'Bạn chưa có thông báo nào' 
                    : 'Không có thông báo phù hợp với bộ lọc'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Delete All Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-2xl text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Xóa tất cả thông báo?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Hành động này không thể hoàn tác. Tất cả thông báo sẽ bị xóa vĩnh viễn.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => {
                        clearAll();
                        setShowDeleteModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPage;
