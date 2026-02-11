import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiMapPin, FiX, FiGrid, FiList, FiSliders,
  FiBriefcase, FiDollarSign
} from 'react-icons/fi';
import { useJobs } from '../contexts/JobContext';
import JobCard from '../components/common/JobCard';
import { LoadingSkeleton } from '../components/common/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { locations, skills, jobLevels, jobTypes, workModes } from '../data/mockData';

const JobListPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  const { getJobsWithCompany } = useJobs();

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    level: searchParams.get('level') || '',
    type: searchParams.get('type') || '',
    workMode: searchParams.get('workMode') || '',
    salaryMin: searchParams.get('salaryMin') || '',
    salaryMax: searchParams.get('salaryMax') || '',
    skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
    sortBy: searchParams.get('sortBy') || 'default'
  });

  const jobs = getJobsWithCompany(filters);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && (typeof v === 'string' ? v.trim() : v.length > 0)) {
        params.set(k, Array.isArray(v) ? v.join(',') : v);
      }
    });
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      location: '',
      level: '',
      type: '',
      workMode: '',
      salaryMin: '',
      salaryMax: '',
      skills: [],
      sortBy: 'default'
    });
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(v =>
    v && (typeof v === 'string' ? v.trim() : v.length > 0)
  ).length - (filters.sortBy !== 'default' ? 0 : 1);

  const toggleSkill = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    updateFilter('skills', newSkills);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search & Filter Header - Floating Style */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 mb-8 sticky top-4 z-30 backdrop-blur-md bg-opacity-95 text-gray-900 dark:text-white">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder={t('jobSearchPlaceholder')}
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 dark:placeholder-gray-400 transition-shadow"
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white border-b-2 border-transparent focus:border-primary-500 focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-w-[150px]"
              >
                <option value="">🗺️ {t('allLocations')}</option>
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 h-12 px-6 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${isFilterOpen || activeFilterCount > 0
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:bg-gray-600'
                  }`}
              >
                <FiSliders className="w-5 h-5" />
                <span>{t('advancedFilter')}</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-white text-primary-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Select Pills */}
                    {[
                      { label: t('level'), key: 'level', options: jobLevels },
                      { label: t('type'), key: 'type', options: jobTypes },
                      { label: t('workMode'), key: 'workMode', options: workModes }
                    ].map(group => (
                      <div key={group.key}>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{group.label}</label>
                        <select
                          value={filters[group.key]}
                          onChange={(e) => updateFilter(group.key, e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 transition-shadow dark:text-white"
                        >
                          <option value="">{t('all')}</option>
                          {group.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    {/* Salary */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('salaryRangeLabel')}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.salaryMin}
                          onChange={(e) => updateFilter('salaryMin', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.salaryMax}
                          onChange={(e) => updateFilter('salaryMax', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skill Cloud */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('popularSkills')}</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 15).map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${filters.skills.includes(skill)
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/30'
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                            }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  {activeFilterCount > 0 && (
                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={clearAllFilters}
                        className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
                      >
                        <FiX className="w-4 h-4" /> {t('clearFilters')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar? Maybe in V2. For now, full width results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isLoading ? t('loading') : t('foundJobs').replace('{count}', jobs.length)}
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="appearance-none h-10 pl-4 pr-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer hover:border-primary-300"
                  >
                    <option value="default">{t('sortByLabel').replace('{label}', t('sortDefault'))}</option>
                    <option value="newest">{t('sortNewest')}</option>
                    <option value="salary-high">{t('sortSalaryHigh')}</option>
                  </select>
                  <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5" />
                </div>

                <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-400'}`}>
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-400'}`}>
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {(filters.level || filters.type || filters.workMode || filters.skills.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { val: filters.level, label: jobLevels.find(l => l.value === filters.level)?.label, key: 'level' },
                  { val: filters.type, label: jobTypes.find(l => l.value === filters.type)?.label, key: 'type' },
                  { val: filters.workMode, label: workModes.find(l => l.value === filters.workMode)?.label, key: 'workMode' }
                ].map(f => f.val && (
                  <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-900/50">
                    {f.label} <button onClick={() => updateFilter(f.key, '')}><FiX className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
                {filters.skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-100 dark:border-purple-900/50">
                    {s} <button onClick={() => toggleSkill(s)}><FiX className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Job Grid */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <LoadingSkeleton type="card" count={6} />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <FiBriefcase className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noJobsFound')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">{t('noJobsFoundDesc')}</p>
                <button onClick={clearAllFilters} className="mt-6 text-primary-600 font-semibold hover:underline">{t('clearFilters')}</button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {jobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <JobCard job={job} variant={viewMode === 'list' ? 'compact' : 'default'} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination / Load More (Mock) */}
            {!isLoading && jobs.length > 0 && (
              <div className="mt-12 flex justify-center">
                <button className="px-8 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  {t('loadMore')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListPage;
