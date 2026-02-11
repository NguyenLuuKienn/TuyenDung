import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiMoreVertical, FiUsers, FiCalendar, FiClock, FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { Modal, ConfirmDialog } from '../../components/common/Modal';

const ManageJobsPage = () => {
  const { user } = useAuth();
  const { getEmployerJobs, updateJob, deleteJob } = useJobs();
  
  const employerJobs = getEmployerJobs(user?.companyId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredJobs = useMemo(() => {
    let jobs = [...employerJobs];
    
    // Search
    if (searchTerm) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        jobs = jobs.filter(job => job.status === 'active' && !job.isHidden);
      } else if (statusFilter === 'hidden') {
        jobs = jobs.filter(job => job.isHidden);
      } else if (statusFilter === 'expired') {
        jobs = jobs.filter(job => new Date(job.deadline) < new Date());
      } else if (statusFilter === 'pending') {
        jobs = jobs.filter(job => job.status === 'pending');
      }
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        jobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
      case 'oldest':
        jobs.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
        break;
      case 'applicants':
        jobs.sort((a, b) => b.applicants - a.applicants);
        break;
      case 'views':
        jobs.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }
    
    return jobs;
  }, [employerJobs, searchTerm, statusFilter, sortBy]);

  const handleToggleVisibility = (job) => {
    updateJob(job.id, { isHidden: !job.isHidden });
    toast.success(job.isHidden ? 'Đã hiển thị tin tuyển dụng' : 'Đã ẩn tin tuyển dụng');
    setActiveDropdown(null);
  };

  const handleDeleteJob = () => {
    if (selectedJob) {
      deleteJob(selectedJob.id);
      toast.success('Đã xóa tin tuyển dụng');
      setShowDeleteModal(false);
      setSelectedJob(null);
    }
  };

  const getStatusBadge = (job) => {
    if (job.status === 'pending') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Chờ duyệt
        </span>
      );
    }
    if (job.isHidden) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Đã ẩn
        </span>
      );
    }
    if (new Date(job.deadline) < new Date()) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Hết hạn
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Đang hoạt động
      </span>
    );
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Đã hết hạn';
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày`;
  };

  // Stats
  const stats = {
    total: employerJobs.length,
    active: employerJobs.filter(j => j.status === 'active' && !j.isHidden && new Date(j.deadline) >= new Date()).length,
    pending: employerJobs.filter(j => j.status === 'pending').length,
    expired: employerJobs.filter(j => new Date(j.deadline) < new Date()).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-600">Quản lý và theo dõi các tin tuyển dụng của bạn</p>
        </div>
        <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2 w-fit">
          <FiPlus className="w-5 h-5" />
          Đăng tin mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Tổng tin</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Hết hạn</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="pending">Chờ duyệt</option>
            <option value="hidden">Đã ẩn</option>
            <option value="expired">Hết hạn</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="applicants">Nhiều ứng viên</option>
            <option value="views">Nhiều lượt xem</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tin tuyển dụng</h3>
            <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc đăng tin mới</p>
            <Link to="/employer/jobs/new" className="btn-primary">
              Đăng tin mới
            </Link>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link 
                        to={`/employer/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {job.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(job)}
                        {job.isTop && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                            Nổi bật
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            Tuyển gấp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      {job.applicants} ứng viên
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      {job.views} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Đăng: {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      new Date(job.deadline) < new Date() ? 'text-red-500' : ''
                    }`}>
                      <FiClock className="w-4 h-4" />
                      {getDaysRemaining(job.deadline)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/employer/candidates?job=${job.id}`}
                    className="btn-secondary py-2 px-4 text-sm"
                  >
                    Xem ứng viên
                  </Link>
                  
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === job.id ? null : job.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {activeDropdown === job.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <FiEye className="w-4 h-4" />
                          Xem tin
                        </Link>
                        <Link
                          to={`/employer/jobs/${job.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Chỉnh sửa
                        </Link>
                        <button
                          onClick={() => handleToggleVisibility(job)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {job.isHidden ? (
                            <>
                              <FiEye className="w-4 h-4" />
                              Hiển thị tin
                            </>
                          ) : (
                            <>
                              <FiEyeOff className="w-4 h-4" />
                              Ẩn tin
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDeleteModal(true);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Xóa tin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar for conversion rate */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Tỷ lệ chuyển đổi</span>
                  <span className="font-medium text-gray-900">
                    {job.views > 0 ? ((job.applicants / job.views) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${job.views > 0 ? Math.min((job.applicants / job.views) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteJob}
        title="Xóa tin tuyển dụng"
        message={`Bạn có chắc chắn muốn xóa tin "${selectedJob?.title}"? Hành động này không thể hoàn tác.`}
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

export default ManageJobsPage;
