import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiUsers, FiBriefcase, FiFileText,
  FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiCalendar, FiPieChart
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(false);

  // Mock data for charts
  const growthData = [
    { name: 'Tháng 1', users: 400, jobs: 240 },
    { name: 'Tháng 2', users: 300, jobs: 139 },
    { name: 'Tháng 3', users: 200, jobs: 980 },
    { name: 'Tháng 4', users: 278, jobs: 390 },
    { name: 'Tháng 5', users: 189, jobs: 480 },
    { name: 'Tháng 6', users: 239, jobs: 380 },
    { name: 'Tháng 7', users: 349, jobs: 430 },
  ];

  const distributionData = [
    { name: 'Công nghệ', value: 400 },
    { name: 'Kinh doanh', value: 300 },
    { name: 'Marketing', value: 200 },
    { name: 'Nhân sự', value: 100 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 p-4 rounded-xl shadow-2xl">
          <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-[10px]">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-white font-black text-sm">
                {entry.name}: <span className="text-primary-400">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Thống kê <span className="text-primary-500">Báo cáo</span></h1>
          <p className="text-gray-400 mt-1 font-medium">Phân tích dữ liệu và hiệu suất hoạt động của hệ thống</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700">
            <FiCalendar className="w-4 h-4" />
            30 ngày qua
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20">
            Tải báo cáo (PDF)
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Lượt truy cập', value: '124.5k', change: '+12.5%', icon: FiTrendingUp, color: 'blue' },
          { label: 'Người dùng mới', value: '1,240', change: '+8.2%', icon: FiUsers, color: 'green' },
          { label: 'Việc làm mới', value: '456', change: '-3.1%', icon: FiBriefcase, color: 'yellow' },
          { label: 'Công ty mới', value: '24', change: '+5.4%', icon: FiFileText, color: 'red' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 opacity-[0.03] group-hover:scale-125 transition-transform duration-500 ${item.color === 'blue' ? 'text-blue-500' : item.color === 'green' ? 'text-green-500' : item.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>
              <item.icon className="w-full h-full" />
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-2xl font-black text-white">{item.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              {item.change.startsWith('+') ? (
                <FiArrowUpRight className="text-green-500 w-4 h-4" />
              ) : (
                <FiArrowDownRight className="text-red-500 w-4 h-4" />
              )}
              <span className={`text-xs font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {item.change}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">so với tháng trước</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 border border-gray-800/50 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <FiBarChart2 className="text-primary-500" />
              Tăng trưởng hệ thống
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Người dùng</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase">Việc làm</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis
                  dataKey="name"
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Người dùng"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  name="Việc làm"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 border border-gray-800/50 shadow-2xl">
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-8">
            <FiPieChart className="text-primary-500" />
            Lĩnh vực hàng đầu
          </h3>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-4">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-400 font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-white font-black">{Math.round((item.value / 1000) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
