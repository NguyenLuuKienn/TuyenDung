import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiBriefcase, FiMapPin, FiClock, FiDollarSign,
  FiCalendar, FiEye, FiX, FiCheck, FiFilter, FiHome, FiTrendingUp, FiMoreHorizontal
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';

const ApplicationsPage = () => {
  const { user } = useAuth();
  const { getUserApplications } = useJobs();
  const userApplications = getUserApplications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // ... (filtering logic remains the same, omitted for brevity of this thought process, 
  // but I will include it in the actual file write to ensure functionality works)
  const filteredApplications = useMemo(() => {
    let apps = userApplications.filter(app => app.job);

    if (searchTerm) {
      apps = apps.filter(app =>
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      apps = apps.filter(app => app.status === statusFilter);
    }

    switch (sortBy) {
      case 'newest':
        apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        break;
      case 'oldest':
        apps.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
        break;
      default:
        break;
    }
    return apps;
  }, [userApplications, searchTerm, statusFilter, sortBy]);

  const formatSalary = (salary) => {
    if (!salary) return 'Thương lượng';
    if (typeof salary === 'string') return salary;
    if (salary.negotiable) return 'Thương lượng';
    const format = (num) => new Intl.NumberFormat('vi-VN').format(num);
    if (salary.min && salary.max) {
      return `${format(salary.min)} - ${format(salary.max)} ${salary.currency || 'VND'}`;
    }
    if (salary.min) return `Từ ${format(salary.min)} ${salary.currency || 'VND'}`;
    if (salary.max) return `Đến ${format(salary.max)} ${salary.currency || 'VND'}`;
    return 'Thương lượng';
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Đang chờ' },
      viewed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Đã xem' },
      shortlisted: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Vào vòng trong' },
      interviewed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Đã phỏng vấn' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Từ chối' },
      hired: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Được tuyển' }
    };
    const statusInfo = statuses[status] || statuses.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
        {statusInfo.label}
      </span>
    );
  };

  const stats = {
    total: userApplications.length,
    pending: userApplications.filter(a => a.status === 'pending').length,
    viewed: userApplications.filter(a => ['viewed', 'shortlisted', 'interviewed'].includes(a.status)).length,
    rejected: userApplications.filter(a => a.status === 'rejected').length,
    hired: userApplications.filter(a => a.status === 'hired').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      {/* Header Background */}
      <div className="h-72 bg-gradient-to-r from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center pb-20">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors w-fit ml-8 md:ml-0">
            <FiHome />
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Quản lý ứng tuyển</h1>
          <p className="text-blue-100 text-lg">Theo dõi hành trình tìm việc của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-20">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-blue-500">
            <span className="text-4xl font-bold text-blue-600 mb-2">{stats.total}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Đã ứng tuyển</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-yellow-400">
            <span className="text-4xl font-bold text-yellow-500 mb-2">{stats.pending}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Đang chờ</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-green-500">
            <span className="text-4xl font-bold text-green-600 mb-2">{stats.viewed}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Được quan tâm</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border-b-4 border-gray-300">
            <span className="text-4xl font-bold text-gray-400 mb-2">{stats.rejected}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Từ chối</span>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiFilter /> Bộ lọc
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Tìm kiếm</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tên công việc..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Đang chờ</option>
                    <option value="viewed">Đã xem</option>
                    <option value="shortlisted">Vào vòng trong</option>
                    <option value="interviewed">Phỏng vấn</option>
                    <option value="rejected">Từ chối</option>
                    <option value="hired">Được tuyển</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Sắp xếp</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="lg:w-3/4 space-y-4">
            <AnimatePresence>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700 relative group"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-white flex items-center justify-center border border-gray-100 dark:border-gray-700 p-2 flex-shrink-0">
                        {app.company?.logo ? (
                          <img src={app.company.logo} alt={app.company.name} className="w-full h-full object-contain" />
                        ) : (
                          <FiHome className="text-gray-300 text-2xl" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link to={`/jobs/${app.job?.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">
                              {app.job?.title || 'Công việc không còn tồn tại'}
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">{app.job?.company?.name}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><FiMapPin /> {app.job?.location}</span>
                          <span className="flex items-center gap-1"><FiDollarSign /> {formatSalary(app.job?.salary)}</span>
                          <span className="flex items-center gap-1"><FiClock /> {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Status Timeline Bar */}
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${app.status === 'rejected' ? 'bg-red-500 w-full' :
                              app.status === 'hired' ? 'bg-green-500 w-full' :
                                app.status === 'interviewed' ? 'bg-indigo-500 w-3/4' :
                                  app.status === 'shortlisted' ? 'bg-purple-500 w-1/2' :
                                    app.status === 'viewed' ? 'bg-blue-500 w-1/4' :
                                      'bg-yellow-500 w-1/12'
                              }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Đã nộp</span>
                          <span>Đã xem</span>
                          <span>Phỏng vấn</span>
                          <span>Kết quả</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/jobs/${app.job?.id}`} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                        <FiMoreHorizontal size={20} />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center"
                >
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiBriefcase className="text-4xl text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa tìm thấy đơn ứng tuyển nào</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Bạn chưa ứng tuyển công việc nào hoặc không có kết quả phù hợp với bộ lọc.</p>
                  <Link to="/jobs" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                    Tìm việc ngay
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
