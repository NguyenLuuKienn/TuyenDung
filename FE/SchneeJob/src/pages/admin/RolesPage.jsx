import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiShield, FiSearch, FiInfo, FiCheckCircle, FiLock,
  FiKey, FiBriefcase, FiUser, FiZap
} from 'react-icons/fi';
import api from '../../services/api';

const RolesPage = () => {
  const [roles, setRoles] = useState([
    {
      id: '1',
      name: 'Administrator',
      key: 'admin',
      description: 'Quyền quản trị toàn hệ thống. Có toàn quyền truy cập vào tất cả các tính năng và dữ liệu.',
      usersCount: 5,
      permissions: ['ALL_PERMISSIONS'],
      color: 'red'
    },
    {
      id: '2',
      name: 'Employer',
      key: 'employer',
      description: 'Nhà tuyển dụng. Có quyền đăng tin, quản lý ứng viên và thông tin công ty.',
      usersCount: 124,
      permissions: ['POST_JOB', 'MANAGE_APPLICATIONS', 'VIEW_RESUMES', 'EDIT_COMPANY'],
      color: 'blue'
    },
    {
      id: '3',
      name: 'Job Seeker',
      key: 'jobseeker',
      description: 'Người tìm việc. Có quyền tìm kiếm việc làm, ứng tuyển và quản lý hồ sơ cá nhân.',
      usersCount: 2450,
      permissions: ['SEARCH_JOBS', 'APPLY_JOBS', 'MANAGE_PROFILE', 'VIEW_NOTIFICATIONS'],
      color: 'green'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, you would fetch this from the backend
  useEffect(() => {
    // const fetchRoles = async () => {
    //   try {
    //     const res = await api.get('/api/roles');
    //     setRoles(res.data);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // };
    // fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (key) => {
    switch (key) {
      case 'admin': return <FiShield className="w-6 h-6" />;
      case 'employer': return <FiBriefcase className="w-6 h-6" />;
      case 'jobseeker': return <FiUser className="w-6 h-6" />;
      default: return <FiShield className="w-6 h-6" />;
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'blue': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'green': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Phân quyền <span className="text-primary-500">Vai trò</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Quản lý các vai trò người dùng và quyền hạn tương ứng trong hệ thống</p>
      </div>

      {/* Info Card */}
      <div className="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500">
          <FiInfo className="w-6 h-6" />
        </div>
        <div>
          <p className="text-white font-bold">Lưu ý về quyền hạn</p>
          <p className="text-gray-400 text-sm">Các quyền hạn này được xác định dựa trên cấu hình hệ thống Core. Thay đổi ở đây sẽ ảnh hưởng trực tiếp đến khả năng truy cập của người dùng.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50 shadow-lg">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm vai trò hoặc quyền hạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all relative overflow-hidden group"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full bg-current ${role.color === 'red' ? 'text-red-500' : role.color === 'blue' ? 'text-blue-500' : 'text-green-500'}`} />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getColorClasses(role.color)} shadow-lg shadow-current/5`}>
                  {getRoleIcon(role.key)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{role.name}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{role.usersCount} Thành viên</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-gray-800">
                <FiLock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Hệ thống</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {role.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiKey className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Quyền hạn chính</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 border border-gray-700/50 rounded-lg group-hover:border-primary-500/30 transition-all"
                  >
                    <FiCheckCircle className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-xs font-bold text-gray-400 group-hover:text-primary-300 transition-colors tracking-tight">{perm}</span>
                  </div>
                ))}
                {role.key === 'admin' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                    <FiZap className="w-3.5 h-3.5 text-primary-400" />
                    <span className="text-xs font-bold text-primary-400 tracking-tight">FULL_SYSTEM_ACCESS</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="text-sm font-bold text-primary-500 hover:text-primary-400 flex items-center gap-2 px-4 py-2 hover:bg-primary-500/5 rounded-xl transition-all">
                Xem chi tiết
                <FiInfo className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RolesPage;
