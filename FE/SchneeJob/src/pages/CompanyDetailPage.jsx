import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatWidgetContext';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaUsers,
  FaGlobe,
  FaIndustry,
  FaCalendarAlt,
  FaBriefcase,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaChevronRight,
  FaStar,
  FaBuilding,
  FaCheckCircle,
  FaCommentDots
} from 'react-icons/fa';
import { FiClock, FiDollarSign, FiMapPin, FiBriefcase, FiGlobe, FiPhone, FiMail, FiShare2, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useJob } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import companyService from '../services/companyService';
import jobService from '../services/jobService';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openChat } = useChat();
  const { toggleSaveJob, savedJobs } = useJob();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followedCompanies, setFollowedCompanies] = useState([]);

  // Load company and jobs
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setIsLoading(true);
        const companyResponse = await companyService.getById(id);
        console.log('Company Data Response:', companyResponse.data); // Debug Log
        setCompany(companyResponse.data);

        const jobsResponse = await jobService.getAll();
        const filtered = (jobsResponse.data || []).filter(job => job.companyId === id);
        setCompanyJobs(filtered);
      } catch (err) {
        console.error('Failed to load company:', err);
        toast.error('Không thể tải thông tin công ty');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công ty</h2>
          <Link to="/companies" className="text-primary hover:underline">
            Quay lại danh sách công ty
          </Link>
        </div>
      </div>
    );
  }

  const isFollowed = followedCompanies.includes(company.id);

  const handleFollow = () => {
    if (isFollowed) {
      setFollowedCompanies(prev => prev.filter(id => id !== company.id));
      toast.info('Đã hủy theo dõi công ty');
    } else {
      setFollowedCompanies(prev => [...prev, company.id]);
      toast.success('Đã theo dõi công ty');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = `Xem thông tin về ${company.name} trên SchneeJob`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const tabs = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'jobs', label: `Việc làm (${companyJobs.length})` },
    { id: 'benefits', label: 'Phúc lợi' },
    { id: 'reviews', label: 'Đánh giá' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        {company.coverImage ? (
          <img
            src={company.coverImage}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-50"></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Company Header */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 -mt-20 relative z-10 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-xl shadow-lg border-4 border-white dark:border-gray-700 overflow-hidden">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                      {company.name}
                    </h1>
                    {company.isVerified && (
                      <FaCheckCircle className="text-blue-500" title="Đã xác thực" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{company.industry}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-primary dark:text-primary-400" />
                      {company.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-primary dark:text-primary-400" />
                      {company.size} nhân viên
                    </span>
                    <span className="flex items-center gap-1">
                      <FaGlobe className="text-primary dark:text-primary-400" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary dark:hover:text-primary-400">
                        {company.website}
                      </a>
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isFollowed
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-primary dark:bg-primary-600 text-white hover:bg-primary-dark dark:hover:bg-primary-700'
                      }`}
                  >
                    {isFollowed ? <FaHeart /> : <FaRegHeart />}
                    {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                  {user?.role?.toLowerCase() === 'jobseeker' && (
                    <button
                      onClick={() => openChat({
                        id: company.contactUserId,
                        fullName: company.name, // Use company name as display name for initial chat
                        avatar: company.logo,   // Use company logo
                        companyName: company.name
                      })}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition-colors"
                    >
                      <FiMessageCircle className="w-5 h-5" />
                      Nhắn tin
                    </button>
                  )}
                  <div className="relative group">
                    <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-600 dark:text-gray-300">
                      <FaShareAlt />
                    </button>
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50 border border-gray-100 dark:border-gray-700 w-40">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-200"
                      >
                        <FaFacebook className="text-blue-600" /> Facebook
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-200"
                      >
                        <FaLinkedin className="text-blue-700" /> LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-200"
                      >
                        <FaTwitter className="text-blue-400" /> Twitter
                      </button>
                    </div>
                  </div>
                </div>
              </div>



              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-0 px-4 md:px-0">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-primary dark:text-primary-400">{companyJobs.length}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Việc làm</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">4.5</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <FaStar className="text-yellow-400" /> Đánh giá
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">1.2k</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Theo dõi</div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex md:hidden gap-2 mt-4">
                <button
                  onClick={handleFollow}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${isFollowed
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                    : 'bg-primary dark:bg-primary-600 text-white'
                    }`}
                >
                  {isFollowed ? <FaHeart /> : <FaRegHeart />}
                  {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                  <FaShareAlt />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="flex border-b dark:border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-6 py-4 font-medium transition ${activeTab === tab.id
                      ? 'text-primary dark:text-primary-400 border-b-2 border-primary dark:border-primary-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Về công ty</h3>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {company.description || `${company.name} là một trong những công ty hàng đầu trong lĩnh vực ${company.industry}. Chúng tôi cam kết mang đến môi trường làm việc chuyên nghiệp, năng động và nhiều cơ hội phát triển cho nhân viên.

Với đội ngũ ${company.size} nhân viên tài năng và nhiệt huyết, chúng tôi không ngừng đổi mới và phát triển để mang đến những sản phẩm và dịch vụ tốt nhất cho khách hàng.

Tại ${company.name}, chúng tôi tin rằng con người là tài sản quý giá nhất. Vì vậy, chúng tôi luôn đặt sự phát triển và hạnh phúc của nhân viên lên hàng đầu.`}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Lĩnh vực hoạt động</h3>
                      <div className="flex flex-wrap gap-2">
                        {[company.industry, 'Phát triển phần mềm', 'Tư vấn công nghệ', 'Giải pháp doanh nghiệp'].map((field, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 dark:bg-primary-900/20 text-primary dark:text-primary-400 rounded-full text-sm"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Văn hóa công ty</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: '🎯', title: 'Định hướng mục tiêu', desc: 'Làm việc có mục đích rõ ràng' },
                          { icon: '🤝', title: 'Teamwork', desc: 'Hợp tác và hỗ trợ lẫn nhau' },
                          { icon: '💡', title: 'Đổi mới sáng tạo', desc: 'Luôn tìm kiếm ý tưởng mới' },
                          { icon: '⚡', title: 'Năng động', desc: 'Môi trường trẻ trung, nhiệt huyết' },
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <span className="text-2xl mb-2 block">{item.icon}</span>
                            <h4 className="font-semibold text-gray-800 dark:text-white">{item.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'jobs' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {companyJobs.length > 0 ? (
                      companyJobs.map(job => {
                        const isSaved = savedJobs.some(j => (j.id === job.id) || (j === job.id) || (j.jobId === job.id));
                        return (
                          <div
                            key={job.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-800"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="text-lg font-semibold text-gray-800 dark:text-white hover:text-primary dark:hover:text-primary-400 transition"
                                >
                                  {job.title}
                                </Link>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-primary dark:text-primary-400" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaBriefcase className="text-primary dark:text-primary-400" />
                                    {job.type}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaCalendarAlt className="text-primary dark:text-primary-400" />
                                    {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <p className="text-primary dark:text-primary-400 font-semibold mt-2">{job.salary}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSaveJob(job.id)}
                                  className={`p-2 rounded-full ${isSaved
                                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                                >
                                  {isSaved ? <FaHeart /> : <FaRegHeart />}
                                </button>
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="px-4 py-2 bg-primary dark:bg-primary-600 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary-700 transition"
                                >
                                  Xem chi tiết
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <FaBriefcase className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Công ty chưa có việc làm nào</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'benefits' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { icon: '💰', title: 'Lương thưởng hấp dẫn', desc: 'Mức lương cạnh tranh, thưởng theo hiệu suất' },
                      { icon: '🏥', title: 'Bảo hiểm sức khỏe', desc: 'Bảo hiểm y tế toàn diện cho bạn và gia đình' },
                      { icon: '🎓', title: 'Đào tạo phát triển', desc: 'Cơ hội học tập và phát triển liên tục' },
                      { icon: '🏖️', title: 'Nghỉ phép linh hoạt', desc: '15+ ngày phép năm, nghỉ lễ theo quy định' },
                      { icon: '💻', title: 'Thiết bị làm việc', desc: 'Laptop, màn hình và phụ kiện chất lượng cao' },
                      { icon: '🍔', title: 'Ăn uống miễn phí', desc: 'Bữa trưa và đồ ăn nhẹ tại văn phòng' },
                      { icon: '🏋️', title: 'Gym & Thể thao', desc: 'Phòng gym, các hoạt động thể thao' },
                      { icon: '🎉', title: 'Team building', desc: 'Du lịch công ty, team building định kỳ' },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700"
                      >
                        <span className="text-2xl">{benefit.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{benefit.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Overall Rating */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6 text-center border border-gray-100 dark:border-gray-700">
                      <div className="text-4xl font-bold text-primary dark:text-primary-400 mb-2">4.5</div>
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar
                            key={star}
                            className={star <= 4 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                          />
                        ))}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Dựa trên 128 đánh giá</p>
                    </div>

                    {/* Sample Reviews */}
                    {[
                      {
                        name: 'Nguyễn Văn A',
                        position: 'Software Developer',
                        rating: 5,
                        date: '2 tuần trước',
                        pros: 'Môi trường làm việc tuyệt vời, đồng nghiệp thân thiện',
                        cons: 'Đôi khi áp lực công việc cao',
                      },
                      {
                        name: 'Trần Thị B',
                        position: 'UI/UX Designer',
                        rating: 4,
                        date: '1 tháng trước',
                        pros: 'Công ty đầu tư vào đào tạo nhân viên, nhiều cơ hội phát triển',
                        cons: 'Quy trình làm việc đôi khi phức tạp',
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">{review.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{review.position}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <FaStar
                                  key={star}
                                  className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                                  size={14}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm dark:text-gray-300">
                            <span className="text-green-600 dark:text-green-400 font-medium">Ưu điểm: </span>
                            {review.pros}
                          </p>
                          <p className="text-sm dark:text-gray-300">
                            <span className="text-red-600 dark:text-red-400 font-medium">Nhược điểm: </span>
                            {review.cons}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="text-center">
                      <button className="text-primary dark:text-primary-400 hover:underline font-medium">
                        Xem tất cả đánh giá
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaBuilding className="text-primary dark:text-primary-400" />
                  <span>{company.address || company.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaPhone className="text-primary dark:text-primary-400" />
                  <span>+84 28 1234 5678</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaEnvelope className="text-primary dark:text-primary-400" />
                  <span>hr@{company.name.toLowerCase().replace(/\s/g, '')}.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaGlobe className="text-primary dark:text-primary-400" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary dark:hover:text-primary-400">
                    {company.website}
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  <FaFacebook />
                </a>
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition">
                  <FaLinkedin />
                </a>
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-300 transition">
                  <FaTwitter />
                </a>
              </div>
            </motion.div>

            {/* Company Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tổng quan</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Quy mô</span>
                  <span className="font-medium">{company.size}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Ngành nghề</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Địa điểm</span>
                  <span className="font-medium">{company.location}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">Thành lập</span>
                  <span className="font-medium">2010</span>
                </div>
              </div>
            </motion.div>

            {/* Similar Companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Công ty tương tự</h3>
              <div className="space-y-3">
                {/* Similar companies can be loaded based on industry */}
                {/* For now, showing empty state as we need similar companies API */}
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sẽ cập nhật sớm</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default CompanyDetailPage;
