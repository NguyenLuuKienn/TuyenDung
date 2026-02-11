import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiMail, FiPhone, FiHome, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import companyService from '../../services/companyService';

const PendingApprovalPage = () => {
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
  }, [user]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const res = await companyService.getMyRegistration();
      setRequest(res.data);
    } catch (error) {
      console.error('Failed to load registration:', error);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: FiClock,
          color: 'yellow',
          title: 'Đang chờ xét duyệt',
          description: 'Đơn đăng ký của bạn đang được Admin xem xét. Thời gian xử lý từ 1-3 ngày làm việc.'
        };
      case 'approved':
        return {
          icon: FiCheckCircle,
          color: 'green',
          title: 'Đã được duyệt',
          description: 'Chúc mừng! Công ty của bạn đã được duyệt. Bạn có thể bắt đầu đăng tin tuyển dụng.'
        };
      case 'rejected':
        return {
          icon: FiXCircle,
          color: 'red',
          title: 'Bị từ chối',
          description: 'Rất tiếc, đơn đăng ký của bạn đã bị từ chối.'
        };
      default:
        return {
          icon: FiClock,
          color: 'gray',
          title: 'Không xác định',
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chưa có đơn đăng ký</h2>
          <p className="text-gray-600 mb-6">Bạn chưa gửi đơn đăng ký công ty nào.</p>
          <Link to="/employer/company/create" className="btn-primary">
            Đăng ký công ty
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trạng thái đăng ký</h1>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Status Header */}
          <div className={`p-6 bg-${statusInfo.color}-50 border-b border-${statusInfo.color}-100`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-${statusInfo.color}-100 rounded-full flex items-center justify-center`}>
                <StatusIcon className={`w-8 h-8 text-${statusInfo.color}-600`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold text-${statusInfo.color}-800`}>
                  {statusInfo.title}
                </h2>
                <p className={`text-${statusInfo.color}-600`}>
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công ty</h3>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={request.logo}
                alt={request.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{request.name}</h4>
                <p className="text-sm text-gray-500">MST: {request.taxCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiHome className="w-4 h-4" />
                <span>{request.industry}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail className="w-4 h-4" />
                <span>{request.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="w-4 h-4" />
                <span>{request.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiClock className="w-4 h-4" />
                <span>Gửi lúc: {new Date(request.submittedAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>

            {/* Review Note */}
            {request.reviewNote && (
              <div className={`mt-6 p-4 bg-${statusInfo.color}-50 rounded-lg`}>
                <h4 className="font-medium text-gray-900 mb-1">Ghi chú từ Admin:</h4>
                <p className="text-gray-600">{request.reviewNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
              <button
                onClick={loadRequest}
                className="btn-secondary flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Làm mới
              </button>

              {request.status === 'approved' && (
                <Link to="/employer/dashboard" className="btn-primary flex-1 text-center">
                  Vào Dashboard
                </Link>
              )}

              {request.status === 'rejected' && (
                <Link to="/employer/company/create" className="btn-primary flex-1 text-center">
                  Đăng ký lại
                </Link>
              )}

              <Link to="/" className="btn-secondary">
                Về trang chủ
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Cần hỗ trợ? Liên hệ{' '}
            <a href="mailto:support@schneejob.com" className="text-primary-600 hover:text-primary-700">
              support@schneejob.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
