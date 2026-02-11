import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiEye, FiCheck, FiX, FiClock,
  FiHome, FiMail, FiPhone, FiGlobe, FiMapPin, FiUsers,
  FiFileText, FiCalendar, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CompanyRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [expandedId, setExpandedId] = useState(null);



  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const loadRequests = async () => {
    try {
      const response = await api.get('/api/companyregistrations');
      console.log('Registrations loaded:', response.data);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading company requests:', error);
      toast.error('Không thể tải danh sách đơn đăng ký công ty');
      setRequests([]);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.taxCode.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    setFilteredRequests(filtered);
  };

  const handleApprove = async (request) => {
    try {
      const response = await api.post(`/api/admin/registrations/${request.requestId}/approve`, {
        adminNotes: reviewNote
      });

      if (response.status === 200) {
        toast.success(`Đã duyệt công ty ${request.companyName}`);
        setSelectedRequest(null);
        setReviewNote('');
        loadRequests(); // Reload from API
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('Lỗi khi duyệt đơn đăng ký');
    }
  };

  const handleReject = async (request) => {
    if (!reviewNote.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const response = await api.post(`/api/admin/registrations/${request.requestId}/reject`, {
        notes: reviewNote
      });

      if (response.status === 200) {
        toast.success(`Đã từ chối đơn đăng ký của ${request.companyName}`);
        setSelectedRequest(null);
        setReviewNote('');
        loadRequests(); // Reload from API
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Lỗi khi từ chối đơn đăng ký');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <FiClock className="w-3 h-3" />
            Chờ duyệt
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <FiCheck className="w-3 h-3" />
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <FiX className="w-3 h-3" />
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getIndustryLabel = (value) => {
    // value có thể là industryId hoặc object với industryName
    if (typeof value === 'object' && value?.industryName) {
      return value.industryName;
    }
    return value;
  };

  const getLocationLabel = (value) => {
    return value || '';
  };

  const getSizeLabel = (value) => {
    return value || '';
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Yêu cầu <span className="text-primary-500">Đăng ký</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Xét duyệt các đơn đăng ký công ty mới trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-primary-500/30 transition-all group">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng đơn</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
        </div>
        <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
          <div>
            <p className="text-xs font-bold text-yellow-500/60 uppercase tracking-widest mb-1">Chờ duyệt</p>
            <p className="text-2xl font-black text-yellow-500">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all group">
          <div>
            <p className="text-xs font-bold text-green-500/60 uppercase tracking-widest mb-1">Đã duyệt</p>
            <p className="text-2xl font-black text-green-500">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all group">
          <div>
            <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest mb-1">Từ chối</p>
            <p className="text-2xl font-black text-red-500">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, mã số thuế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all font-medium text-sm cursor-pointer w-full md:w-48"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không có đơn đăng ký</h3>
            <p className="text-gray-500">Chưa có đơn đăng ký công ty nào.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.requestId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden hover:border-primary-500/30 transition-all"
            >
              {/* Main Row */}
              <div
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === request.requestId ? null : request.requestId)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {request.companyName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{request.companyName}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>Email: {request.contactPersonEmail}</span>
                      <span>{request.companyPhoneNumber}</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-400">{request.contactPersonName}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    {expandedId === request.requestId ? (
                      <FiChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === request.requestId && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 bg-gray-900/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Info */}
                        <div className="space-y-6">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Thông tin chi tiết</h4>

                          <div className="space-y-4 text-sm font-medium">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <FiMail className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Email liên hệ</p>
                                <p className="text-white">{request.contactPersonEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <FiPhone className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Số điện thoại công ty</p>
                                <p className="text-white">{request.companyPhoneNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Địa chỉ</p>
                                <p className="text-white">{request.address}</p>
                              </div>
                            </div>
                            {request.website && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                  <FiGlobe className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Website</p>
                                  <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors">
                                    {request.website}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Contact Person */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Người liên hệ</h4>
                            <div className="space-y-3">
                              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <p className="text-white font-bold text-lg mb-1">{request.contactPersonName}</p>
                                <p className="text-sm text-gray-400">{request.contactPersonEmail}</p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">{request.contactPersonPhoneNumber}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Note (if reviewed) */}
                      {request.adminNotes && (
                        <div className="mt-6 p-4 bg-primary-500/5 rounded-xl border border-primary-500/10">
                          <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-1">Ghi chú xét duyệt</p>
                          <p className="text-sm text-gray-300 font-medium">{request.adminNotes}</p>
                          <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tight">
                            Phản hồi lúc: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString('vi-VN') : 'N/A'}
                          </p>
                        </div>
                      )}

                      {/* Actions for pending */}
                      {request.status && request.status.toLowerCase() === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ghi chú xét duyệt
                            </label>
                            <textarea
                              value={selectedRequest?.requestId === request.requestId ? reviewNote : ''}
                              onChange={(e) => {
                                setSelectedRequest(request);
                                setReviewNote(e.target.value);
                              }}
                              onFocus={() => setSelectedRequest(request)}
                              rows={2}
                              className="input-field text-sm"
                              placeholder="Nhập ghi chú (bắt buộc khi từ chối)..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                handleApprove(request);
                              }}
                              className="btn-primary flex items-center gap-2"
                            >
                              <FiCheck className="w-4 h-4" />
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                handleReject(request);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <FiX className="w-4 h-4" />
                              Từ chối
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyRequestsManagement;
