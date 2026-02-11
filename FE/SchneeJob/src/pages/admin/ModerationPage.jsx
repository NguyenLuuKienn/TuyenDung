import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertCircle, FiCheck, FiX, FiFlag, FiUser,
  FiMessageSquare, FiExternalLink, FiClock, FiShield
} from 'react-icons/fi';

const ModerationPage = () => {
  const [reports, setReports] = useState([
    {
      id: '1',
      reporter: 'Nguyen Van A',
      target: 'Công ty ABC - Tuyển dụng lừa đảo',
      type: 'Job Post',
      reason: 'Thông tin sai sự thật, yêu cầu đặt cọc tiền.',
      status: 'pending',
      date: '2 giờ trước'
    },
    {
      id: '2',
      reporter: 'Tran Thi B',
      target: 'Người dùng: Spam_Master',
      type: 'User Profile',
      reason: 'Spam tin nhắn quảng cáo trong hệ thống.',
      status: 'pending',
      date: '5 giờ trước'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-widest">Đang chờ</span>;
      case 'resolved':
        return <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-widest">Đã xử lý</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Kiểm duyệt <span className="text-primary-500">Nội dung</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Quản lý và xử lý các báo cáo vi phạm tiêu chuẩn cộng đồng</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cần xử lý</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-white">{reports.filter(r => r.status === 'pending').length}</p>
            <FiFlag className="text-yellow-500 w-8 h-8 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Đã giải quyết</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-white">42</p>
            <FiCheck className="text-green-500 w-8 h-8 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Thời gian TB</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-white">1.5h</p>
            <FiClock className="text-primary-500 w-8 h-8 opacity-20" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-800/50 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FiAlertCircle className="text-primary-500" />
            Danh sách báo cáo
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-bold transition-all">Tất cả</button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20">Chưa xử lý</button>
          </div>
        </div>

        <div className="divide-y divide-gray-800/50">
          {reports.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <FiShield className="w-16 h-16 opacity-10 mb-4" />
              <p className="text-lg font-medium">Tuyệt vời! Không có báo cáo nào cần xử lý.</p>
            </div>
          ) : (
            reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-white/5 transition-all group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary-500 uppercase tracking-widest">{report.type}</span>
                        <div className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-xs text-gray-500 font-bold">{report.date}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors flex items-center gap-2">
                        {report.target}
                        <FiExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                      </h3>
                      <p className="text-gray-400 mt-2 leading-relaxed italic border-l-2 border-primary-500/30 pl-4">
                        "{report.reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiUser className="w-4 h-4" />
                        Người báo cáo: <span className="text-gray-300 font-bold">{report.reporter}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 justify-center">
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/10">
                      <FiCheck className="w-5 h-5" />
                      Bỏ qua
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/10">
                      <FiX className="w-5 h-5" />
                      Gỡ bỏ
                    </button>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all">
                      <FiMessageSquare className="w-5 h-5" />
                      Phản hồi
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
