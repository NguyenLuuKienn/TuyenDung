import { Link } from 'react-router-dom';
import { FiFacebook, FiLinkedin, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const footerLinks = {
    jobSeekers: [
      { to: '/jobs', label: t('findJobs') },
      { to: '/companies', label: t('companyList') },
      { to: '/resume-builder', label: t('createCV') },
      { to: '/career-advice', label: t('careerAdvice') }
    ],
    employers: [
      { to: '/employer/post-job', label: t('postJobNow') },
      { to: '/employer/pricing', label: t('pricing') },
      { to: '/employer/search-cv', label: t('searchCV') },
      { to: '/employer/solutions', label: t('recruitmentSolutions') }
    ],
    about: [
      { to: '/about', label: t('footerAbout') },
      { to: '/contact', label: t('contactUs') },
      { to: '/blog', label: t('blog') },
      { to: '/faq', label: t('faq') }
    ],
    legal: [
      { to: '/privacy', label: t('privacyPolicy') },
      { to: '/terms', label: t('termsOfService') },
      { to: '/cookies', label: t('cookiePolicy') }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300 dark:border-t dark:border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">SchneeJob</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t('footerDesc')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-primary-500" />
                <span className="text-sm">contact@schneejob.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-primary-500" />
                <span className="text-sm">1900 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-primary-500" />
                <span className="text-sm">Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-6">{t('footerJobSeekers')}</h3>
            <ul className="space-y-4">
              {footerLinks.jobSeekers.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-6">{t('footerEmployers')}</h3>
            <ul className="space-y-4">
              {footerLinks.employers.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-xs mb-6">{t('footerAbout')}</h3>
            <ul className="space-y-4">
              {footerLinks.about.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} SchneeJob. {t('allRightsReserved')}.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              {footerLinks.legal.map((link, index) => (
                <span key={link.to} className="flex items-center gap-4">
                  <Link
                    to={link.to}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-gray-600">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
