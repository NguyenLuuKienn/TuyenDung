import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result && result.success && result.user) {
        toast.success(t('loginSuccess'));

        const userRole = result.user.role?.toLowerCase();

        if (userRole === 'employer') {
          const companyRequests = JSON.parse(localStorage.getItem('companyRequests') || '[]');
          const userRequest = companyRequests.find(r => r.requestedBy === result.user.id);

          if (!userRequest && !result.user.companyId) {
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate('/employer/company/create');
            return;
          } else if (userRequest?.status === 'pending') {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.info(t('pendingApproval') || 'Đơn đăng ký công ty của bạn đang chờ phê duyệt.');
            navigate('/employer/pending');
            return;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate(from);
        }
      } else {
        const msg = result?.error || t('loginFailed');
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || t('errorOccurred');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'nguyenluukienn@gmail.com', password: '902911aA', role: 'Admin' },
    { email: 'kdoan@gmail.com', password: '902911', role: 'Job Seeker' },
    { email: 'kein@gmail.com', password: '902911', role: 'Employer' }
  ];

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">SchneeJob</span>
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <h1 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-2 tracking-tighter">
            {t('loginTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
            {t('loginSubTitle')}
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl mb-6 border border-red-100 dark:border-red-900/50">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t('emailLabel')}
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t('passwordLabel')}
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-primary-600 transition-colors">{t('rememberMe')}</span>
              </label>
              <Link to="/forgot-password" title={t('forgotPassword')} className="text-sm text-primary-600 hover:text-primary-700 font-bold">
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? t('loggingIn') : t('loginTitle')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">hoặc</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-sm text-gray-700 dark:text-gray-300">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-sm text-gray-700 dark:text-gray-300">
              <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-4 h-4" />
              Facebook
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-gray-500 dark:text-gray-400 font-medium">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-black">
              {t('registerNow')}
            </Link>
          </p>
        </motion.div>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-white/50 rounded-xl">
          <p className="text-sm text-gray-600 mb-3 text-center">Tài khoản demo:</p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => fillDemo(account)}
                className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.email}</p>
                    <p className="text-xs text-gray-500">{account.role}</p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">Click để điền</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};

export default LoginPage;
