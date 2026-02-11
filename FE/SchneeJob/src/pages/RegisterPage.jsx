import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiAlertCircle, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { registerJobSeeker, registerEmployer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('confirmPasswordError') || 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordLengthError') || 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!formData.agreeTerms) {
      setError(t('agreeTermsError') || 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (formData.role === 'employer') {
        result = await registerEmployer({
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          password: formData.password,
          companyName: '' // Will be created later
        });
      } else {
        result = await registerJobSeeker({
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          password: formData.password
        });
      }

      if (result && result.success) {
        if (formData.role === 'employer') {
          toast.success(t('registerSuccessEmployer'));
          await new Promise(resolve => setTimeout(resolve, 500));
          localStorage.setItem('newEmployerEmail', formData.email);
          navigate('/employer/company/create');
        } else {
          toast.success(t('registerSuccessJobseeker'));
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate('/login');
        }
      } else {
        const errorMsg = result?.error || t('registerFailed') || 'Đăng ký thất bại. Vui lòng thử lại.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || t('errorOccurred');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
            {t('registerTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
            {t('registerSubTitle')}
          </p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'jobseeker' })}
              className={`p-4 rounded-2xl border-2 transition-all text-left group ${formData.role === 'jobseeker'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-900/50'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${formData.role === 'jobseeker' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                <FiUser className="w-6 h-6" />
              </div>
              <p className={`font-bold text-sm ${formData.role === 'jobseeker' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                {t('jobseekerRole')}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-tight">
                {t('jobseekerDesc')}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'employer' })}
              className={`p-4 rounded-2xl border-2 transition-all text-left group ${formData.role === 'employer'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-900/50'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${formData.role === 'employer' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                <FiBriefcase className="w-6 h-6" />
              </div>
              <p className={`font-bold text-sm ${formData.role === 'employer' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                {t('employerRole')}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-tight">
                {t('employerDesc')}
              </p>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl mb-6 border border-red-100 dark:border-red-900/50">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {t('fullNameLabel')}
              </label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t('emailLabel')}
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t('phoneNumberLabel')}
                </label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t('passwordLabel')}
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 dark:bg-gray-700 dark:text-white border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group px-1 pt-2">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed group-hover:text-primary-600 transition-colors">
                {t('agreeTermsPart1')}{' '}
                <Link to="/terms" className="text-primary-600 hover:underline font-bold">
                  {t('privacyPolicy')}
                </Link>{' '}
                {t('agreeTermsPart2')}{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline font-bold">
                  {t('termsOfService')}
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isLoading ? t('registering') : t('registerTitle')}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-gray-500 dark:text-gray-400 font-medium">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-black">
              {t('loginNow')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
