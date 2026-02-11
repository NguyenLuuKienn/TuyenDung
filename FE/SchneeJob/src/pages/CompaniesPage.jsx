import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiUsers, FiFilter, FiBriefcase } from 'react-icons/fi';
import { useJobs } from '../contexts/JobContext';
import { useLanguage } from '../contexts/LanguageContext';
import CompanyCard from '../components/common/CompanyCard';
import { industries, locations } from '../data/mockData';

const CompaniesPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  const { allCompanies } = useJobs();

  // Filter companies
  let filteredCompanies = [...allCompanies];

  if (searchQuery) {
    filteredCompanies = filteredCompanies.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedIndustry) {
    filteredCompanies = filteredCompanies.filter(c => c.industry === selectedIndustry);
  }

  if (selectedLocation) {
    filteredCompanies = filteredCompanies.filter(c => c.locations.includes(selectedLocation));
  }

  // Sort: premium first, then by rating
  filteredCompanies.sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return b.rating - a.rating;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedIndustry) params.set('industry', selectedIndustry);
    if (selectedLocation) params.set('location', selectedLocation);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors pb-20">
      {/* Modern Header */}
      <div className="relative bg-white dark:bg-gray-800 pt-16 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            {t('companyHeaderTitle1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">{t('companyHeaderTitle2')}</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            {t('companyHeaderSubTitle')}
          </p>

          {/* Floating Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700 p-2 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-600 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t('companySearchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-600 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-shadow"
                />
              </div>
              <div className="relative md:w-1/4">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-600 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
                >
                  <option value="">{t('industry')}</option>
                  {industries.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                </select>
                <FiBriefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
              </div>
              <div className="relative md:w-1/4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-600 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
                >
                  <option value="">{t('location')}</option>
                  {locations.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                </select>
                <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
              </div>
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold h-12 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-600/30">
                {t('search')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="font-semibold text-gray-900 dark:text-white">{filteredCompanies.length}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{t('matchingCompanies')}</span>
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('noCompaniesFound')}</h3>
            <p className="text-gray-500 mt-2 dark:text-gray-400">{t('noCompaniesFoundDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
