import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiBriefcase, FiUsers, FiEye, FiTrendingUp, FiCalendar, 
  FiArrowRight, FiClock, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import companyService from '../../services/companyService';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { allJobs, getEmployerJobs, getJobApplications } = useJobs();
  const [myCompany, setMyCompany] = useState(null);
  
  // Load user's company
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const response = await companyService.getMyCompany();
        setMyCompany(response.data);
      } catch (err) {
        console.error('Failed to load company:', err);
      }
    };

    if (user) {
      loadCompany();
    }
  }, [user]);
  
  const employerJobs = getEmployerJobs(user?.id);
  
  // Calculate stats
  const totalJobs = employerJobs.length;
  const activeJobs = employerJobs.filter(j => j.status === 'active').length;
  const totalApplicants = employerJobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
  const totalViews = employerJobs.reduce((sum, job) => sum + (job.viewCount || 0), 0);

  // Get all applications for employer's jobs
  const allApplications = employerJobs.flatMap(job => ({
    jobId: job.id,
    jobTitle: job.title,
    applicantCount: job.applicantCount || 0
  }));
  
  const pendingApplications = allApplications.filter(a => a.status === 'pending');
  const shortlistedApplications = allApplications.filter(a => a.status === 'shortlisted');

  // Chart data
  const applicationsByMonth = [
    { month: 'T8', applications: 45 },
    { month: 'T9', applications: 62 },
    { month: 'T10', applications: 78 },
    { month: 'T11', applications: 95 },
    { month: 'T12', applications: 120 }
  ];

  const applicationsByStatus = [
    { name: 'Đang chờ', value: 45, color: '#F59E0B' },
    { name: 'Đã xem', value: 30, color: '#3B82F6' },
    { name: 'Shortlist', value: 20, color: '#8B5CF6' },
    { name: 'Từ chối', value: 15, color: '#EF4444' },
    { name: 'Tuyển', value: 10, color: '#10B981' }
  ];

  const topJobs = employerJobs
    .sort((a, b) => b.applicants - a.applicants)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600">Chào mừng trở lại, {myCompany?.name}</p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 w-fit">
          <FiBriefcase className="w-5 h-5" />
          Đăng tin tuyển dụng
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tin tuyển dụng</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalJobs}</p>
              <p className="text-sm text-green-600 mt-1">
                {activeJobs} đang hoạt động
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ứng viên</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalApplicants}</p>
              <p className="text-sm text-yellow-600 mt-1">
                {pendingApplications.length} chờ xử lý
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lượt xem</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">+12% tuần này</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">8.5%</p>
              <p className="text-sm text-purple-600 mt-1">+2.1% tháng này</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ứng viên theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={applicationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Phân bố trạng thái ứng viên
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={applicationsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {applicationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {applicationsByStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium text-gray-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Applications & Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Ứng viên mới
            </h3>
            <Link to="/employer/candidates" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
              Xem tất cả
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Ứng viên #{app.id.slice(-4)}</p>
                    <p className="text-sm text-gray-500">{app.job?.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Chờ xử lý
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {pendingApplications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Không có ứng viên mới
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tin tuyển dụng nổi bật
            </h3>
            <Link to="/employer/jobs" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
              Xem tất cả
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {topJobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  {job.isTop && (
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {job.applicants} ứng viên
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    {job.views} lượt xem
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    Còn {Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))} ngày
                  </span>
                </div>
              </div>
            ))}
            {topJobs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Chưa có tin tuyển dụng
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Cần tuyển dụng nhanh?</h3>
            <p className="text-primary-100">Đăng tin tuyển dụng và tiếp cận hàng nghìn ứng viên ngay hôm nay</p>
          </div>
          <div className="flex gap-3">
            <Link to="/employer/jobs/new" className="bg-white text-primary-600 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              Đăng tin mới
            </Link>
            <Link to="/employer/search-cv" className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-400 transition-colors">
              Tìm CV
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployerDashboard;
