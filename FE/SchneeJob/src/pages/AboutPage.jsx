import { motion } from 'framer-motion';
import { FiUsers, FiTarget, FiAward, FiTrendingUp } from 'react-icons/fi';

const AboutPage = () => {
  const stats = [
    { label: 'Người dùng', value: '50K+', icon: FiUsers },
    { label: 'Công ty', value: '5K+', icon: FiTarget },
    { label: 'Việc làm', value: '10K+', icon: FiTrendingUp },
    { label: 'Đánh giá', value: '4.8/5', icon: FiAward },
  ];

  const values = [
    {
      title: 'Tận tâm',
      description: 'Chúng tôi luôn đặt lợi ích của người dùng lên hàng đầu và nỗ lực hết mình để hỗ trợ.',
      icon: '❤️'
    },
    {
      title: 'Đổi mới',
      description: 'Không ngừng cải tiến và áp dụng công nghệ mới để mang lại trải nghiệm tốt nhất.',
      icon: '💡'
    },
    {
      title: 'Minh bạch',
      description: 'Thông tin việc làm và ứng viên luôn được xác thực và hiển thị rõ ràng.',
      icon: '🔍'
    },
    {
      title: 'Kết nối',
      description: 'Xây dựng cầu nối bền vững giữa nhà tuyển dụng và ứng viên tiềm năng.',
      icon: '🤝'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Sứ mệnh của <span className="text-yellow-400">SchneeJob</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto"
          >
            Kết nối nhân tài với cơ hội, xây dựng tương lai nghề nghiệp bền vững cho hàng triệu người Việt Nam.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Được thành lập vào năm 2024, SchneeJob ra đời với mong muốn giải quyết bài toán khó khăn trong việc tìm kiếm việc làm và tuyển dụng nhân sự chất lượng cao tại Việt Nam.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Chúng tôi tin rằng mỗi người đều có một công việc mơ ước đang chờ đợi, và mỗi doanh nghiệp đều xứng đáng có được những nhân sự tài năng nhất. Sứ mệnh của chúng tôi là làm cho sự kết nối đó trở nên dễ dàng, nhanh chóng và hiệu quả hơn bao giờ hết.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
                  alt="Team working"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-xs hidden md:block border border-gray-100 dark:border-gray-700">
                <p className="text-primary-600 dark:text-primary-400 font-bold text-lg mb-2">"Con người là tài sản quý giá nhất của mọi doanh nghiệp"</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">- CEO SchneeJob</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Giá trị cốt lõi</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Những nguyên tắc định hướng cho mọi hành động và quyết định của chúng tôi
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow text-center group border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Sẵn sàng gia nhập cùng chúng tôi?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Hãy bắt đầu hành trình sự nghiệp mới hoặc tìm kiếm nhân tài ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/jobs" className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30">
              Tìm việc ngay
            </a>
            <a href="/employer/register" className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition">
              Đăng tuyển dụng
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
