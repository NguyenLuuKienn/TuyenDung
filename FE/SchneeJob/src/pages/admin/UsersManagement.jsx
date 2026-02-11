import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import {
  FiSearch, FiFilter, FiMoreVertical, FiEdit2, FiTrash2,
  FiLock, FiUnlock, FiMail, FiUser, FiUsers, FiBriefcase,
  FiCalendar, FiMapPin, FiEye, FiUserCheck, FiUserX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Modal, ConfirmDialog } from '../../components/common/Modal';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // TODO: Load users from API when available
  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        // request all users (no paging)
        const res = await api.get('/api/admin/users');
        if (!mounted) return;
        // backend returns array or a paged object; handle both
        const data = res.data && Array.isArray(res.data.items) ? res.data.items : res.data;
        setUsers(Array.isArray(data) ? data.map(u => {
          // normalize commonly-used backend names (PascalCase) and possible shapes
          const id = u.id || u.userId || u.UserId || u.userID;
          const name = u.fullName || u.FullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
          const email = u.email || u.Email;

          // derive role from UserRoles (backend returns UserRoles -> Role -> RoleName)
          let roleName = null;
          const userRoles = u.userRoles || u.UserRoles || u.UserRoles || u.user_roles;
          if (Array.isArray(userRoles) && userRoles.length > 0) {
            const firstRole = userRoles[0];
            roleName = firstRole?.role?.roleName || firstRole?.Role?.RoleName || firstRole?.roleName || firstRole?.RoleName;
          }
          // fallback heuristics
          if (!roleName) {
            roleName = (u.role || u.Role || (u.isEmployer ? 'Employer' : u.isAdmin ? 'Admin' : null));
          }
          const role = (roleName || '').toString().toLowerCase().includes('employer') ? 'employer'
            : (roleName || '').toString().toLowerCase().includes('admin') ? 'admin' : 'jobseeker';

          const isActive = (u.isActive !== undefined && u.isActive !== null) ? u.isActive
            : (u.IsActive !== undefined && u.IsActive !== null) ? u.IsActive
              : true;
          const isLocked = (u.isLocked !== undefined && u.isLocked !== null) ? u.isLocked
            : (u.locked !== undefined && u.locked !== null) ? u.locked
              : (isActive === false);
          const avatar = u.avatarUrl || u.AvatarURL || u.avatar || u.profilePicture || null;
          const createdAt = u.createdAt || u.CreatedAt || u.createdOn || u.registeredAt || null;

          return { id, name, email, role, isLocked, avatar, createdAt };
        }) : []);
      } catch (err) {
        console.error('Failed to load users', err);
        setUsers([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadUsers();
    return () => { mounted = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchTerm) {
      result = result.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(user => !user.isLocked);
      } else if (statusFilter === 'locked') {
        result = result.filter(user => user.isLocked);
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const handleToggleLock = (user) => {
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, isLocked: !u.isLocked } : u
    ));
    toast.success(user.isLocked ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    setActiveDropdown(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    const doDelete = async () => {
      try {
        // call backend delete
        await api.delete(`/api/admin/users/${selectedUser.id}`);
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        toast.success('Đã xóa người dùng');
      } catch (err) {
        console.error('Failed to delete user', err);
        const status = err?.response?.status;
        // If DELETE not allowed on current server build, fall back to setting inactive via PATCH
        if (status === 405) {
          try {
            await api.patch(`/api/admin/users/${selectedUser.id}/status`, false);
            setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
            toast.success('Đã vô hiệu hóa tài khoản (soft-delete)');
          } catch (innerErr) {
            console.error('Fallback patch failed', innerErr);
            const msg = innerErr?.response?.data?.message || innerErr.message || 'Xóa thất bại';
            toast.error(`Xóa thất bại: ${msg}`);
          }
        } else {
          const msg = err?.response?.data?.message || err.message || 'Xóa thất bại';
          toast.error(`Xóa thất bại: ${msg}`);
        }
      } finally {
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    };
    doDelete();
  };

  const getRoleBadge = (role) => {
    const badges = {
      jobseeker: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Ứng viên' },
      employer: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Nhà tuyển dụng' },
      admin: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Admin' }
    };
    const badge = badges[role] || badges.jobseeker;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Stats
  const stats = {
    total: users.length,
    jobseekers: users.filter(u => u.role === 'jobseeker').length,
    employers: users.filter(u => u.role === 'employer').length,
    locked: users.filter(u => u.isLocked).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý <span className="text-primary-500">Người dùng</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Theo dõi và điều chỉnh quyền truy cập của tất cả thành viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-primary-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
              <FiUsers className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng số</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <FiUser className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ứng viên</p>
              <p className="text-2xl font-black text-white">{stats.jobseekers}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-green-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <FiBriefcase className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nhà tuyển dụng</p>
              <p className="text-2xl font-black text-white">{stats.employers}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-red-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <FiLock className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đã khóa</p>
              <p className="text-2xl font-black text-white">{stats.locked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="jobseeker">Ứng viên</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Theo tên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50 bg-gray-800/30">
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Người dùng</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vai trò</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Trạng thái</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày tham gia</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="p-4">
                    {user.isLocked ? (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <FiLock className="w-4 h-4" />
                        Đã khóa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <FiUserCheck className="w-4 h-4" />
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {activeDropdown === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            <FiEye className="w-4 h-4" />
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => handleToggleLock(user)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            {user.isLocked ? (
                              <>
                                <FiUnlock className="w-4 h-4" />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <FiLock className="w-4 h-4" />
                                Khóa tài khoản
                              </>
                            )}
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            <FiMail className="w-4 h-4" />
                            Gửi email
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Xóa tài khoản
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết người dùng"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Vai trò</p>
                <p className="font-medium text-gray-900">
                  {selectedUser.role === 'jobseeker' ? 'Ứng viên' :
                    selectedUser.role === 'employer' ? 'Nhà tuyển dụng' : 'Admin'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p className="font-medium text-gray-900">
                  {selectedUser.isLocked ? 'Đã khóa' : 'Đang hoạt động'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Điện thoại</p>
                <p className="font-medium text-gray-900">{selectedUser.phone || 'Chưa cập nhật'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Địa điểm</p>
                <p className="font-medium text-gray-900">{selectedUser.location || 'Chưa cập nhật'}</p>
              </div>
            </div>

            {selectedUser.skills && selectedUser.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Kỹ năng</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default UsersManagement;
