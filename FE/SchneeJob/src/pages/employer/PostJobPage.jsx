import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiUsers,
  FiCalendar, FiFileText, FiCheck, FiAlertCircle, FiX, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import companyService from '../../services/companyService';
import { industries as mockIndustries, skills as mockSkills, locations as mockLocations, jobLevels as mockJobLevels, jobTypes as mockJobTypes, workModes as mockWorkModes } from '../../data/mockData';
import { industriesService, skillService, educationLevelService } from '../../services/masterDataService';

const PostJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createJob } = useJobs();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [industriesList, setIndustriesList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [modesList, setModesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [benefits, setBenefits] = useState(['']);
  const [myCompany, setMyCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's company
  useEffect(() => {
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        const response = await companyService.getMyCompany();
        setMyCompany(response.data);
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

  // Load master data (industries, levels, types, work modes, locations, skills)
  useEffect(() => {
    (async () => {
      try {
        // industries from API, fallback to mock
        try {
          const resp = await industriesService.getAllIndustries();
          const data = resp.data || resp;
          const formatted = Array.isArray(data)
            ? data.map(i => ({ value: i.industryId ?? i.id ?? i.IndustryId, label: i.industryName ?? i.name ?? i.industryName }))
            : [];
          setIndustriesList(formatted.length ? formatted : mockIndustries.map(i => (typeof i === 'string' ? { value: i, label: i } : i)));
        } catch (e) {
          setIndustriesList(mockIndustries.map(i => (typeof i === 'string' ? { value: i, label: i } : i)));
        }

        // education levels -> job levels fallback
        try {
          const resp2 = await educationLevelService.getAllEducationLevels();
          const data2 = resp2.data || resp2;
          setLevelsList(Array.isArray(data2) ? data2.map(l => ({ value: l.educationLevelId ?? l.id ?? l.levelId ?? l.value, label: l.name ?? l.educationLevelName ?? l.levelName })) : mockJobLevels.map(l => ({ value: l, label: l })));
        } catch (e) {
          setLevelsList(mockJobLevels.map(l => ({ value: l, label: l })));
        }

        // job types, work modes, locations, skills from mock or API where available
        setTypesList(mockJobTypes.map(t => (typeof t === 'string' ? { value: t, label: t } : t)));
        setModesList(mockWorkModes.map(m => (typeof m === 'string' ? { value: m, label: m } : m)));
        setLocationsList(mockLocations.map(l => (typeof l === 'string' ? { value: l, label: l } : l)));

        try {
          const resp3 = await skillService.getAllSkills();
          const data3 = resp3.data || resp3;
          setSkillsList(Array.isArray(data3) ? data3.map(s => ({ value: s.skillId ?? s.id, label: s.skillName ?? s.name })) : mockSkills.map(s => ({ value: s, label: s })));
        } catch (e) {
          setSkillsList(mockSkills.map(s => ({ value: s, label: s })));
        }
      } catch (err) {
        console.error('Failed to load master data for post job page', err);
      }
    })();
  }, []);

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    defaultValues: {
      title: '',
      industry: '',
      level: '',
      type: '',
      workMode: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      salaryNegotiable: false,
      experience: '',
      positions: 1,
      deadline: '',
      description: '',
      requirements: '',
      isTop: false,
      isUrgent: false
    }
  });

  const watchSalaryNegotiable = watch('salaryNegotiable');

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index, value) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['title', 'industry', 'level', 'type', 'workMode', 'location'];
    } else if (step === 2) {
      fieldsToValidate = ['experience', 'positions', 'deadline'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data) => {
    // Build payload matching backend `Job` model
    // resolve CompanyId and JobSkills to primitive/IDs only
    const resolvedCompanyId = myCompany?.companyId || user?.companyId || null;

    const resolvedSkills = (selectedSkills || []).map(s => {
      // try to resolve to an ID from skillsList
      const found = (skillsList || []).find(it => String(it.value) === String(s) || it.label === s);
      return { SkillId: found ? String(found.value) : String(s) };
    });

    const payload = {
      JobTitle: data.title,
      JobDescription: data.description,
      JobRequirements: data.requirements,
      SalaryMin: data.salaryNegotiable ? null : (data.salaryMin ? parseFloat(data.salaryMin) : null),
      SalaryMax: data.salaryNegotiable ? null : (data.salaryMax ? parseFloat(data.salaryMax) : null),
      SalaryType: data.salaryNegotiable ? 'Negotiable' : 'Range',
      Location: data.location,
      JobLevel: data.level,
      EmploymentType: data.type,
      Deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      IsPriority: !!data.isTop,
      CompanyId: resolvedCompanyId,
      // JobSkills expects array of objects with SkillId
      JobSkills: resolvedSkills,
    };

    (async () => {
      const ok = await createJob(payload);
      if (ok) {
        toast.success('Đăng tin tuyển dụng thành công! Tin đang chờ phê duyệt.');
        navigate('/employer/jobs');
      } else {
        toast.error('Đăng tin thất bại. Vui lòng thử lại.');
      }
    })();
  };

  const steps = [
    { number: 1, title: 'Thông tin cơ bản' },
    { number: 2, title: 'Yêu cầu & Quyền lợi' },
    { number: 3, title: 'Mô tả chi tiết' },
    { number: 4, title: 'Xem lại & Đăng' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng</h1>
        <p className="text-gray-600">Tạo tin tuyển dụng mới để thu hút ứng viên tiềm năng</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= s.number 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.number ? <FiCheck className="w-5 h-5" /> : s.number}
              </div>
              <span className={`ml-2 hidden sm:block ${
                step >= s.number ? 'text-primary-600 font-medium' : 'text-gray-500'
              }`}>
                {s.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-1 mx-2 rounded ${
                  step > s.number ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-primary-600" />
                Thông tin cơ bản
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Vui lòng nhập tiêu đề công việc' })}
                  className="input-field"
                  placeholder="VD: Senior Frontend Developer"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngành nghề <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('industry', { required: 'Vui lòng chọn ngành nghề' })}
                    className="input-field"
                  >
                    <option value="">Chọn ngành nghề</option>
                    {industriesList.map(industry => (
                      <option key={industry.value} value={industry.value}>{industry.label}</option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cấp bậc <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('level', { required: 'Vui lòng chọn cấp bậc' })}
                    className="input-field"
                  >
                    <option value="">Chọn cấp bậc</option>
                    {levelsList.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                  {errors.level && (
                    <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại hình <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('type', { required: 'Vui lòng chọn loại hình' })}
                    className="input-field"
                  >
                    <option value="">Chọn loại hình</option>
                    {typesList.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình thức làm việc <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('workMode', { required: 'Vui lòng chọn hình thức làm việc' })}
                    className="input-field"
                  >
                    <option value="">Chọn hình thức</option>
                    {modesList.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                  {errors.workMode && (
                    <p className="mt-1 text-sm text-red-500">{errors.workMode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm làm việc <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('location', { required: 'Vui lòng chọn địa điểm' })}
                  className="input-field"
                >
                  <option value="">Chọn địa điểm</option>
                  {locationsList.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Requirements & Benefits */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-primary-600" />
                Yêu cầu & Quyền lợi
              </h2>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức lương
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('salaryNegotiable')}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">Thỏa thuận</span>
                  </label>
                </div>
                {!watchSalaryNegotiable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        {...register('salaryMin')}
                        className="input-field"
                        placeholder="Từ (triệu VNĐ)"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        {...register('salaryMax')}
                        className="input-field"
                        placeholder="Đến (triệu VNĐ)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinh nghiệm <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('experience', { required: 'Vui lòng chọn yêu cầu kinh nghiệm' })}
                    className="input-field"
                  >
                    <option value="">Chọn kinh nghiệm</option>
                    <option value="Không yêu cầu">Không yêu cầu</option>
                    <option value="Dưới 1 năm">Dưới 1 năm</option>
                    <option value="1-2 năm">1-2 năm</option>
                    <option value="2-3 năm">2-3 năm</option>
                    <option value="3-5 năm">3-5 năm</option>
                    <option value="5-10 năm">5-10 năm</option>
                    <option value="Trên 10 năm">Trên 10 năm</option>
                  </select>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-500">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng tuyển <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('positions', { required: 'Vui lòng nhập số lượng', min: 1 })}
                    className="input-field"
                  />
                  {errors.positions && (
                    <p className="mt-1 text-sm text-red-500">{errors.positions.message}</p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn nộp hồ sơ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('deadline', { required: 'Vui lòng chọn hạn nộp hồ sơ' })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-500">{errors.deadline.message}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kỹ năng yêu cầu
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {(skillsList || mockSkills || []).slice(0, 30).map(item => {
                    const skillValue = typeof item === 'string' ? item : (item.value ?? item.skillId ?? item.id);
                    const skillLabel = typeof item === 'string' ? item : (item.label ?? item.skillName ?? item.name);
                    return (
                      <button
                        key={skillValue}
                        type="button"
                        onClick={() => handleSkillToggle(skillValue)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedSkills.includes(skillValue)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skillLabel}
                      </button>
                    );
                  })}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Đã chọn: {selectedSkills.join(', ')}
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phúc lợi
                </label>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="VD: Bảo hiểm sức khỏe cao cấp"
                      />
                      {benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <FiPlus className="w-4 h-4" />
                    Thêm phúc lợi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-primary-600" />
                Mô tả chi tiết
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', { required: 'Vui lòng nhập mô tả công việc' })}
                  rows={6}
                  className="input-field"
                  placeholder="Mô tả chi tiết về công việc, nhiệm vụ, trách nhiệm..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu ứng viên <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('requirements', { required: 'Vui lòng nhập yêu cầu ứng viên' })}
                  rows={6}
                  className="input-field"
                  placeholder="Yêu cầu về bằng cấp, kỹ năng, kinh nghiệm..."
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-500">{errors.requirements.message}</p>
                )}
              </div>

              {/* Options */}
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    {...register('isTop')}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Tin nổi bật</span>
                    <p className="text-sm text-gray-500">Hiển thị ưu tiên trong danh sách</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    {...register('isUrgent')}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Tuyển gấp</span>
                    <p className="text-sm text-gray-500">Hiển thị nhãn tuyển gấp</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiCheck className="w-5 h-5 text-primary-600" />
                Xem lại thông tin
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  {myCompany?.logo && (
                    <img src={myCompany.logo} alt={myCompany.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{watch('title') || 'Chưa có tiêu đề'}</h3>
                    <p className="text-gray-600">{myCompany?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Ngành nghề</p>
                    <p className="font-medium">{watch('industry') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cấp bậc</p>
                    <p className="font-medium">{watch('level') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loại hình</p>
                    <p className="font-medium">{watch('type') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hình thức</p>
                    <p className="font-medium">{watch('workMode') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-medium">{watch('location') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mức lương</p>
                    <p className="font-medium">
                      {watch('salaryNegotiable') 
                        ? 'Thỏa thuận' 
                        : `${watch('salaryMin') || '?'} - ${watch('salaryMax') || '?'} triệu`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kinh nghiệm</p>
                    <p className="font-medium">{watch('experience') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số lượng</p>
                    <p className="font-medium">{watch('positions') || 1} người</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hạn nộp</p>
                    <p className="font-medium">{watch('deadline') || '-'}</p>
                  </div>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Kỹ năng yêu cầu</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {benefits.filter(b => b.trim()).length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Phúc lợi</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {benefits.filter(b => b.trim()).map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(watch('isTop') || watch('isUrgent')) && (
                  <div className="pt-4 border-t border-gray-200 flex gap-2">
                    {watch('isTop') && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        Tin nổi bật
                      </span>
                    )}
                    {watch('isUrgent') && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        Tuyển gấp
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Lưu ý</p>
                  <p className="text-sm text-yellow-700">
                    Tin tuyển dụng sẽ được kiểm duyệt trước khi hiển thị. Quá trình kiểm duyệt thường mất 1-2 giờ làm việc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
              >
                Đăng tin tuyển dụng
              </button>
            )}
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default PostJobPage;
