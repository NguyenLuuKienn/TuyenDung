import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiBriefcase, FiMapPin, FiClock, FiDollarSign,
  FiHeart, FiTrash2, FiGrid, FiList, FiHome, FiFilter, FiArrowRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useJobs } from '../../contexts/JobContext';
import JobCard from '../../components/common/JobCard';

const SavedJobsPage = () => {
  const { getSavedJobs, toggleSaveJob } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const savedJobsData = useMemo(() => {
    let result = getSavedJobs();

    if (searchTerm) {
      result = result.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'salary':
        result.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      default:
        break;
    }
    return result;
  }, [searchTerm, sortBy, getSavedJobs]);

  const handleRemove = async (jobId) => {
    const success = await toggleSaveJob(jobId);
    if (success) {
      toast.success('Đã xóa khỏi danh sách yêu thích');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      {/* Header Background */}
      <div className="h-64 bg-gradient-to-r from-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center pb-12 relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors w-fit">
            <FiHome />
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Việc làm đã lưu</h1>
          <p className="text-red-100">Danh sách các công việc bạn quan tâm</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
              <FiHeart className="text-red-500" />
              <span>{savedJobsData.length} công việc</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao nhất</option>
                <option value="deadline">Sắp hết hạn</option>
              </select>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {savedJobsData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-red-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chưa lưu công việc nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Khi bạn thấy công việc phù hợp, hãy nhấn vào biểu tượng trái tim để lưu lại và xem sau nhé.
            </p>
            <Link to="/jobs" className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
              Khám phá việc làm <FiArrowRight />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4 max-w-4xl mx-auto'
            }
          >
            <AnimatePresence>
              {savedJobsData.map((job, index) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="relative group">
                      <JobCard job={job} />
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemove(job.id); }}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Bỏ lưu"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group relative">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-white flex items-center justify-center border border-gray-100 dark:border-gray-700 p-2 flex-shrink-0">
                          {job.company?.logo ? (
                            <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                          ) : (
                            <FiHome className="text-gray-300 text-2xl" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link to={`/jobs/${job.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition block mb-1">
                            {job.title}
                          </Link>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{job.company?.name}</p>

                          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> {job.location}</span>
                            <span className="flex items-center gap-1"><FiDollarSign className="text-gray-400" /> {job.salary}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link to={`/jobs/${job.id}`} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition">
                            Ứng tuyển
                          </Link>
                          <button
                            onClick={() => handleRemove(job.id)}
                            className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2"
                          >
                            <FiTrash2 /> Bỏ lưu
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
