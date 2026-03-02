import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, BookOpen, TrendingUp, Users, ChevronRight } from "lucide-react";

export function CareerGuide() {
  const guides = [
    {
      id: 1,
      title: "Cách viết CV gây ấn tượng với nhà tuyển dụng",
      category: "Viết CV",
      readTime: "5 phút đọc",
      image: "https://picsum.photos/seed/cv/400/250",
      excerpt: "Hướng dẫn chi tiết cách trình bày kinh nghiệm, kỹ năng và học vấn để CV của bạn nổi bật giữa hàng ngàn ứng viên khác."
    },
    {
      id: 2,
      title: "Bí quyết phỏng vấn thành công cho lập trình viên",
      category: "Phỏng Vấn",
      readTime: "8 phút đọc",
      image: "https://picsum.photos/seed/interview/400/250",
      excerpt: "Những câu hỏi thường gặp và cách trả lời thông minh giúp bạn ghi điểm tuyệt đối trong mắt nhà tuyển dụng IT."
    },
    {
      id: 3,
      title: "Đàm phán lương: Nghệ thuật và kỹ năng cần có",
      category: "Kỹ Năng Mềm",
      readTime: "6 phút đọc",
      image: "https://picsum.photos/seed/salary/400/250",
      excerpt: "Làm thế nào để đưa ra mức lương mong muốn mà không làm mất lòng nhà tuyển dụng? Cùng tìm hiểu các chiến lược đàm phán hiệu quả."
    },
    {
      id: 4,
      title: "Xu hướng tuyển dụng ngành IT năm 2024",
      category: "Thị Trường",
      readTime: "10 phút đọc",
      image: "https://picsum.photos/seed/trend/400/250",
      excerpt: "Cập nhật những công nghệ mới nhất và các vị trí đang được săn đón nhiều nhất trong năm nay."
    }
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-brand text-white py-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">Cẩm Nang Nghề Nghiệp</h1>
          <p className="text-xl text-brand-50 max-w-2xl mx-auto mb-8">
            Khám phá những bài viết, hướng dẫn và lời khuyên hữu ích giúp bạn phát triển sự nghiệp và đạt được mục tiêu nghề nghiệp.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" className="rounded-full px-6 bg-white text-brand hover:bg-gray-50 cursor-pointer">
              <BookOpen className="h-4 w-4 mr-2" /> Đọc Bài Mới Nhất
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { name: "Viết CV & Cover Letter", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
            { name: "Kỹ Năng Phỏng Vấn", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
            { name: "Phát Triển Sự Nghiệp", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
            { name: "Thị Trường Việc Làm", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50" },
          ].map((cat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm">
              <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-3">
                <div className={`p-3 rounded-2xl ${cat.bg}`}>
                  <cat.icon className={`h-6 w-6 ${cat.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Latest Articles */}
        <h2 className="text-2xl font-bold font-display text-gray-900 mb-6">Bài Viết Mới Nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Card key={guide.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-none shadow-sm">
              <div className="h-48 w-full overflow-hidden relative">
                <img src={guide.image} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand">
                  {guide.category}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{guide.readTime}</span>
                  <span>•</span>
                  <span>Đăng 2 ngày trước</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors line-clamp-2">
                  <Link to={`/career-guide/${guide.id}`}>{guide.title}</Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {guide.excerpt}
                </p>
                <Link to={`/career-guide/${guide.id}`} className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-hover transition-colors">
                  Đọc tiếp <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
