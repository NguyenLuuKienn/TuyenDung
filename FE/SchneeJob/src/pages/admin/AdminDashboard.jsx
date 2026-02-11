import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiBriefcase, FiHome, FiTrendingUp, FiEye,
  FiUserCheck, FiUserPlus, FiAlertCircle, FiArrowUp, FiArrowDown,
  FiActivity, FiTarget, FiStar, FiShoppingBag
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardService.getAdminStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        toast.error('Không thể tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 animate-pulse font-medium">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  // Fallback for missing stats
  const safeStats = stats || {
    totalUsers: 0,
    totalCompanies: 0,
    totalOpenJobs: 0,
    totalApplications: 0,
    topIndustries: [],
    topSkills: []
  };

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: safeStats.totalUsers,
      change: '+12.5%',
      isPositive: true,
      icon: FiUsers,
      color: 'blue',
      gradient: 'from-blue-600/20 to-blue-500/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Tin tuyển dụng',
      value: safeStats.totalOpenJobs,
      change: '+8.2%',
      isPositive: true,
      icon: FiBriefcase,
      color: 'green',
      gradient: 'from-emerald-600/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Công ty đối tác',
      value: safeStats.totalCompanies,
      change: '+5.1%',
      isPositive: true,
      icon: FiHome,
      color: 'purple',
      gradient: 'from-purple-600/20 to-purple-500/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Hồ sơ ứng tuyển',
      value: safeStats.totalApplications,
      change: '+15.3%',
      isPositive: true,
      icon: FiUserCheck,
      color: 'orange',
      gradient: 'from-orange-600/20 to-orange-500/5',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ];

  // Helper for Chart Formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-white font-bold text-lg">
            {payload[0].value.toLocaleString()}
            <span className="text-xs font-normal text-gray-400 ml-1">đơn vị</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header section with glass effect */}
      <div className="relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Tổng quan <span className="text-primary-500 italic">Hệ thống</span>
            </h1>
            <p className="text-gray-400 mt-1 font-medium flex items-center gap-2">
              <FiActivity className="text-primary-500" />
              Chào mừng trở lại quản trị viên. Đây là những gì đang diễn ra hôm nay.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-xl transition-all font-medium text-sm flex items-center gap-2">
              <FiTrendingUp /> Xuất báo cáo
            </button>
            <div className="h-10 w-[1px] bg-gray-800 mx-1 hidden md:block"></div>
            <p className="text-sm text-gray-500 hidden md:block">Cập nhật cuối: <span className="text-gray-300">Vừa xong</span></p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-6 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300`}
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>

            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 bg-gray-900/50 rounded-xl flex items-center justify-center shadow-inner`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${stat.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.isPositive ? <FiArrowUp className="mr-0.5" /> : <FiArrowDown className="mr-0.5" />}
                {stat.change}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white mb-1 tracking-tight">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.title}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                <span>Mục tiêu tháng</span>
                <span className="text-gray-400">80%</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${stat.iconColor.replace('text-', 'bg-')} opacity-60 rounded-full`} style={{ width: '80%' }}></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> Ngành nghề hot nhất
              </h3>
              <p className="text-sm text-gray-500 mt-1">Dựa trên số lượng tin tuyển dụng đang mở</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeStats.topIndustries} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="industryName"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                  dataKey="jobCount"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                  barSize={32}
                >
                  {safeStats.topIndustries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                  ))}
                </Bar>
                <defs>
                  {safeStats.topIndustries.map((_, index) => (
                    <linearGradient key={`grad-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiStar className="text-yellow-500" /> Kỹ năng nhu cầu cao
              </h3>
              <p className="text-sm text-gray-500 mt-1">Các kỹ năng được nhà tuyển dụng tìm kiếm nhiều nhất</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeStats.topSkills}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="jobCount"
                  nameKey="skillName"
                >
                  {safeStats.topSkills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {safeStats.topSkills.slice(0, 6).map((skill, index) => (
              <div key={skill.skillName} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5] }}></div>
                <span className="text-[11px] font-bold text-gray-300 truncate tracking-tight">{skill.skillName}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action required footer section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-1 bg-gradient-to-r from-primary-600/20 via-purple-600/20 to-primary-600/20 rounded-3xl group"
      >
        <div className="bg-gray-950/80 backdrop-blur-xl rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20 rotate-3 group-hover:rotate-0 transition-transform">
              <FiTarget className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white tracking-tight">Hệ thống của bạn đang vận hành tốt!</h4>
              <p className="text-gray-400 max-w-md text-sm leading-relaxed mt-1 font-medium">
                Tất cả các dịch vụ đang hoạt động bình thường. Có 3 hồ sơ công ty mới đang chờ bạn xem xét và phê duyệt.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <Link to="/admin/company-requests" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/30 transition-all hover:-translate-y-1 active:scale-95">
              Phê duyệt ngay
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
