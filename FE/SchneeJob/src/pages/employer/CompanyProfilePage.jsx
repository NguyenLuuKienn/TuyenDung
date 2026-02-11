import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  FiHome, FiMapPin, FiGlobe, FiUsers, FiMail, FiPhone,
  FiEdit2, FiSave, FiX, FiCamera, FiPlus, FiTrash2,
  FiFacebook, FiLinkedin, FiTwitter, FiInstagram
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import companyService from '../../services/companyService';
import api from '../../services/api';
import { industries as mockIndustries, locations, companySizes } from '../../data/mockData';
import { industriesService } from '../../services/masterDataService';

const CompanyProfilePage = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [industriesList, setIndustriesList] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  // Load company on mount
  useEffect(() => {
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        const response = await companyService.getMyCompany();
        const raw = response.data;
        // Map backend company model to frontend shape expected by this page
        const mapped = raw ? {
          id: raw.companyId || raw.CompanyId || null,
          name: raw.companyName || raw.CompanyName || '',
          industry: raw.industry?.industryName || raw.industry?.IndustryName || '',
          industryId: raw.industry?.industryId || raw.industryId || raw.industry?.IndustryId || null,
          size: raw.companySize || raw.CompanySize || '',
          location: raw.city || raw.City || (raw.country ? (raw.country || '') : ''),
          address: raw.address || raw.Address || '',
          website: raw.website || raw.Website || raw.websiteUrl || '',
          email: raw.companyEmail || raw.CompanyEmail || '',
          phone: raw.phoneNumber || raw.PhoneNumber || raw.phone || '',
          description: raw.companyDescription || raw.CompanyDescription || raw.description || '',
          benefits: raw.benefits || raw.Benefits || [],
          culture: raw.culture || raw.Culture || '',
          socialLinks: raw.socialLinks || raw.socialLinks || {
            facebook: raw.facebook || '',
            linkedin: raw.linkedin || '',
            twitter: raw.twitter || ''
          },
          banner: raw.coverImageURL || raw.CoverImageURL || raw.banner || '',
          logo: raw.logoURL || raw.LogoURL || raw.logo || '',
          images: raw.images || raw.Images || [],
          video: raw.video || raw.Video || null,
          isVerified: typeof raw.isVerified === 'boolean' ? raw.isVerified : (raw.isVerified || raw.IsVerified || false)
        } : null;
        setCompany(mapped);
      } catch (err) {
        console.error('Failed to load company:', err);
        toast.error('Không thể tải thông tin công ty');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadCompany();
    }
  }, [user]);

  // load industries for select (prefer API over mock)
  useEffect(() => {
    (async () => {
      try {
        setLoadingIndustries(true);
        const resp = await industriesService.getAllIndustries();
        const data = resp.data || resp;
        const formatted = (Array.isArray(data) ? data : []).map(i => ({ value: i.industryId || i.id, label: i.industryName || i.name }));
        setIndustriesList(formatted.length ? formatted : mockIndustries);
      } catch (err) {
        console.error('Failed to load industries for profile page:', err);
        setIndustriesList(mockIndustries);
      } finally {
        setLoadingIndustries(false);
      }
    })();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: company?.name || '',
      industry: company?.industryId || company?.industry || '',
      size: company?.size || '',
      location: company?.location || '',
      address: company?.address || '',
      website: company?.website || '',
      email: company?.email || '',
      phone: company?.phone || '',
      description: company?.description || '',
      benefits: company?.benefits?.join('\n') || '',
      culture: company?.culture || '',
      facebook: company?.socialLinks?.facebook || '',
      linkedin: company?.socialLinks?.linkedin || '',
      twitter: company?.socialLinks?.twitter || ''
    }
  });

  // When company data loads, reset the form values
  useEffect(() => {
    if (!company) return;
    reset({
      name: company.name || '',
      industry: company.industryId || company.industry || '',
      size: company.size || '',
      location: company.location || '',
      address: company.address || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      description: company.description || '',
      benefits: (company.benefits || []).join('\n'),
      culture: company.culture || '',
      facebook: company.socialLinks?.facebook || '',
      linkedin: company.socialLinks?.linkedin || '',
      twitter: company.socialLinks?.twitter || ''
    });
  }, [company, reset]);

  // file upload helper
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

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // preview while uploading
    const reader = new FileReader();
    reader.onloadend = () => setCompany(prev => ({ ...prev, logo: reader.result }));
    reader.readAsDataURL(file);
    try {
      const url = await uploadFileToServer(file, 'logos');
      setCompany(prev => ({ ...prev, logo: url }));
    } catch (err) {
      toast.error('Tải logo thất bại');
    }
  };

  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCompany(prev => ({ ...prev, banner: reader.result }));
    reader.readAsDataURL(file);
    try {
      const url = await uploadFileToServer(file, 'logos');
      setCompany(prev => ({ ...prev, banner: url }));
    } catch (err) {
      toast.error('Tải ảnh bìa thất bại');
    }
  };

  const onSubmit = (data) => {
    (async () => {
      try {
        const industryId = typeof data.industry === 'object'
          ? data.industry?.value
          : (data.industry ? parseInt(data.industry, 10) : (company?.industryId ?? null));

        const payload = {
          CompanyName: data.name || company?.name || '',
          IndustryId: industryId,
          // include Country (server treats non-nullable string as required)
          Country: data.country || company?.country || '',
          // include nested industry object to satisfy model validation that may require Industry
          industry: industryId ? { industryId: industryId, industryName: (industriesList.find(i => i.value === industryId) || {}).label || '' } : null,
          CompanySize: data.size || company?.size || '',
          City: data.location || company?.location || '',
          Address: data.address || company?.address || '',
          Website: data.website || company?.website || '',
          CompanyEmail: data.email || company?.email || '',
          PhoneNumber: data.phone || company?.phone || '',
          CompanyDescription: data.description || company?.description || '',
          Benefits: data.benefits ? data.benefits.split('\n').map(l => l.trim()).filter(Boolean) : (company?.benefits || []),
          Culture: data.culture || company?.culture || '',
          SocialLinks: {
            facebook: data.facebook,
            linkedin: data.linkedin,
            twitter: data.twitter
          },
          LogoURL: company?.logo || company?.logoUrl || '',
          CoverImageURL: company?.banner || company?.coverImage || ''
        };

        // Call backend to update company
        await companyService.updateMyCompany(payload);
        toast.success('Cập nhật thông tin công ty thành công');

        const resp = await companyService.getMyCompany();
        const raw = resp.data;
        // reuse mapping logic
        const mapped = raw ? {
          id: raw.companyId || raw.CompanyId || null,
          name: raw.companyName || raw.CompanyName || '',
          industry: raw.industry?.industryName || raw.industry?.IndustryName || '',
          industryId: raw.industry?.industryId || raw.industryId || raw.industry?.IndustryId || null,
          size: raw.companySize || raw.CompanySize || '',
          location: raw.city || raw.City || (raw.country ? (raw.country || '') : ''),
          address: raw.address || raw.Address || '',
          website: raw.website || raw.Website || raw.websiteUrl || '',
          email: raw.companyEmail || raw.CompanyEmail || '',
          phone: raw.phoneNumber || raw.PhoneNumber || raw.phone || '',
          description: raw.companyDescription || raw.CompanyDescription || raw.description || '',
          benefits: raw.benefits || raw.Benefits || [],
          culture: raw.culture || raw.Culture || '',
          socialLinks: raw.socialLinks || raw.socialLinks || {
            facebook: raw.facebook || '',
            linkedin: raw.linkedin || '',
            twitter: raw.twitter || ''
          },
          banner: raw.coverImageURL || raw.CoverImageURL || raw.banner || '',
          logo: raw.logoURL || raw.LogoURL || raw.logo || '',
          images: raw.images || raw.Images || [],
          video: raw.video || raw.Video || null,
          isVerified: typeof raw.isVerified === 'boolean' ? raw.isVerified : (raw.isVerified || raw.IsVerified || false)
        } : null;
        setCompany(mapped);
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to update company:', err);
        // if server returned validation errors, show them
        if (err?.response?.data?.errors) {
          console.error('Validation errors:', err.response.data.errors);
          toast.error('Dữ liệu không hợp lệ: kiểm tra các trường nhập.');
        } else {
          toast.error('Cập nhật thất bại. Vui lòng thử lại.');
        }
      }
    })();
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản' },
    { id: 'about', label: 'Giới thiệu' },
    { id: 'benefits', label: 'Phúc lợi & Văn hóa' },
    { id: 'media', label: 'Hình ảnh' }
  ];

  const companySizes = [
    '1-10 nhân viên',
    '11-50 nhân viên',
    '51-200 nhân viên',
    '201-500 nhân viên',
    '501-1000 nhân viên',
    '1000+ nhân viên'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ công ty</h1>
          <p className="text-gray-600">Quản lý thông tin và hình ảnh công ty của bạn</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <FiEdit2 className="w-5 h-5" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <FiX className="w-5 h-5" />
              Hủy
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>

      {/* Company Banner & Logo */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-700">
          {company?.banner && (
            <img 
              src={company.banner} 
              alt="Company banner" 
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <>
              <input id="company-banner-upload" type="file" accept="image/*" onChange={handleBannerFileChange} className="hidden" />
              <label htmlFor="company-banner-upload" className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                <FiCamera className="w-5 h-5 text-gray-700" />
              </label>
            </>
          )}
        </div>

        {/* Logo & Basic Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <FiHome className="w-10 h-10 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <>
                  <input id="company-logo-upload" type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                  <label htmlFor="company-logo-upload" className="absolute -bottom-1 -right-1 bg-primary-600 p-1.5 rounded-full text-white hover:bg-primary-700 cursor-pointer">
                    <FiCamera className="w-4 h-4" />
                  </label>
                </>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{company?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {company?.location}
                </span>
                <span className="flex items-center gap-1">
                  <FiUsers className="w-4 h-4" />
                  {company?.size}
                </span>
                {company?.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:underline"
                  >
                    <FiGlobe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {company?.isVerified ? 'Đã xác thực' : 'Chờ xác thực'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'info' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Vui lòng nhập tên công ty' })}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngành nghề <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('industry', { required: 'Vui lòng chọn ngành nghề' })}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Chọn ngành nghề</option>
                    {industriesList.map(ind => {
                      if (!ind) return null;
                      if (typeof ind === 'string') return <option key={ind} value={ind}>{ind}</option>;
                      return <option key={ind.value} value={ind.value}>{ind.label}</option>;
                    })}
                  </select>
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quy mô công ty
                  </label>
                  <select
                    {...register('size')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Chọn quy mô</option>
                    {companySizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm
                  </label>
                  <select
                    {...register('location')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Chọn địa điểm</option>
                    {locations.map(loc => {
                      if (typeof loc === 'string') return <option key={loc} value={loc}>{loc}</option>;
                      return <option key={loc.value} value={loc.value}>{loc.label}</option>;
                    })}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Số nhà, tên đường, quận/huyện..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mạng xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input
                      type="url"
                      {...register('facebook')}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="relative">
                    <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                    <input
                      type="url"
                      {...register('linkedin')}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="relative">
                    <FiTwitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-500" />
                    <input
                      type="url"
                      {...register('twitter')}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Twitter URL"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới thiệu công ty
                </label>
                <textarea
                  {...register('description')}
                  disabled={!isEditing}
                  rows={8}
                  className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Mô tả về công ty, lịch sử hình thành, tầm nhìn, sứ mệnh..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Viết mô tả chi tiết để thu hút ứng viên tiềm năng
                </p>
              </div>

              {!isEditing && company?.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Benefits & Culture Tab */}
          {activeTab === 'benefits' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phúc lợi nhân viên
                </label>
                <textarea
                  {...register('benefits')}
                  disabled={!isEditing}
                  rows={6}
                  className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Mỗi phúc lợi một dòng. VD:&#10;- Bảo hiểm sức khỏe cao cấp&#10;- Thưởng dự án&#10;- Du lịch hàng năm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Mỗi phúc lợi viết trên một dòng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Văn hóa công ty
                </label>
                <textarea
                  {...register('culture')}
                  disabled={!isEditing}
                  rows={6}
                  className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Mô tả văn hóa, môi trường làm việc của công ty..."
                />
              </div>

              {!isEditing && company?.benefits && company.benefits.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Phúc lợi hiện tại</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Hình ảnh công ty</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {company?.images?.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img 
                        src={image} 
                        alt={`Company ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      type="button"
                      className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-colors"
                    >
                      <FiPlus className="w-8 h-8 mb-2" />
                      <span className="text-sm">Thêm ảnh</span>
                    </button>
                  )}
                </div>
                {(!company?.images || company.images.length === 0) && !isEditing && (
                  <p className="text-center text-gray-500 py-8">Chưa có hình ảnh nào</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Video giới thiệu</h4>
                {company?.video ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                      src={company.video}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                    {isEditing ? (
                      <>
                        <FiPlus className="w-8 h-8 mb-2" />
                        <span className="text-sm">Thêm video YouTube</span>
                      </>
                    ) : (
                      <span className="text-sm">Chưa có video</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
