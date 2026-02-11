import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiStar, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const CompanyCard = ({ company, variant = 'default' }) => {
  const getSizeLabel = (size) => {
    const sizes = {
      '1-50': '1-50 nhân sự',
      '50-200': '50-200 nhân sự',
      '200-500': '200-500 nhân sự',
      '500-1000': '500-1000 nhân sự',
      '1000-5000': '1k-5k nhân sự',
      '10000+': '10k+ nhân sự',
      '50000+': '50k+ nhân sự'
    };
    return sizes[size] || size;
  };

  // Defensive defaults
  const logoSrc = company?.logo || company?.logoURL || company?.LogoURL || '';
  const coverSrc = company?.coverImage || company?.coverImageURL || company?.CoverImageURL || '';
  const companyName = company?.name || company?.companyName || company?.CompanyName || 'Công ty';
  const industry = company?.industry || company?.Industry || '';
  const rating = company?.rating ?? company?.Rating ?? '—';
  const size = company?.size || company?.CompanySize || company?.companySize || '';
  const locations = Array.isArray(company?.locations) ? company.locations : (company?.location ? [company.location] : []);
  const locationLabel = locations.length > 0 ? locations[0] : 'Chưa cập nhật';
  const description = company?.description || company?.CompanyDescription || '';
  const reviewCount = company?.reviewCount ?? company?.ReviewCount ?? 0;

  if (variant === 'compact') {
    return (
      <Link to={`/companies/${company.id}`} className="block h-full">
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all h-full"
        >
          <img
            src={logoSrc}
            alt={companyName}
            className="w-14 h-14 rounded-lg object-cover border border-gray-100 dark:border-gray-700 bg-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors">{companyName}</h3>
              {company?.isVerified && (
                <FiCheckCircle className="text-blue-500 w-3.5 h-3.5" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{industry}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                <FiStar className="w-3 h-3 fill-current" /> {rating}
              </span>
              <span className="text-xs text-gray-400">({reviewCount} đánh giá)</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/companies/${company.id}`} className="block h-full group">
      <motion.div
        whileHover={{ y: -6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative"
      >
        {/* Cover Image */}
        <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400 via-gray-100 to-transparent"></div>
          )}

          {/* Overlay gradient for readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          {company.isPremium && (
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-yellow-500/20 uppercase tracking-wider backdrop-blur-sm">
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-12 relative flex-1 flex flex-col">
          {/* Logo - overlap positioning */}
          <div className="absolute -top-10 left-6">
            <img
              src={logoSrc}
              alt={companyName}
              className="w-20 h-20 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white dark:bg-gray-700 group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex justify-between items-start mb-2">
            <div className="pt-2"></div> {/* Spacer for logo */}
            {/* Rating Badge */}
            <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{rating}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">/5</span>
            </div>
          </div>

          {/* Company Name & Industry */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {companyName}
              </h3>
              {company?.isVerified && (
                <div className="shrink-0 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-full p-0.5">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{industry}</p>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-md">
              <FiMapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[120px]">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-md">
              <FiUsers className="w-4 h-4 text-gray-500" />
              <span>{getSizeLabel(size)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
            {description}
          </p>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {reviewCount > 0 ? `${reviewCount} đánh giá` : 'Chưa có đánh giá'}
            </span>
            <span className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Xem chi tiết <FiArrowRight />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CompanyCard;
