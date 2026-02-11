import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiDollarSign, FiHeart, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import { useJobs } from '../../contexts/JobContext';
import { useAuth } from '../../contexts/AuthContext';

const JobCard = ({ job, showCompany = true, variant = 'default' }) => {
  const { toggleSaveJob, savedJobs } = useJobs();
  const { isAuthenticated, isJobSeeker } = useAuth();

  const isSaved = savedJobs.some(j => (j.id === job.id) || (j === job.id) || (j.jobId === job.id));

  const formatSalary = (salary) => {
    if (!salary) return 'Thương lượng';
    const { min, max, negotiable } = salary;
    if (negotiable) return 'Thương lượng';
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num;
    };
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      intern: 'bg-blue-50 text-blue-700 border-blue-100',
      fresher: 'bg-green-50 text-green-700 border-green-100',
      junior: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      middle: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      senior: 'bg-purple-50 text-purple-700 border-purple-100',
      leader: 'bg-pink-50 text-pink-700 border-pink-100',
      manager: 'bg-red-50 text-red-700 border-red-100'
    };
    return colors[level] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getWorkModeLabel = (mode) => {
    const labels = {
      onsite: 'Tại văn phòng',
      remote: 'Remote',
      hybrid: 'Hybrid'
    };
    return labels[mode] || mode;
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated && isJobSeeker) {
      toggleSaveJob(job.id);
    }
  };

  const daysLeft = () => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const diffTime = Math.abs(deadline - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (variant === 'compact') {
    return (
      <Link to={`/jobs/${job.id}`} className="block h-full">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all h-full flex flex-col"
        >
          <div className="flex items-start gap-3 mb-2">
            {showCompany && job.company && (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-100 dark:border-gray-700"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {job.title}
              </h3>
              {showCompany && job.company && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.company.name}</p>
              )}
            </div>
          </div>
          <div className="mt-auto space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiMapPin className="w-3.5 h-3.5" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded w-fit">
              <FiDollarSign className="w-3.5 h-3.5" />
              <span>{formatSalary(job.salary)}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/jobs/${job.id}`} className="block group h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 relative overflow-hidden h-full flex flex-col
          ${job.isTop
            ? 'border-primary-200 ring-4 ring-primary-50/50 shadow-lg hover:shadow-xl dark:border-primary-900 dark:ring-primary-900/30'
            : 'border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700'}`}
      >


        <div className="p-6">
          <div className="flex gap-4">
            {showCompany && job.company && (
              <div className="shrink-0 relative">
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700 bg-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                {job.company.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                    <span className="block w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center text-white">✓</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex gap-2 mb-2">
                {job.isTop && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-orange-500/30 uppercase tracking-wider">
                    Hot
                  </span>
                )}
                {job.isUrgent && (
                  <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Urgent
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {job.title}
              </h3>
              {showCompany && job.company && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {job.company.name}
                </p>
              )}
            </div>

            {/* Save Button */}
            {isAuthenticated && isJobSeeker && (
              <button
                onClick={handleSave}
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${isSaved
                  ? 'bg-red-50 text-red-500 hover:bg-red-100'
                  : 'text-gray-300 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-gray-700'
                  }`}
              >
                <FiHeart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Job Meta Info */}
          <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-md">
              <FiDollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="font-semibold">{formatSalary(job.salary)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <FiMapPin className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <FiBriefcase className="w-4 h-4" />
              <span>{getWorkModeLabel(job.workMode)}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getLevelBadgeColor(job.level)}`}>
              {/* Manual mapping for Vietnamese display if needed, or use getLevelLabel */}
              {job.level}
            </span>
            {(job.skills || []).slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium hover:border-primary-300 transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
            {(job.skills || []).length > 3 && (
              <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md text-xs font-medium">
                +{(job.skills || []).length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center justify-between group-hover:bg-primary-50/10 transition-colors">
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {daysLeft() > 0 ? `Còn ${daysLeft()} ngày` : 'Hết hạn'}
            </span>
            <span>•</span>
            <span>{job.views} lượt xem</span>
          </div>
          <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Ứng tuyển <FiArrowRight />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default JobCard;
