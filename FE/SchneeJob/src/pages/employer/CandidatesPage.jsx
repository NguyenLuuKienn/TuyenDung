import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatWidgetContext';
import { motion } from 'framer-motion';
import {
  FiSearch, FiFilter, FiUser, FiMail, FiPhone, FiDownload,
  FiEye, FiStar, FiCheck, FiX, FiMessageSquare, FiCalendar,
  FiMapPin, FiBriefcase, FiChevronDown
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { Modal } from '../../components/common/Modal';

const CandidatesPage = () => {
  const navigate = useNavigate();
  const { openChat } = useChat();
  const { user } = useAuth();
  const { getEmployerJobs, getJobApplications, updateApplicationStatus } = useJobs();
  const [searchParams] = useSearchParams();

  const employerJobsRaw = getEmployerJobs(user?.companyId);
  const employerJobs = useMemo(() => employerJobsRaw, [JSON.stringify(employerJobsRaw)]);
  const initialJobFilter = searchParams.get('job') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [jobFilter, setJobFilter] = useState(initialJobFilter);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load all applications for employer's jobs (async)
  const [allApplications, setAllApplications] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const results = [];
        for (const job of employerJobs) {
          const jobApps = await getJobApplications(job.id);
          // map server application shape to frontend-friendly shape
          const mapped = (jobApps || []).map((app) => {
            const applicant = app.user || app.User || null;
            return {
              id: app.applicationId || app.ApplicationId,
              jobId: app.jobId || app.JobId,
              userId: app.userId || app.UserId,
              resumeId: app.resumeId || app.ResumeId,
              coverLetter: app.coverLetter || app.CoverLetter,
              appliedAt: app.appliedDate || app.AppliedDate || app.appliedAt,
              status: (app.status || app.Status || 'pending').toLowerCase(),
              matchScore: app.matchScore || app.MatchScore || null,
              applicant: applicant ? {
                id: applicant.userId || applicant.UserId || applicant.id,
                name: applicant.fullName || applicant.FullName || applicant.name,
                email: applicant.email || applicant.Email,
                phone: applicant.phoneNumber || applicant.PhoneNumber || applicant.phone,
                avatar: applicant.avatarURL || applicant.AvatarURL || applicant.avatar,
                skills: applicant.skills || applicant.Skills || []
              } : null,
              job
            };
          });
          results.push(...mapped);
        }
        if (mounted) setAllApplications(results);
      } catch (err) {
        console.error('Failed to load employer applications:', err);
        if (mounted) setAllApplications([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [employerJobs, getJobApplications]);

  const filteredApplications = useMemo(() => {
    let apps = [...allApplications];

    // Search
    if (searchTerm) {
      apps = apps.filter(app =>
        app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Job filter
    if (jobFilter !== 'all') {
      apps = apps.filter(app => app.jobId === jobFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      apps = apps.filter(app => app.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        apps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        break;
      case 'oldest':
        apps.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
        break;
      case 'match':
        apps.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      default:
        break;
    }

    return apps;
  }, [allApplications, searchTerm, jobFilter, statusFilter, sortBy]);

  const handleStatusChange = (applicationId, newStatus) => {
    updateApplicationStatus(applicationId, newStatus);
    const statusLabels = {
      pending: 'Đang chờ',
      viewed: 'Đã xem',
      shortlisted: 'Vào danh sách ngắn',
      interviewed: 'Đã phỏng vấn',
      rejected: 'Từ chối',
      hired: 'Đã tuyển'
    };
    toast.success(`Đã cập nhật trạng thái: ${statusLabels[newStatus]}`);
  };

  const handleMessage = (applicantId) => {
    openChat(applicantId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      viewed: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      interviewed: 'bg-indigo-100 text-indigo-700',
      rejected: 'bg-red-100 text-red-700',
      hired: 'bg-green-100 text-green-700'
    };
    const labels = {
      pending: 'Đang chờ',
      viewed: 'Đã xem',
      shortlisted: 'Shortlist',
      interviewed: 'Đã phỏng vấn',
      rejected: 'Từ chối',
      hired: 'Đã tuyển'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {labels[status] || 'Đang chờ'}
      </span>
    );
  };

  // Stats
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(a => a.status === 'pending').length,
    shortlisted: allApplications.filter(a => a.status === 'shortlisted').length,
    hired: allApplications.filter(a => a.status === 'hired').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
        <p className="text-gray-600">Xem và quản lý hồ sơ ứng viên đã nộp</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Tổng ứng viên</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Shortlist</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shortlisted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Đã tuyển</p>
          <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="input-field lg:w-64"
          >
            <option value="all">Tất cả tin tuyển dụng</option>
            {employerJobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field lg:w-40"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="viewed">Đã xem</option>
            <option value="shortlisted">Shortlist</option>
            <option value="interviewed">Đã phỏng vấn</option>
            <option value="rejected">Từ chối</option>
            <option value="hired">Đã tuyển</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field lg:w-40"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="match">Độ phù hợp</option>
          </select>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có ứng viên</h3>
            <p className="text-gray-500">Chưa có ứng viên nào ứng tuyển vào vị trí này</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {application.applicant?.avatar ? (
                      <img
                        src={application.applicant.avatar}
                        alt={application.applicant.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {application.applicant?.name || 'Ứng viên ẩn danh'}
                      </h3>
                      {getStatusBadge(application.status)}
                      {application.matchScore && (
                        <span className="flex items-center gap-1 text-sm text-yellow-600">
                          <FiStar className="w-4 h-4 fill-current" />
                          {application.matchScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Ứng tuyển: <span className="font-medium">{application.job?.title}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {application.applicant?.email && (
                        <span className="flex items-center gap-1">
                          <FiMail className="w-4 h-4" />
                          {application.applicant.email}
                        </span>
                      )}
                      {application.applicant?.phone && (
                        <span className="flex items-center gap-1">
                          <FiPhone className="w-4 h-4" />
                          {application.applicant.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                  <button
                    onClick={() => {
                      setSelectedCandidate(application);
                      setShowDetailModal(true);
                      if (application.status === 'pending') {
                        handleStatusChange(application.id, 'viewed');
                      }
                    }}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-1"
                  >
                    <FiEye className="w-4 h-4" />
                    Xem hồ sơ
                  </button>

                  <button
                    onClick={() => handleMessage(application.applicant.id)}
                    className="btn-secondary py-2 px-4 text-sm flex items-center gap-1 text-primary-600 border-primary-200 hover:bg-primary-50"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    Nhắn tin
                  </button>

                  {application.status !== 'shortlisted' && application.status !== 'hired' && (
                    <button
                      onClick={() => handleStatusChange(application.id, 'shortlisted')}
                      className="btn-secondary py-2 px-4 text-sm flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <FiStar className="w-4 h-4" />
                      Shortlist
                    </button>
                  )}

                  <div className="relative group">
                    <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-1">
                      Cập nhật
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                      <button
                        onClick={() => handleStatusChange(application.id, 'interviewed')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Đánh dấu đã phỏng vấn
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'hired')}
                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                      >
                        Đánh dấu đã tuyển
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter Preview */}
              {application.coverLetter && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Thư xin việc:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{application.coverLetter}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Candidate Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết ứng viên"
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedCandidate.applicant?.avatar ? (
                  <img
                    src={selectedCandidate.applicant.avatar}
                    alt={selectedCandidate.applicant.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCandidate.applicant?.name || 'Ứng viên'}
                </h3>
                <p className="text-gray-600">{selectedCandidate.applicant?.title || 'Chưa cập nhật'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {selectedCandidate.applicant?.location && (
                    <span className="flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      {selectedCandidate.applicant.location}
                    </span>
                  )}
                  {selectedCandidate.applicant?.experience && (
                    <span className="flex items-center gap-1">
                      <FiBriefcase className="w-4 h-4" />
                      {selectedCandidate.applicant.experience} năm kinh nghiệm
                    </span>
                  )}
                </div>
              </div>
              {getStatusBadge(selectedCandidate.status)}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiMail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{selectedCandidate.applicant?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Điện thoại</p>
                  <p className="text-sm font-medium">{selectedCandidate.applicant?.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            {/* Applied Job */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Vị trí ứng tuyển</h4>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="font-medium text-primary-700">{selectedCandidate.job?.title}</p>
                <p className="text-sm text-primary-600">
                  Ngày nộp: {new Date(selectedCandidate.appliedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Cover Letter */}
            {selectedCandidate.coverLetter && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Thư xin việc</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{selectedCandidate.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Skills */}
            {selectedCandidate.applicant?.skills && selectedCandidate.applicant.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Kỹ năng</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.applicant.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {selectedCandidate.resume && (
                <button className="btn-secondary flex items-center gap-2">
                  <FiDownload className="w-4 h-4" />
                  Tải CV
                </button>
              )}
              <Link
                to={`/employer/messages?userId=${selectedCandidate.userId}`}
                className="btn-secondary flex items-center gap-2"
              >
                <FiMessageSquare className="w-4 h-4" />
                Nhắn tin
              </Link>
              {selectedCandidate.status !== 'hired' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedCandidate.id, 'hired');
                    setShowDetailModal(false);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Tuyển dụng
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidatesPage;
