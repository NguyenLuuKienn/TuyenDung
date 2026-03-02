import { Link } from "react-router-dom";
import { Briefcase, Twitter, Facebook, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand mb-4">
              <div className="bg-brand text-white p-1.5 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <span>SchneeJob</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              Kết nối nhân tài với những công ty hàng đầu. Tìm kiếm công việc mơ ước hoặc tuyển dụng ứng viên hoàn hảo ngay hôm nay.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-brand"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand"><Github className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Dành Cho Ứng Viên</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/jobs" className="hover:text-brand">Tìm Việc Làm</Link></li>
              <li><Link to="/companies" className="hover:text-brand">Danh Sách Công Ty</Link></li>
              <li><Link to="/salary" className="hover:text-brand">Cẩm Nang Lương</Link></li>
              <li><Link to="/profile" className="hover:text-brand">Tạo Hồ Sơ</Link></li>
              <li><Link to="/alerts" className="hover:text-brand">Thông Báo Việc Làm</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Dành Cho Nhà Tuyển Dụng</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/employer/post-job" className="hover:text-brand">Đăng Tin Tuyển Dụng</Link></li>
              <li><Link to="/employer/pricing" className="hover:text-brand">Bảng Giá</Link></li>
              <li><Link to="/employer/candidates" className="hover:text-brand">Tìm Kiếm Ứng Viên</Link></li>
              <li><Link to="/employer/dashboard" className="hover:text-brand">Bảng Điều Khiển</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Về Chúng Tôi</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-brand">Câu Chuyện Của Chúng Tôi</Link></li>
              <li><Link to="/careers" className="hover:text-brand">Tuyển Dụng Nội Bộ</Link></li>
              <li><Link to="/contact" className="hover:text-brand">Liên Hệ</Link></li>
              <li><Link to="/privacy" className="hover:text-brand">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/terms" className="hover:text-brand">Điều Khoản Dịch Vụ</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SchneeJob. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}
