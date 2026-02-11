import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMoreVertical, FiEye, FiCheck, FiX, FiTrash2,
  FiHome, FiMapPin, FiUsers, FiGlobe, FiMail, FiPhone,
  FiStar, FiShield, FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import companyService from '../../services/companyService';
import jobService from '../../services/jobService';
import { Modal, ConfirmDialog } from '../../components/common/Modal';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Load companies from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [companiesRes, jobsRes] = await Promise.all([
          companyService.getAll(),
          jobService.getAll()
        ]);
        setCompanies(companiesRes.data || []);
        setJobs(jobsRes.data || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search
    if (searchTerm) {
      result = result.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        result = result.filter(company => company.isVerified);
      } else if (statusFilter === 'pending') {
        result = result.filter(company => !company.isVerified);
      }
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'jobs':
        result.sort((a, b) => {
          const jobsA = jobs.filter(j => j.companyId === a.id).length;
          const jobsB = jobs.filter(j => j.companyId === b.id).length;
          return jobsB - jobsA;
        });
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return result;
  }, [companies, searchTerm, statusFilter, sortBy]);

  const handleVerify = async (company) => {
    try {
      await companyService.verify(company.id, true);
      setCompanies(prev => prev.map(c =>
        c.id === company.id ? { ...c, isVerified: true } : c
      ));
      toast.success('Đã xác thực công ty');
      setActiveDropdown(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xác thực');
    }
  };

  const handleUnverify = async (company) => {
    try {
      await companyService.verify(company.id, false);
      setCompanies(prev => prev.map(c =>
        c.id === company.id ? { ...c, isVerified: false } : c
      ));
      toast.success('Đã hủy xác thực công ty');
      setActiveDropdown(null);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi hủy xác thực');
    }
  };

  const handleDeleteCompany = async () => {
    if (selectedCompany) {
      try {
        await companyService.delete(selectedCompany.id);
        setCompanies(prev => prev.filter(c => c.id !== selectedCompany.id));
        toast.success('Đã xóa công ty');
        setShowDeleteModal(false);
        setSelectedCompany(null);
      } catch (err) {
        console.error(err);
        toast.error('Không thể xóa công ty. Có thể còn dữ liệu liên quan.');
      }
    }
  };

  const getJobCount = (companyId) => {
    return jobs.filter(j => j.companyId === companyId).length;
  };

  // Stats
  const stats = {
    total: companies.length,
    verified: companies.filter(c => c.isVerified).length,
    pending: companies.filter(c => !c.isVerified).length,
    totalJobs: jobs.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý <span className="text-primary-500">Công ty</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Xác thực và giám sát thông tin doanh nghiệp</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-primary-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
              <FiHome className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
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
              <FiShield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đã xác thực</p>
              <p className="text-2xl font-black text-white">{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-yellow-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <FiAlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chờ phê duyệt</p>
              <p className="text-2xl font-black text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <FiUsers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tin tuyển dụng</p>
              <p className="text-2xl font-black text-white">{stats.totalJobs}</p>
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
              placeholder="Tìm kiếm theo tên, ngành nghề..."
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
              <option value="verified">Đã xác thực</option>
              <option value="pending">Chờ xác thực</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer"
            >
              <option value="name">Theo tên</option>
              <option value="jobs">Nhiều tin TD</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <FiHome className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Không tìm thấy công ty nào</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden hover:border-primary-500/30 transition-all shadow-lg hover:shadow-primary-500/5 group"
            >
              {/* Banner */}
              <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-700 relative">
                {company.banner && (
                  <img src={company.banner} alt="" className="w-full h-full object-cover" />
                )}
                {/* Dropdown Menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === company.id ? null : company.id)}
                    className="p-1.5 bg-black/30 backdrop-blur-sm rounded-lg hover:bg-black/50 transition-colors"
                  >
                    <FiMoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {activeDropdown === company.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailModal(true);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                      >
                        <FiEye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                      {company.isVerified ? (
                        <button
                          onClick={() => handleUnverify(company)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-400 hover:bg-gray-600"
                        >
                          <FiX className="w-4 h-4" />
                          Hủy xác thực
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(company)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-gray-600"
                        >
                          <FiCheck className="w-4 h-4" />
                          Xác thực
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDeleteModal(true);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Xóa công ty
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 -mt-8 relative">
                <div className="w-16 h-16 bg-gray-700 rounded-xl border-4 border-gray-800 flex items-center justify-center overflow-hidden mb-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiHome className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{company.name}</h3>
                  {company.isVerified ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <FiShield className="w-3 h-3" />
                      Đã xác thực
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Chờ xác thực
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-3">{company.industry}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiMapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiUsers className="w-4 h-4" />
                    <span>{company.size}</span>
                  </div>
                  {company.rating && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <FiStar className="w-4 h-4 fill-current" />
                      <span>{company.rating} ({company.reviews} đánh giá)</span>
                    </div>
                  )}
                </div>

                {/* Job count */}
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tin tuyển dụng</span>
                  <span className="font-semibold text-white">{getJobCount(company.id)}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Company Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết công ty"
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover" />
                ) : (
                  <FiHome className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedCompany.name}</h3>
                  {selectedCompany.isVerified && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                      <FiShield className="w-3 h-3" />
                      Đã xác thực
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{selectedCompany.industry}</p>
                {selectedCompany.rating && (
                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="font-medium">{selectedCompany.rating}</span>
                    <span className="text-gray-400">({selectedCompany.reviews} đánh giá)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Địa điểm</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCompany.location}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                <FiUsers className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Quy mô</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCompany.size}</p>
                </div>
              </div>
              {selectedCompany.website && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                </div>
              )}
              {selectedCompany.email && (
                <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCompany.email}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedCompany.description && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Giới thiệu</p>
                <p className="text-gray-700 whitespace-pre-line">{selectedCompany.description}</p>
              </div>
            )}

            {selectedCompany.benefits && selectedCompany.benefits.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Phúc lợi</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCompany.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {!selectedCompany.isVerified && (
                <button
                  onClick={() => {
                    handleVerify(selectedCompany);
                    setShowDetailModal(false);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Xác thực công ty
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCompany}
        title="Xóa công ty"
        message={`Bạn có chắc chắn muốn xóa công ty "${selectedCompany?.name}"? Tất cả tin tuyển dụng của công ty cũng sẽ bị xóa.`}
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

export default CompaniesManagement;
