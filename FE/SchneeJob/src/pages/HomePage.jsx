import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiBriefcase, FiUsers, FiTrendingUp,
  FiArrowRight, FiActivity, FiStar, FiShield, FiZap
} from 'react-icons/fi';
import { useJobs } from '../contexts/JobContext';
import { useLanguage } from '../contexts/LanguageContext';
import JobCard from '../components/common/JobCard';
import CompanyCard from '../components/common/CompanyCard';
import SocialPost from '../components/common/SocialPost';
import postService from '../services/postService';
import { locations, industries } from '../data/mockData';
import heroBg from '../assets/hero-bg.png';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [socialFeed, setSocialFeed] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const navigate = useNavigate();
  const { getJobsWithCompany, allCompanies } = useJobs();
  const { t } = useLanguage();

  const featuredJobs = getJobsWithCompany().filter(j => j.isTop).slice(0, 4);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const response = await postService.getAll();
        setSocialFeed(response.data || []);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setSocialFeed([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    loadPosts();
  }, []);

  // Use isVerified as proxy for 'top' companies if isPremium is missing
  const topCompanies = (allCompanies || []).filter(c => c.isPremium || c.isVerified).slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedLocation) params.set('location', selectedLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const stats = [
    { icon: FiBriefcase, value: '10k+', label: 'Việc làm' },
    { icon: FiUsers, value: '5k+', label: 'Công ty' },
    { icon: FiTrendingUp, value: '50k+', label: 'Ứng viên' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Modern Premium Hero Banner */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-20 pb-20 overflow-hidden">
        {/* Background Image with Parallax-like fix */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-gray-50 dark:from-gray-950/40 dark:via-gray-950/80 dark:to-gray-950"></div>
        </div>

        {/* Animated Orbs */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary-500/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-primary-600 dark:text-primary-400 text-sm font-bold mb-8 shadow-xl shadow-black/5"
          >
            <FiZap className="w-4 h-4 text-yellow-500" />
            <span className="uppercase tracking-[0.2em] text-[11px]">{t('heroBadge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-8 leading-[0.9]"
          >
            {t('heroTitlePart1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">{t('heroTitlePart2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto font-medium"
          >
            {t('heroSubTitle')}
          </motion.p>

          {/* Premium Glass Search */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="w-full max-w-5xl mx-auto bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 flex flex-col md:flex-row gap-3"
          >
            <div className="flex-[2] relative group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder={t('heroSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-16 pr-6 bg-transparent text-gray-900 dark:text-white dark:placeholder-gray-500 text-lg font-medium focus:outline-none"
              />
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 my-auto hidden md:block"></div>
            <div className="flex-1 relative group">
              <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-primary-500 transition-colors" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-16 pl-16 pr-10 bg-transparent text-gray-900 dark:text-white dark:placeholder-gray-500 text-lg font-medium focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="dark:bg-gray-900">{t('location')}</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="dark:bg-gray-900">{loc}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-500 text-white h-16 px-10 rounded-3xl font-black text-lg shadow-2xl shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              {t('heroSearchButton')}
            </button>
          </motion.form>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-12 md:gap-24"
          >
            <div className="text-center group">
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">10k+</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-1">{t('statsJobs')}</p>
            </div>
            <div className="text-center group">
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">5k+</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-1">{t('statsCompanies')}</p>
            </div>
            <div className="text-center group">
              <p className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">50k+</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-1">{t('statsCandidates')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Corporate Trust Banner - Infinite Scroll */}
      <section className="bg-white dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 py-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] relative z-10">
            {t('trustedBy')}
          </p>

          <div className="relative w-full overflow-hidden">
            {/* Gradient Mask for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10"></div>

            <motion.div
              className="flex items-center gap-12 md:gap-24 whitespace-nowrap py-4"
              animate={{
                x: [-1000, 0], // Moving from left to right
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[
                "MICROSOFT", "GOOGLE", "AMAZON", "NETFLIX", "FACEBOOK", "APPLE", "SAMSUNG", "ADOBE", "INTEL", "TESLA",
                "MICROSOFT", "GOOGLE", "AMAZON", "NETFLIX", "FACEBOOK", "APPLE", "SAMSUNG", "ADOBE", "INTEL", "TESLA"
              ].map((brand, i) => (
                <span
                  key={i}
                  className="text-2xl md:text-3xl font-black text-gray-300 dark:text-gray-700 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-default select-none tracking-tighter"
                >
                  {brand}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Navigation & Filters (Sticky) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              {/* Menu */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">{t('discover')}</h3>
                <nav className="space-y-1">
                  <Link to="/jobs" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium">
                    <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FiBriefcase className="w-4 h-4" /></span>
                    {t('jobs')}
                  </Link>
                  <Link to="/companies" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium">
                    <span className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><FiUsers className="w-4 h-4" /></span>
                    {t('companies')}
                  </Link>
                  <Link to="/career-advice" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium">
                    <span className="p-1.5 bg-green-100 text-green-600 rounded-lg"><FiTrendingUp className="w-4 h-4" /></span>
                    {t('careerAdvice')}
                  </Link>
                </nav>
              </div>

              {/* Top Industries */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">{t('topIndustries')}</h3>
                <div className="space-y-2">
                  {industries.slice(0, 5).map(ind => (
                    <Link key={ind} to={`/jobs?industry=${encodeURIComponent(ind)}`} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors truncate">
                      # {ind}
                    </Link>
                  ))}
                </div>
                <Link to="/jobs" className="block mt-4 px-3 text-sm font-medium text-primary-600 hover:underline">{t('viewAll')}</Link>
              </div>
            </div>
          </div>

          {/* Main Feed Content */}
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiActivity className="text-primary-600" /> {t('recruitmentFeed')}
              </h2>
              <select className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-400 focus:outline-none cursor-pointer border-none p-0 outline-none">
                <option value="newest" className="dark:bg-gray-800">{t('newest')}</option>
                <option value="popular" className="dark:bg-gray-800">{t('mostPopular')}</option>
              </select>
            </div>

            <div className="space-y-6">
              {isLoadingPosts ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : socialFeed.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiActivity className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noPostsYet')}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t('noPostsYetDesc')}</p>
                </div>
              ) : (
                socialFeed.map((post) => (
                  <SocialPost key={post.postId} post={post} />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Suggestions (Sticky) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              {/* Suggested Jobs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('suggestedJobs')}</h3>
                  <Link to="/jobs" className="text-xs font-medium text-primary-600 hover:underline">{t('viewMore')}</Link>
                </div>
                <div className="space-y-4">
                  {featuredJobs.slice(0, 3).map(job => (
                    <JobCard key={job.id} job={job} variant="compact" showCompany={true} />
                  ))}
                </div>
              </div>

              {/* Top Companies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('topCompanies')}</h3>
                  <Link to="/companies" className="text-xs font-medium text-primary-600 hover:underline">{t('viewMore')}</Link>
                </div>
                <div className="space-y-3">
                  {topCompanies.slice(0, 3).map(company => (
                    <Link key={company.id} to={`/companies/${company.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{company.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{company.industry}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Promotional CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary-600 to-blue-700 p-12 lg:p-20 shadow-2xl shadow-primary-600/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                <FiStar className="w-3 h-3 text-yellow-400" />
                {t('promoBadge')}
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                {t('promoTitle')}
              </h2>
              <p className="text-xl text-white/80 font-medium max-w-lg">
                {t('promoSubTitle')}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-primary-600 font-black rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  {t('promoStartButton')}
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-primary-700/50 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 hover:bg-primary-700 transition-all"
                >
                  {t('promoLearnMore')}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: t('featSpeedTitle'), desc: t('featSpeedDesc'), icon: FiZap, color: 'bg-yellow-500' },
                { title: t('featSecurityTitle'), desc: t('featSecurityDesc'), icon: FiShield, color: 'bg-green-500' },
                { title: t('featConnectTitle'), desc: t('featConnectDesc'), icon: FiActivity, color: 'bg-blue-500' },
                { title: t('featReputationTitle'), desc: t('featReputationDesc'), icon: FiBriefcase, color: 'bg-primary-500' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl"
                >
                  <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-black/10`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-black mb-1">{feature.title}</h4>
                  <p className="text-white/60 text-xs font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mobile Bottom Nav Spacer */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
};

export default HomePage;
