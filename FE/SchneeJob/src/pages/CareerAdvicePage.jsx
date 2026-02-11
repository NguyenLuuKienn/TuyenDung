import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiTrendingUp, FiTarget, FiMessageCircle, FiSearch } from 'react-icons/fi';

const CareerAdvicePage = () => {
    const categories = [
        { id: 'resume', name: 'Viết CV & Hồ sơ', icon: FiBookOpen, count: 12 },
        { id: 'interview', name: 'Phỏng vấn', icon: FiMessageCircle, count: 8 },
        { id: 'career-growth', name: 'Phát triển sự nghiệp', icon: FiTrendingUp, count: 15 },
        { id: 'job-search', name: 'Tìm việc hiệu quả', icon: FiSearch, count: 10 },
        { id: 'salary', name: 'Đàm phán lương', icon: FiTarget, count: 6 },
    ];

    const articles = [
        {
            id: 1,
            title: 'Cách viết CV ấn tượng cho người mới bắt đầu',
            summary: 'Hướng dẫn chi tiết cách trình bày thông tin, kinh nghiệm và kỹ năng để thu hút nhà tuyển dụng ngay từ cái nhìn đầu tiên.',
            category: 'Viết CV & Hồ sơ',
            image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '10/01/2026',
            readTime: '5 phút'
        },
        {
            id: 2,
            title: 'Top 10 câu hỏi phỏng vấn thường gặp và cách trả lời',
            summary: 'Chuẩn bị sẵn sàng cho buổi phỏng vấn với danh sách các câu hỏi phổ biến và gợi ý trả lời thông minh.',
            category: 'Phỏng vấn',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '08/01/2026',
            readTime: '7 phút'
        },
        {
            id: 3,
            title: 'Làm thế nào để đàm phán lương hiệu quả?',
            summary: 'Bí quyết thương lượng mức lương xứng đáng với năng lực và kinh nghiệm của bạn mà không gây mất thiện cảm.',
            category: 'Đàm phán lương',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '05/01/2026',
            readTime: '6 phút'
        },
        {
            id: 4,
            title: 'Xây dựng thương hiệu cá nhân trên mạng xã hội',
            summary: 'Tận dụng LinkedIn và các nền tảng khác để mở rộng mạng lưới quan hệ và thu hút cơ hội việc làm.',
            category: 'Phát triển sự nghiệp',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '02/01/2026',
            readTime: '8 phút'
        },
        {
            id: 5,
            title: 'Kỹ năng mềm cần thiết cho mọi lập trình viên',
            summary: 'Ngoài kỹ năng code, đây là những kỹ năng mềm giúp bạn thăng tiến nhanh hơn trong sự nghiệp IT.',
            category: 'Phát triển sự nghiệp',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '28/12/2025',
            readTime: '5 phút'
        },
        {
            id: 6,
            title: 'Cách tìm việc làm từ xa (Remote) hiệu quả',
            summary: 'Chia sẻ các nền tảng và mẹo tìm kiếm việc làm remote uy tín cho dân IT.',
            category: 'Tìm việc hiệu quả',
            image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            date: '25/12/2025',
            readTime: '4 phút'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4"
                    >
                        Tư Vấn Nghề Nghiệp
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl opacity-90 max-w-2xl mx-auto"
                    >
                        Khám phá các bài viết, lời khuyên và hướng dẫn hữu ích để phát triển sự nghiệp của bạn
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center cursor-pointer hover:shadow-md transition-all"
                        >
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <cat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cat.count} bài viết</p>
                        </motion.div>
                    ))}
                </div>

                {/* Featured Articles */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bài viết nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400">
                                    {article.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <span>{article.date}</span>
                                    <span>•</span>
                                    <span>{article.readTime} đọc</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                                    {article.summary}
                                </p>
                                <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                                    Đọc tiếp →
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerAdvicePage;
