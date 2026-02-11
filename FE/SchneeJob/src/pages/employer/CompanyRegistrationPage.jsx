import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  FiHome, FiMapPin, FiGlobe, FiUsers, FiMail, FiPhone,
  FiFileText, FiCheck, FiAlertCircle, FiArrowLeft, FiUpload
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { locations, companySizes } from '../../data/mockData';
import { industriesService } from '../../services/masterDataService';
import api from '../../services/api';

const CompanyRegistrationPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      industry: '',
      size: '',
      location: '',
      address: '',
      website: '',
      email: '',
      phone: '',
      taxCode: '',
      description: '',
      reason: ''
    }
  });

  // Load industries from API on component mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setLoadingIndustries(true);
        const response = await industriesService.getAllIndustries();
        const data = response.data || response;
        // Transform API response format (industryId, industryName) to dropdown format (value, label)
        const formattedIndustries = (Array.isArray(data) ? data : []).map(ind => ({
          value: ind.industryId || ind.id,
          label: ind.industryName || ind.name
        }));
        setIndustries(formattedIndustries);
      } catch (error) {
        console.error('Failed to load industries:', error);
        // Fallback to empty or cached data
        setIndustries([]);
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFileToServer = async (file, folder = 'logos') => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const resp = await api.post(`/api/files/upload-logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return resp.data?.url || resp.data?.url;
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  };

  // Upload logo immediately after choosing
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // preview first
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    try {
      const url = await uploadFileToServer(file, 'logos');
      setUploadedLogoUrl(url);
    } catch (err) {
      toast.error('Tải logo lên thất bại');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
    try {
      const url = await uploadFileToServer(file, 'logos');
      setUploadedCoverUrl(url);
    } catch (err) {
      toast.error('Tải ảnh bìa lên thất bại');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Map form data to backend CompanyRegistration model
      const companyRequest = {
        companyName: data.name,
        industryId: parseInt(data.industry, 10) || 0, // Convert to int, backend model expects int
        website: data.website || '',
        address: data.address,
        companyPhoneNumber: data.phone,
        logoUrl: uploadedLogoUrl || null,
        coverImageUrl: uploadedCoverUrl || null,
        contactPersonEmail: user.email,
        contactPersonName: user.profile?.fullName || user.email,
        contactPersonPhoneNumber: user.profile?.phone || data.phone || '', // Use user's phone from profile
        adminNotes: '', // Empty notes for now, admin can fill later
      };

      console.log('[CompanyRegistration] Submitting:', companyRequest);

      // Gửi request tới backend API
      const response = await api.post('/api/companyregistrations', companyRequest);
      
      console.log('[CompanyRegistration] Success response:', response.data);
      
      // Cập nhật user với pending request
      if (updateUser) {
        updateUser({
          ...user,
          pendingCompanyRequest: response.data?.requestId || 'pending'
        });
      }

      toast.success('Đơn đăng ký công ty đã được gửi! Vui lòng chờ Admin xét duyệt.');
      reset(); // Reset form to clear old data
      navigate('/employer/pending');
    } catch (error) {
      console.error('[CompanyRegistration] Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        title: error.response?.data?.title,
        errors: error.response?.data?.errors,
        data: error.response?.data,
        error: error.message
      });
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        console.error('[CompanyRegistration] Validation Errors:\n', validationErrors);
        toast.error(`Lỗi: ${validationErrors}`);
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <FiArrowLeft className="w-5 h-5" />
            Về trang chủ
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký Công ty</h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin công ty để đăng ký tài khoản nhà tuyển dụng
          </p>
        </div>

        {/* Notice */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8"
        >
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Quy trình đăng ký</h3>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>1. Điền đầy đủ thông tin công ty</li>
                <li>2. Gửi đơn đăng ký và chờ Admin xét duyệt (1-3 ngày làm việc)</li>
                <li>3. Sau khi được duyệt, bạn có thể đăng tin tuyển dụng</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo công ty
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiUpload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="btn-secondary cursor-pointer inline-block"
                  >
                    Tải lên logo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 2MB</p>
                </div>
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa (cover)</label>
              <div className="flex items-center gap-4">
                <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiUpload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input id="cover-upload" type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  <label htmlFor="cover-upload" className="btn-secondary cursor-pointer inline-block">Tải lên ảnh bìa</label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 5MB</p>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name', { required: 'Vui lòng nhập tên công ty' })}
                  className="input-field pl-10"
                  placeholder="Công ty TNHH ABC"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Tax Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã số thuế <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('taxCode', { required: 'Vui lòng nhập mã số thuế' })}
                  className="input-field pl-10"
                  placeholder="0123456789"
                />
              </div>
              {errors.taxCode && (
                <p className="mt-1 text-sm text-red-500">{errors.taxCode.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngành nghề <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('industry', { required: 'Vui lòng chọn ngành nghề' })}
                  className="input-field"
                >
                  <option value="">Chọn ngành nghề</option>
                  {industries.map((ind, idx) => (
                    <option key={ind.value || idx} value={ind.value || ''}>{ind.label}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>
                )}
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quy mô công ty <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('size', { required: 'Vui lòng chọn quy mô' })}
                  className="input-field"
                >
                  <option value="">Chọn quy mô</option>
                  {companySizes.map((size, idx) => (
                    <option key={size || idx} value={size || ''}>{size}</option>
                  ))}
                </select>
                {errors.size && (
                  <p className="mt-1 text-sm text-red-500">{errors.size.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('location', { required: 'Vui lòng chọn địa điểm' })}
                  className="input-field"
                >
                  <option value="">Chọn địa điểm</option>
                  {locations.map((loc, idx) => (
                    <option key={loc || idx} value={loc || ''}>{loc}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
                    className="input-field pl-10"
                    placeholder="Số 123, Đường ABC"
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email công ty <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Vui lòng nhập email',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ'
                      }
                    })}
                    className="input-field pl-10"
                    placeholder="contact@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone', { required: 'Vui lòng nhập số điện thoại' })}
                    className="input-field pl-10"
                    placeholder="028 1234 5678"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  {...register('website')}
                  className="input-field pl-10"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới thiệu công ty <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description', { 
                  required: 'Vui lòng nhập giới thiệu công ty',
                  minLength: { value: 100, message: 'Giới thiệu phải có ít nhất 100 ký tự' }
                })}
                rows={4}
                className="input-field"
                placeholder="Mô tả về công ty, lĩnh vực hoạt động, văn hóa doanh nghiệp..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Reason for registration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do đăng ký <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('reason', { 
                  required: 'Vui lòng nhập lý do đăng ký',
                  minLength: { value: 50, message: 'Lý do phải có ít nhất 50 ký tự' }
                })}
                rows={3}
                className="input-field"
                placeholder="Nhu cầu tuyển dụng, số lượng vị trí cần tuyển, mục tiêu sử dụng nền tảng..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link
                to="/"
                className="btn-secondary flex-1 text-center"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    Gửi đơn đăng ký
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyRegistrationPage;
