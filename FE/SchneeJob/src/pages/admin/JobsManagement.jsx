import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMoreVertical, FiEye, FiCheck, FiX, FiTrash2,
  FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiCalendar,
  FiHome, FiAlertCircle, FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import jobService from '../../services/jobService';
import companyService from '../../services/companyService';
import { Modal, ConfirmDialog } from '../../components/common/Modal';

const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const response = await jobService.getAll();
        setJobs(response.data || []);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        toast.error('Không thể tải danh sách công việc');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
    // load companies (for admin view)
    const loadCompanies = async () => {
      try {
        const res = await companyService.getAll();
        setCompanies(res.data || []);
      } catch (err) {
        console.warn('Could not load companies for admin jobs view', err);
        setCompanies([]);
      }
    };
    loadCompanies();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchTerm) {
      result = result.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(job => job.status === 'active' && !job.isHidden);
      } else if (statusFilter === 'pending') {
        result = result.filter(job => job.status === 'pending');
      } else if (statusFilter === 'hidden') {
        result = result.filter(job => job.isHidden);
      } else if (statusFilter === 'expired') {
        result = result.filter(job => new Date(job.deadline) < new Date());
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
        break;
      case 'applicants':
        result.sort((a, b) => b.applicants - a.applicants);
        break;
      default:
        break;
    }

    return result;
  }, [jobs, searchTerm, statusFilter, sortBy]);

  const handleApprove = (job) => {
    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, status: 'active' } : j
    ));
    toast.success('Đã phê duyệt tin tuyển dụng');
    setActiveDropdown(null);
  };

  const handleReject = (job) => {
    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, status: 'rejected' } : j
    ));
    toast.success('Đã từ chối tin tuyển dụng');
    setActiveDropdown(null);
  };

  const handleToggleVisibility = (job) => {
    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, isHidden: !j.isHidden } : j
    ));
    toast.success(job.isHidden ? 'Đã hiển thị tin tuyển dụng' : 'Đã ẩn tin tuyển dụng');
    setActiveDropdown(null);
  };

  const handleDeleteJob = () => {
    if (selectedJob) {
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      toast.success('Đã xóa tin tuyển dụng');
      setShowDeleteModal(false);
      setSelectedJob(null);
    }
  };

  const getStatusBadge = (job) => {
    if (job.status === 'pending') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
          Chờ duyệt
        </span>
      );
    }
    if (job.status === 'rejected') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          Từ chối
        </span>
      );
    }
    if (job.isHidden) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
          Đã ẩn
        </span>
      );
    }
    if (new Date(job.deadline) < new Date()) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
          Hết hạn
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        Đang hoạt động
      </span>
    );
  };

  const getCompany = (companyId) => {
    if (!companyId) return null;
    // jobs may include a nested company object, prefer that
    const fromJobs = jobs.find(j => j.companyId === companyId && j.company)?.company;
    if (fromJobs) return fromJobs;
    return companies.find(c => c.id === companyId) || null;
  };

  // Stats
  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active' && !j.isHidden && new Date(j.deadline) >= new Date()).length,
    pending: jobs.filter(j => j.status === 'pending').length,
    hidden: jobs.filter(j => j.isHidden).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý <span className="text-primary-500">Việc làm</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Kiểm duyệt và giám sát các tin đăng tuyển dụng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-primary-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
              <FiBriefcase className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng số</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-green-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <FiCheck className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đang chạy</p>
              <p className="text-2xl font-black text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chờ duyệt</p>
              <p className="text-2xl font-black text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-gray-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <FiX className="w-6 h-6 text-gray-500 group-hover:text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đã ẩn</p>
              <p className="text-2xl font-black text-white">{stats.hidden}</p>
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
              placeholder="Tìm kiếm theo tiêu đề, công ty..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
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
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="applicants">Nhiều ứng viên</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <FiBriefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Không tìm thấy tin tuyển dụng nào</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const company = job.company || getCompany(job.companyId);
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800/50 hover:border-primary-500/30 transition-all shadow-lg hover:shadow-primary-500/5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Job Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {company?.logo ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiHome className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white truncate">{job.title}</h3>
                        {getStatusBadge(job)}
                        {job.isTop && (
                          <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                            Nổi bật
                          </span>
                        )}
                        {job.isUrgent && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                            Gấp
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{company?.name || 'Unknown Company'}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiDollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(job.postedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{job.views}</p>
                      <p className="text-xs text-gray-400">Lượt xem</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{job.applicants}</p>
                      <p className="text-xs text-gray-400">Ứng viên</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {job.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(job)}
                          className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Phê duyệt"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(job)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Từ chối"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === job.id ? null : job.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-400" />
                      </button>

                      {activeDropdown === job.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowDetailModal(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            <FiEye className="w-4 h-4" />
                            Xem chi tiết
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            Xem trên trang
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(job)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          >
                            {job.isHidden ? (
                              <>
                                <FiEye className="w-4 h-4" />
                                Hiển thị tin
                              </>
                            ) : (
                              <>
                                <FiX className="w-4 h-4" />
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
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Xóa tin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Job Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết tin tuyển dụng"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {(selectedJob.company?.logo || getCompany(selectedJob.companyId)?.logo) ? (
                  <img
                    src={(selectedJob.company?.logo) || getCompany(selectedJob.companyId).logo}
                    alt="Company"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiHome className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                <p className="text-gray-600">{selectedJob.company?.name || getCompany(selectedJob.companyId)?.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Địa điểm</p>
                <p className="font-medium text-gray-900">{selectedJob.location}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Mức lương</p>
                <p className="font-medium text-gray-900">{selectedJob.salary}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Loại hình</p>
                <p className="font-medium text-gray-900">{selectedJob.type}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Kinh nghiệm</p>
                <p className="font-medium text-gray-900">{selectedJob.experience}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ngày đăng</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedJob.postedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Hạn nộp</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedJob.deadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Kỹ năng yêu cầu</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.description && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Mô tả công việc</p>
                <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
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

export default JobsManagement;
