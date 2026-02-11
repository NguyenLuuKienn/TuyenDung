import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar,
  FiEdit2, FiSave, FiX, FiCamera, FiPlus, FiTrash2, FiGlobe,
  FiLinkedin, FiGithub, FiAward, FiBook, FiCheckCircle, FiHome
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import profileService from '../../services/profileService';
import { skills as allSkills, locations } from '../../data/mockData';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedSkills, setSelectedSkills] = useState(user?.skills || []);
  const [experiences, setExperiences] = useState(user?.experiences || [
    { company: '', position: '', from: '', to: '', current: false, description: '' }
  ]);
  const [educations, setEducations] = useState(user?.educations || [
    { school: '', degree: '', field: '', from: '', to: '' }
  ]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      bio: user?.bio || '',
      website: user?.website || '',
      linkedin: user?.linkedin || '',
      github: user?.github || ''
    }
  });

  // Load and sync profile data
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!user) return;
      try {
        const res = await profileService.getMyProfile();
        const data = res.data || {};

        const profileValues = {
          fullName: data.fullName || data.name || user.fullName || user.name || '',
          email: data.email || user.email || '',
          phone: data.phone || data.phoneNumber || user.phone || '',
          location: data.location || user.location || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : (user.dateOfBirth || ''),
          gender: data.gender || user.gender || '',
          bio: data.bio || data.summary || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || ''
        };

        if (!mounted) return;

        reset(profileValues);
        setSelectedSkills(data.skills || data.Skills || user?.skills || []);
        setExperiences(data.experiences || data.Experiences || user?.experiences || []);
        setEducations(data.educations || data.Educations || user?.educations || []);

        updateProfile({
          ...user,
          ...profileValues,
          skills: data.skills || [],
          experiences: data.experiences || [],
          educations: data.educations || [],
          avatar: data.avatarURL || user.avatar
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log('Profile not found - New user');
          // It's fine, we just stick to defaults
        } else {
          console.error('Failed to load profile:', err);
          toast.error('Không thể tải thông tin hồ sơ');
        }
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, [user]); // Re-run if user context changes

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', from: '', to: '', current: false, description: '' }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const addEducation = () => {
    setEducations([...educations, { school: '', degree: '', field: '', from: '', to: '' }]);
  };

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const newEducations = [...educations];
    newEducations[index][field] = value;
    setEducations(newEducations);
  };

  const onSubmit = async (data) => {
    try {
      // Map frontend data to backend model (JobSeekerProfile)
      // Note: FullName, Email, Phone are on User entity and might not be modifiable here depending on backend logic.
      // We focus on JobSeekerProfile fields.

      // Filter out invalid/empty entries
      const validEducations = educations
        .filter(e => e.school && e.school.trim() !== '')
        .map(e => ({
          EducationId: '00000000-0000-0000-0000-000000000000', // Default GUID
          ProfileId: user.id || user.userId, // Required by backend
          SchoolName: e.school.trim(),
          Degree: e.degree || '',
          FieldOfStudy: e.field || '',
          StartDate: e.from ? new Date(e.from).toISOString() : null,
          EndDate: e.to ? new Date(e.to).toISOString() : null,
          Description: ''
        }));

      const validExperiences = experiences
        .filter(e => e.company && e.company.trim() !== '' && e.position && e.position.trim() !== '')
        .map(e => ({
          ExperienceId: '00000000-0000-0000-0000-000000000000', // Default GUID
          ProfileId: user.id || user.userId, // Required by backend
          CompanyName: e.company.trim(),
          JobTitle: e.position.trim(),
          Description: e.description || '',
          StartDate: e.from ? new Date(e.from).toISOString() : null,
          EndDate: e.to ? new Date(e.to).toISOString() : null,
          Location: ''
        }));

      const apiPayload = {
        ProfileId: user.id || user.userId, // Explicitly set root ID too
        UserId: user.id || user.userId, // Add this explicit UserId
        Headline: data.title || 'Open to work',
        Summary: data.bio || '',
        Address: data.location || '',
        Gender: data.gender ? data.gender.substring(0, 10) : 'Khác', // DB column requires non-null
        DateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        Educations: validEducations,
        Experiences: validExperiences,
        JobSeekerSkills: []
      };

      console.log('Sending Profile Payload:', apiPayload);

      // Call API to save to backend
      const response = await profileService.createOrUpdate(apiPayload);

      if (response && response.status === 200) {
        // Update local context with the form data (optimistic update for UI)
        const updatedLocalUser = {
          ...user,
          ...data, // Updates fullName, phone, etc in local state
          skills: selectedSkills,
          experiences,
          educations
        };
        updateProfile(updatedLocalUser);
        toast.success('Cập nhật hồ sơ thành công');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        console.error('Validation Errors:', err.response.data.errors);
        const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
        toast.error('Lỗi dữ liệu:\n' + errorMessages);
      } else {
        toast.error('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedSkills(user?.skills || []);
    setExperiences(user?.experiences || []);
    setEducations(user?.educations || []);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: FiUser },
    { id: 'experience', label: 'Kinh nghiệm', icon: FiBriefcase },
    { id: 'education', label: 'Học vấn', icon: FiBook },
    { id: 'skills', label: 'Kỹ năng', icon: FiAward }
  ];

  const calculateCompletion = () => {
    let completed = 0;
    const fields = [
      user?.name, user?.email, user?.phone, user?.location,
      user?.title, user?.bio, user?.skills?.length > 0
    ];
    fields.forEach(field => { if (field) completed++; });
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      {/* Premium Header Background */}
      <div className="h-72 bg-gradient-to-r from-primary-800 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center pb-20">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors w-fit ml-8 md:ml-0">
            <FiHome />
            <span className="text-sm font-medium">Trang chủ</span>
          </Link>
          <h1 className="text-4xl font-bold text-white/95 tracking-tight ml-8 md:ml-0 drop-shadow-md">Hồ sơ của tôi</h1>
          <p className="text-white/80 ml-8 md:ml-0 mt-2 text-lg">Quản lý và cập nhật thông tin nghề nghiệp của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-primary-600 font-medium mb-4">{user?.title || 'Thêm chức danh'}</p>

                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FiMail className="text-primary-500" />
                    <span className="text-sm truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FiPhone className="text-primary-500" />
                    <span className="text-sm">{user?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <FiMapPin className="text-primary-500" />
                    <span className="text-sm">{user?.location || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="mt-8 w-full">
                  <div className="flex justify-between text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    <span>Hoàn thiện hồ sơ</span>
                    <span className="text-primary-600">{completionPercentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    />
                  </div>
                  {completionPercentage < 100 && (
                    <p className="text-xs text-gray-500 mt-2 text-left">
                      <FiCheckCircle className="inline mr-1" />
                      Cập nhật đầy đủ để tăng 80% cơ hội việc làm
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiGlobe className="text-primary-500" /> Mạng xã hội
              </h3>
              <div className="flex justify-center gap-4">
                {user?.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-primary-50 dark:hover:bg-gray-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <FiGlobe className="w-5 h-5" />
                  </a>
                )}
                {user?.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
                {user?.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full hover:bg-gray-200 hover:text-black transition-colors">
                    <FiGithub className="w-5 h-5" />
                  </a>
                )}
                {!user?.website && !user?.linkedin && !user?.github && (
                  <p className="text-gray-400 text-sm italic">Chưa liên kết mạng xã hội</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
              <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-lg hover:shadow-gray-900/20"
                    >
                      <FiEdit2 /> Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition shadow-lg hover:shadow-green-600/30"
                      >
                        <FiSave /> Lưu
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <AnimatePresence mode="wait">
                    {activeTab === 'info' && (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center"><FiUser /></span>
                            Thông tin cơ bản
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Họ và tên</label>
                              <input
                                {...register('fullName', { required: 'Vui lòng nhập' })}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                              />
                            </div>
                            <div className="form-group">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Ngày sinh</label>
                              <input
                                type="date"
                                {...register('dateOfBirth')}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                              />
                            </div>
                            <div className="form-group md:col-span-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Giới thiệu bản thân</label>
                              <textarea
                                {...register('bio')}
                                disabled={!isEditing}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                                placeholder="Mô tả ngắn về kinh nghiệm và mục tiêu nghề nghiệp của bạn..."
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><FiGlobe /></span>
                            Liên kết mạng xã hội
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiGlobe className="text-gray-400" />
                              </div>
                              <input
                                {...register('website')}
                                disabled={!isEditing}
                                placeholder="Website cá nhân"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLinkedin className="text-blue-600" />
                              </div>
                              <input
                                {...register('linkedin')}
                                disabled={!isEditing}
                                placeholder="LinkedIn URL"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiGithub className="text-gray-800" />
                              </div>
                              <input
                                {...register('github')}
                                disabled={!isEditing}
                                placeholder="GitHub URL"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isEditing ? 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-primary-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent dark:text-gray-300'} transition`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'experience' && (
                      <motion.div
                        key="experience"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {experiences.map((exp, index) => (
                          <div key={index} className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeExperience(index)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Công ty</label>
                                <input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                  disabled={!isEditing}
                                  className={`w-full font-semibold text-lg bg-transparent border-b ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:border-primary-500' : 'border-transparent'} focus:outline-none py-1 transition text-gray-900 dark:text-white`}
                                  placeholder="Tên công ty"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Vị trí</label>
                                <input
                                  value={exp.position}
                                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                  disabled={!isEditing}
                                  className={`w-full font-medium text-gray-800 dark:text-gray-200 bg-transparent border-b ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:border-primary-500' : 'border-transparent'} focus:outline-none py-1 transition`}
                                  placeholder="Chức danh"
                                />
                              </div>
                              <div className="md:col-span-2 flex gap-4">
                                <div className="flex-1">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Thời gian</label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="month"
                                      value={exp.from}
                                      onChange={(e) => updateExperience(index, 'from', e.target.value)}
                                      disabled={!isEditing}
                                      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-200 transition"
                                    />
                                    <span className="text-gray-400">→</span>
                                    <input
                                      type="month"
                                      value={exp.to}
                                      onChange={(e) => updateExperience(index, 'to', e.target.value)}
                                      disabled={!isEditing || exp.current}
                                      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-200 transition"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mô tả</label>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                  disabled={!isEditing}
                                  rows={3}
                                  className={`w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border ${isEditing ? 'border-gray-200 dark:border-gray-600 rounded-lg p-3' : 'border-transparent p-0'} transition`}
                                  placeholder="Mô tả công việc..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={addExperience}
                            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 font-medium hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition flex items-center justify-center gap-2"
                          >
                            <FiPlus /> Thêm kinh nghiệm
                          </button>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'education' && (
                      <motion.div
                        key="education"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {educations.map((edu, index) => (
                          <div key={index} className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl flex-shrink-0">
                                <FiBook />
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                  <input
                                    value={edu.school}
                                    onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full font-bold text-lg bg-transparent border-b ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:border-primary-500' : 'border-transparent'} focus:outline-none transition text-gray-900 dark:text-white`}
                                    placeholder="Tên trường học"
                                  />
                                </div>
                                <div>
                                  <input
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full text-gray-700 dark:text-gray-200 font-medium bg-transparent border-b ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:border-primary-500' : 'border-transparent'} focus:outline-none transition`}
                                    placeholder="Bằng cấp"
                                  />
                                </div>
                                <div>
                                  <input
                                    value={edu.field}
                                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                    disabled={!isEditing}
                                    className={`w-full text-gray-600 dark:text-gray-300 bg-transparent border-b ${isEditing ? 'border-gray-300 dark:border-gray-600 focus:border-primary-500' : 'border-transparent'} focus:outline-none transition`}
                                    placeholder="Chuyên ngành"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={addEducation}
                            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 font-medium hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition flex items-center justify-center gap-2"
                          >
                            <FiPlus /> Thêm học vấn
                          </button>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'skills' && (
                      <motion.div
                        key="skills"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><FiAward /></span>
                            Kỹ năng chuyên môn
                          </h3>

                          <div className="flex flex-wrap gap-3">
                            {selectedSkills.map(skill => (
                              <span
                                key={skill}
                                className="px-4 py-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-900/60 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm border border-primary-100 dark:border-primary-700"
                              >
                                {skill}
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    className="hover:text-primary-900 dark:hover:text-white bg-primary-200 dark:bg-primary-800 rounded-full p-0.5 transition"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            ))}
                            {selectedSkills.length === 0 && !isEditing && (
                              <p className="text-gray-400 italic">Chưa có kỹ năng nào</p>
                            )}
                          </div>

                          {isEditing && (
                            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Gợi ý kỹ năng</h4>
                              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                                {allSkills.map(skill => (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    disabled={selectedSkills.includes(skill)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedSkills.includes(skill)
                                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 hover:shadow-md'
                                      }`}
                                  >
                                    {skill}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
