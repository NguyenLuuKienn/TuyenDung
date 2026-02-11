import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiClock, FiDollarSign, FiUsers, FiCalendar, FiEye,
  FiHeart, FiShare2, FiBookmark, FiArrowLeft, FiExternalLink,
  FiBriefcase, FiCheckCircle, FiStar, FiMessageSquare, FiSend
} from 'react-icons/fi';
import { useJobs } from '../contexts/JobContext';
import resumeService from '../services/resumeService';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/common/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { FiXCircle, FiAlertTriangle } from 'react-icons/fi';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobWithCompany, toggleSaveJob, savedJobs, applyForJob, compareJobs, toggleCompareJob, allJobs, isLoading: isJobsLoading } = useJobs();
  const { user, isAuthenticated, isJobSeeker } = useAuth();
  const { t } = useLanguage();

  const [job, setJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (isJobsLoading && allJobs.length === 0) {
      return;
    }

    const jobData = getJobWithCompany(id);
    if (jobData) {
      setJob(jobData);
    }
    setIsLoading(false);
  }, [id, allJobs, isJobsLoading]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await resumeService.getMyResumes();
        const items = res.data || [];
        setResumes(items);
        if (items.length > 0) setSelectedResumeId(items[0].id || items[0].resumeId || items[0].ResumeId);
      } catch (err) {
        setResumes([]);
      }
    };
    loadResumes();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy việc làm</h2>
          <Link to="/jobs" className="btn-primary">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedJobs.some(j => (String(j.id) === String(job.id)) || (String(j.jobId || '') === String(job.id)));
  const isCompared = compareJobs.includes(job.id);

  // Check job availability
  const isExpired = job.deadline && new Date(job.deadline) < new Date();
  const isClosed = job.status === 'closed' || job.status === 'filled';
  const isAvailable = !isExpired && !isClosed;

  const formatSalary = (salary) => {
    if (!salary) return 'Thương lượng';
    const { min, max, negotiable } = salary;
    if (negotiable) return 'Thương lượng';
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
      return num.toLocaleString();
    };
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  };

  const overviewItems = [
    { icon: FiDollarSign, label: 'Mức lương', value: formatSalary(job.salary), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: FiMapPin, label: 'Địa điểm', value: job.location, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FiBriefcase, label: 'Kinh nghiệm', value: job.level, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: FiClock, label: 'Hạn nộp', value: new Date(job.deadline).toLocaleDateString('vi-VN'), color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (!isJobSeeker) {
      toast.error('Chỉ người tìm việc mới có thể ứng tuyển');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const submitApplication = () => {
    if (!selectedResumeId) {
      toast.error('Vui lòng chọn hồ sơ (resume) trước khi nộp đơn');
      return;
    }

    const result = applyForJob(job.id, selectedResumeId, coverLetter);

    Promise.resolve(result).then((r) => {
      if (r && r.success) {
        toast.success('Ứng tuyển thành công!');
        setIsApplyModalOpen(false);
        setCoverLetter('');
      } else {
        const msg = r?.error?.message || r?.error || 'Ứng tuyển thất bại';
        toast.error(msg);
      }
    });
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleSaveJob(job.id);
    toast.success(isSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm');
  };

  const handleCompare = () => {
    if (compareJobs.length >= 3 && !isCompared) {
      toast.warning('Chỉ có thể so sánh tối đa 3 việc làm');
      return;
    }
    toggleCompareJob(job.id);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job.title,
        text: `${job.title} tại ${job.company?.name}`,
        url: window.location.href
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors pb-20">
      {/* Cover Image */}
      <div className="h-60 md:h-80 bg-gradient-to-r from-primary-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
          <Link to="/jobs" className="absolute top-8 left-4 md:left-8 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
            <FiArrowLeft /> Quay lại
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-2 shadow-md border border-gray-100 flex-shrink-0">
                  <img src={job.company?.logo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.isTop && <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg shadow-orange-500/30">Hot Job</span>}
                    {job.isUrgent && <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide">Tuyển gấp</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{job.title}</h1>
                  <Link to={`/companies/${job.company?.id}`} className="text-lg text-primary-600 font-medium hover:underline flex items-center gap-1.5">
                    {job.company?.name} <FiCheckCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {overviewItems.map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl ${item.bg} dark:bg-opacity-10 dark:bg-gray-700`}>
                    <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">{item.label}</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Job Availability Alert */}
              {(!isAvailable) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${isClosed
                    ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400'
                    }`}
                >
                  {isClosed ? <FiXCircle className="w-6 h-6 shrink-0" /> : <FiAlertTriangle className="w-6 h-6 shrink-0" />}
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      {isClosed ? t('jobClosed') : t('jobExpired')}
                    </h4>
                    <p className="text-sm opacity-90">
                      {isClosed ? t('jobNoLongerAccepting') : t('applicationDeadlinePassed')}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleApply}
                  disabled={!isAvailable}
                  className={`flex-1 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-transform flex items-center justify-center gap-2 ${isAvailable
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    }`}
                >
                  <FiSend className="w-5 h-5" />
                  {isAvailable ? t('applyNow') : t('jobUnavailable')}
                </button>
                <button onClick={handleSave} className={`px-4 py-3 rounded-xl border-2 font-semibold transition-colors flex items-center gap-2 ${isSaved ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <FiHeart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShare} className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors">
                  <FiShare2 className="w-6 h-6" />
                </button>
              </div>
            </motion.div>

            {/* Content Tabs & Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]"
            >
              <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 pt-6 gap-6 overflow-x-auto">
                {['description', 'requirements', 'benefits'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 font-bold text-lg transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {tab === 'description' && 'Mô tả công việc'}
                    {tab === 'requirements' && 'Yêu cầu ứng viên'}
                    {tab === 'benefits' && 'Quyền lợi & Chế độ'}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-8">
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  <div dangerouslySetInnerHTML={{ __html: job[activeTab] }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Company Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông tin công ty</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <FiUsers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Quy mô</p>
                    <p className="font-medium text-gray-900 dark:text-white">{job.company?.size} nhân viên</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <FiStar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Đánh giá</p>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900 dark:text-white">{job.company?.rating}</span>
                      <div className="flex text-yellow-500 text-xs">
                        {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className="fill-current w-3 h-3" />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link to={`/companies/${job.company?.id}`} className="block w-full text-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Xem trang công ty
                  </Link>
                </div>
              </div>
            </div>

            {/* Skills Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Kỹ năng yêu cầu</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <Link key={skill} to={`/jobs?skills=${skill}`} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    {skill}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Ứng tuyển việc làm"
        size="large"
      >
        <div className="space-y-6">
          {/* Job Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={job.company?.logo}
              alt={job.company?.name}
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{job.title}</h4>
              <p className="text-sm text-gray-500">{job.company?.name}</p>
            </div>
          </div>

          {/* CV Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn CV
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="cv-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploadingResume(true);
                  try {
                    const fd = new FormData();
                    fd.append('file', file);
                    const uploadResp = await api.post('/api/files/upload-resume', fd, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    const url = uploadResp.data?.url;
                    if (!url) throw new Error('Upload failed: no URL returned');
                    const created = await resumeService.add({ fileName: file.name, fileURL: url, fileType: file.type });
                    const createdData = created.data || created;
                    const resumeId = createdData?.resumeId || createdData?.ResumeId || createdData?.ResumeId || createdData?.id;
                    const listResp = await resumeService.getMyResumes();
                    setResumes(listResp.data || []);
                    setSelectedResumeId(resumeId);
                    toast.success('Tải CV lên thành công');
                  } catch (err) {
                    toast.error('Tải CV thất bại');
                  } finally {
                    setIsUploadingResume(false);
                  }
                }}
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer text-primary-600 hover:text-primary-700"
              >
                <FiExternalLink className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Tải CV lên</p>
                <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (Tối đa 5MB)</p>
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thư giới thiệu
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Viết thư giới thiệu của bạn..."
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="btn-ghost"
            >
              Hủy
            </button>
            <button
              onClick={submitApplication}
              className="btn-primary"
            >
              Nộp đơn ứng tuyển
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetailPage;
