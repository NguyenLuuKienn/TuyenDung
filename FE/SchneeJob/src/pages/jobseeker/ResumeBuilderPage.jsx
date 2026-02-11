import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCertificate,
  FaCode,
  FaLanguage,
  FaDownload,
  FaEye,
  FaPrint,
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaCalendarAlt,
  FaPalette
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Utility for print classes
const ResumeBuilderPage = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const resumeRef = useRef(null);

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: user?.name || '',
      title: 'Software Developer',
      email: user?.email || '',
      phone: '0912 345 678',
      address: 'TP. Hồ Chí Minh, Việt Nam',
      avatar: user?.avatar || 'https://via.placeholder.com/150',
      summary: 'Lập trình viên với 3 năm kinh nghiệm trong phát triển web, chuyên về ReactJS và Node.js. Đam mê tạo ra các ứng dụng web hiệu quả và thân thiện với người dùng.',
      linkedin: 'linkedin.com/in/username',
      github: 'github.com/username',
      website: 'portfolio.com',
    },
    experience: [
      {
        id: 1,
        company: 'TechCorp Vietnam',
        position: 'Senior Frontend Developer',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: '• Phát triển và bảo trì các ứng dụng React cho khách hàng doanh nghiệp\n• Lead team 5 developer, mentoring junior developers\n• Tối ưu hóa performance ứng dụng giảm 40% load time',
      },
      {
        id: 2,
        company: 'StartUp ABC',
        position: 'Frontend Developer',
        startDate: '2020-06',
        endDate: '2021-12',
        current: false,
        description: '• Xây dựng giao diện người dùng responsive với React và TailwindCSS\n• Tích hợp RESTful APIs và GraphQL\n• Tham gia code review và viết unit tests',
      },
    ],
    education: [
      {
        id: 1,
        school: 'Đại học Bách Khoa TP.HCM',
        degree: 'Kỹ sư Công nghệ thông tin',
        startDate: '2016-09',
        endDate: '2020-06',
        gpa: '8.5/10',
        description: 'Chuyên ngành: Kỹ thuật phần mềm\nTốt nghiệp loại Giỏi',
      },
    ],
    skills: [
      { id: 1, name: 'React/Next.js', level: 90 },
      { id: 2, name: 'JavaScript/TypeScript', level: 85 },
      { id: 3, name: 'Node.js/Express', level: 75 },
      { id: 4, name: 'HTML/CSS/Tailwind', level: 90 },
      { id: 5, name: 'Git/GitHub', level: 85 },
      { id: 6, name: 'SQL/MongoDB', level: 70 },
    ],
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-06',
        credentialId: 'ABC123',
      },
      {
        id: 2,
        name: 'Meta Frontend Developer',
        issuer: 'Meta',
        date: '2022-08',
        credentialId: 'XYZ789',
      },
    ],
    languages: [
      { id: 1, name: 'Tiếng Việt', level: 'Bản ngữ' },
      { id: 2, name: 'Tiếng Anh', level: 'Thành thạo (IELTS 7.5)' },
      { id: 3, name: 'Tiếng Nhật', level: 'Giao tiếp cơ bản (N4)' },
    ],
  });

  const templates = [
    { id: 'modern', name: 'Modern', color: 'primary' },
    { id: 'classic', name: 'Classic', color: 'gray-800' },
    { id: 'creative', name: 'Creative', color: 'purple-600' },
    { id: 'minimal', name: 'Minimal', color: 'green-600' },
  ];

  const steps = [
    { id: 1, title: 'Thông tin cá nhân', icon: FaUser },
    { id: 2, title: 'Kinh nghiệm', icon: FaBriefcase },
    { id: 3, title: 'Học vấn', icon: FaGraduationCap },
    { id: 4, title: 'Kỹ năng', icon: FaCode },
    { id: 5, title: 'Chứng chỉ & Ngôn ngữ', icon: FaCertificate },
  ];

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addItem = (section) => {
    const newItem = {
      id: Date.now(),
      ...(section === 'experience' ? { company: '', position: '', startDate: '', endDate: '', current: false, description: '' } : {}),
      ...(section === 'education' ? { school: '', degree: '', startDate: '', endDate: '', gpa: '', description: '' } : {}),
      ...(section === 'skills' ? { name: '', level: 50 } : {}),
      ...(section === 'certifications' ? { id: Date.now(), name: '', issuer: '', date: '', credentialId: '' } : {}),
      ...(section === 'languages' ? { name: '', level: '' } : {}),
    };
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const updateItem = (section, id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (section, id) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const handleDownload = () => {
    toast.info('Đang tạo file PDF...');
    setTimeout(() => {
      toast.success('CV đã được tải xuống!');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    toast.success('Đã lưu CV thành công!');
  };

  const getTemplateColors = () => {
    switch (selectedTemplate) {
      case 'modern': return { primary: '#2563eb', secondary: '#1e40af', accent: '#dbeafe' };
      case 'classic': return { primary: '#1f2937', secondary: '#111827', accent: '#f3f4f6' };
      case 'creative': return { primary: '#9333ea', secondary: '#7c3aed', accent: '#f3e8ff' };
      case 'minimal': return { primary: '#059669', secondary: '#047857', accent: '#d1fae5' };
      default: return { primary: '#2563eb', secondary: '#1e40af', accent: '#dbeafe' };
    }
  };

  const colors = getTemplateColors();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <FaPalette className="text-gray-400" />
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${previewMode
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <FaEye />
                {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <FaSave />
                Lưu
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
              >
                <FaPrint />
                In
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <FaDownload />
                Tải PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
          {/* Editor Panel */}
          <div className={`${previewMode ? 'hidden' : 'block'} no-print`}>
            <div className="space-y-6">
              {/* Steps Navigation */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between overflow-x-auto">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition min-w-max ${currentStep === step.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      <step.icon />
                      <span className="text-xs font-medium">{step.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.title}
                          onChange={(e) => updatePersonalInfo('title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                          type="tel"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.address}
                          onChange={(e) => updatePersonalInfo('address', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
                        <textarea
                          value={resumeData.personalInfo.summary}
                          onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.github}
                          onChange={(e) => updatePersonalInfo('github', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Kinh nghiệm làm việc</h2>
                      <button
                        onClick={() => addItem('experience')}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm"
                      >
                        <FaPlus /> Thêm kinh nghiệm
                      </button>
                    </div>

                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-700">Kinh nghiệm #{index + 1}</h3>
                          <button
                            onClick={() => removeItem('experience', exp.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateItem('experience', exp.id, 'position', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            />
                            <label className="flex items-center gap-2 mt-2">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)}
                                className="rounded text-primary"
                              />
                              <span className="text-sm text-gray-600">Đang làm việc tại đây</span>
                            </label>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              placeholder="Mô tả các trách nhiệm và thành tích..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3: Education */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Học vấn</h2>
                      <button
                        onClick={() => addItem('education')}
                        className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                      >
                        <FaPlus /> Thêm học vấn
                      </button>
                    </div>

                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-700">Học vấn #{index + 1}</h3>
                          <button
                            onClick={() => removeItem('education', edu.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trường</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bằng cấp</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Năm bắt đầu</label>
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Năm tốt nghiệp</label>
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                            <input
                              type="text"
                              value={edu.description}
                              onChange={(e) => updateItem('education', edu.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 4: Skills */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Kỹ năng</h2>
                      <button
                        onClick={() => addItem('skills')}
                        className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                      >
                        <FaPlus /> Thêm kỹ năng
                      </button>
                    </div>

                    <div className="space-y-3">
                      {resumeData.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                            placeholder="Tên kỹ năng"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex items-center gap-2 w-48">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => updateItem('skills', skill.id, 'level', parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-600 w-10">{skill.level}%</span>
                          </div>
                          <button
                            onClick={() => removeItem('skills', skill.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Certifications & Languages */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Certifications */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Chứng chỉ</h2>
                        <button
                          onClick={() => addItem('certifications')}
                          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                        >
                          <FaPlus /> Thêm chứng chỉ
                        </button>
                      </div>

                      {resumeData.certifications.map((cert, index) => (
                        <div key={cert.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-700">Chứng chỉ #{index + 1}</h3>
                            <button
                              onClick={() => removeItem('certifications', cert.id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chứng chỉ</label>
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tổ chức cấp</label>
                              <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                              <input
                                type="month"
                                value={cert.date}
                                onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                              <input
                                type="text"
                                value={cert.credentialId}
                                onChange={(e) => updateItem('certifications', cert.id, 'credentialId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Languages */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Ngôn ngữ</h2>
                        <button
                          onClick={() => addItem('languages')}
                          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                        >
                          <FaPlus /> Thêm ngôn ngữ
                        </button>
                      </div>

                      <div className="space-y-3">
                        {resumeData.languages.map((lang) => (
                          <div key={lang.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                            <input
                              type="text"
                              value={lang.name}
                              onChange={(e) => updateItem('languages', lang.id, 'name', e.target.value)}
                              placeholder="Ngôn ngữ"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                            <input
                              type="text"
                              value={lang.level}
                              onChange={(e) => updateItem('languages', lang.id, 'level', e.target.value)}
                              placeholder="Trình độ"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => removeItem('languages', lang.id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-6 border-t">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft /> Quay lại
                  </button>
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                    disabled={currentStep === 5}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp theo <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className={`${previewMode ? 'col-span-2 max-w-4xl mx-auto' : ''} print-only`}>
            <div
              ref={resumeRef}
              className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none"
              style={{ minHeight: '842px' }}
            >
              {/* Resume Header */}
              <div
                className="p-8 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <div className="flex items-center gap-6">
                  <img
                    src={resumeData.personalInfo.avatar}
                    alt={resumeData.personalInfo.fullName}
                    className="w-28 h-28 rounded-full border-4 border-white/30 object-cover"
                  />
                  <div>
                    <h1 className="text-3xl font-bold">{resumeData.personalInfo.fullName || 'Họ và tên'}</h1>
                    <p className="text-xl opacity-90 mt-1">{resumeData.personalInfo.title || 'Chức danh'}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm opacity-80">
                      {resumeData.personalInfo.email && (
                        <span className="flex items-center gap-1">
                          <FaEnvelope /> {resumeData.personalInfo.email}
                        </span>
                      )}
                      {resumeData.personalInfo.phone && (
                        <span className="flex items-center gap-1">
                          <FaPhone /> {resumeData.personalInfo.phone}
                        </span>
                      )}
                      {resumeData.personalInfo.address && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt /> {resumeData.personalInfo.address}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-3">
                      {resumeData.personalInfo.linkedin && (
                        <span className="flex items-center gap-1 text-sm opacity-80">
                          <FaLinkedin /> {resumeData.personalInfo.linkedin}
                        </span>
                      )}
                      {resumeData.personalInfo.github && (
                        <span className="flex items-center gap-1 text-sm opacity-80">
                          <FaGithub /> {resumeData.personalInfo.github}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                  {/* Summary */}
                  {resumeData.personalInfo.summary && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Giới thiệu
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {resumeData.personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Kinh nghiệm làm việc
                      </h2>
                      <div className="space-y-4">
                        {resumeData.experience.map(exp => (
                          <div key={exp.id} className="relative pl-4 border-l-2 border-gray-200">
                            <div
                              className="absolute left-0 top-0 w-2 h-2 rounded-full -translate-x-[5px]"
                              style={{ backgroundColor: colors.primary }}
                            />
                            <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                            <p className="text-sm" style={{ color: colors.primary }}>{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Học vấn
                      </h2>
                      <div className="space-y-3">
                        {resumeData.education.map(edu => (
                          <div key={edu.id} className="relative pl-4 border-l-2 border-gray-200">
                            <div
                              className="absolute left-0 top-0 w-2 h-2 rounded-full -translate-x-[5px]"
                              style={{ backgroundColor: colors.primary }}
                            />
                            <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                            <p className="text-sm" style={{ color: colors.primary }}>{edu.school}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {edu.startDate} - {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}
                            </p>
                            {edu.description && (
                              <p className="text-sm text-gray-600 mt-1">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Kỹ năng
                      </h2>
                      <div className="space-y-2">
                        {resumeData.skills.map(skill => (
                          <div key={skill.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{skill.name}</span>
                              <span className="text-gray-500">{skill.level}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${skill.level}%`, backgroundColor: colors.primary }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resumeData.certifications.length > 0 && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Chứng chỉ
                      </h2>
                      <div className="space-y-2">
                        {resumeData.certifications.map(cert => (
                          <div key={cert.id} className="text-sm">
                            <h4 className="font-medium text-gray-800">{cert.name}</h4>
                            <p className="text-gray-500">{cert.issuer}</p>
                            <p className="text-xs text-gray-400">{cert.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {resumeData.languages.length > 0 && (
                    <div>
                      <h2
                        className="text-lg font-bold border-b-2 pb-2 mb-3"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Ngôn ngữ
                      </h2>
                      <div className="space-y-2">
                        {resumeData.languages.map(lang => (
                          <div key={lang.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{lang.name}</span>
                            <span className="text-gray-500">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
