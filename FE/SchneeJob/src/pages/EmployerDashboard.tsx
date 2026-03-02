import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Briefcase, Users, Eye, TrendingUp, Plus, MoreVertical, MapPin, Clock, FileText, Settings, Bell, MessageSquare, FileEdit, Loader } from "lucide-react";
import { jobService, companyService } from "@/services";
import type { Job, Company } from "@/services";

export function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try to fetch company and jobs data
        const jobsResponse = await jobService.getAll();
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
        setJobs(jobsData.slice(0, 6)); // Show first 6 jobs
        
        // Try to get company info
        try {
          const companyResponse = await companyService.getMyCompany();
          const companyData = companyResponse.data || (companyResponse as any)?.data || null;
          setCompany(companyData);
        } catch (err) {
          // Company might not be set for employer, use default
          setCompany({ id: '1', name: "Your Company", logo: "https://picsum.photos/seed/company/200/200" } as Company);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar src="https://picsum.photos/seed/techcorp/200/200" alt="TechCorp Inc." className="h-16 w-16 rounded-2xl border border-gray-100 shadow-sm" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Bảng Điều Khiển Nhà Tuyển Dụng</h1>
                <p className="text-gray-500 mt-1">Chào mừng trở lại, TechCorp Inc. Dưới đây là tổng quan hôm nay.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" size="icon" className="rounded-full hidden sm:flex cursor-pointer" onClick={() => alert("Tính năng Cài đặt đang được phát triển")}>
                <Settings className="h-5 w-5 text-gray-500" />
              </Button>
              <Link to="/employer/post-job" className="w-full md:w-auto">
                <Button className="w-full rounded-full shadow-sm px-6 cursor-pointer">
                  <Plus className="h-5 w-5 mr-2" /> Đăng Tin Tuyển Dụng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12%
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Việc Làm Đang Tuyển</p>
              <h3 className="text-3xl font-bold font-display text-gray-900">12</h3>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                  <TrendingUp className="h-3 w-3 mr-1" /> +24%
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tổng Ứng Viên</p>
              <h3 className="text-3xl font-bold font-display text-gray-900">148</h3>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Eye className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                  <TrendingUp className="h-3 w-3 mr-1" /> +8%
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Lượt Xem Tin</p>
              <h3 className="text-3xl font-bold font-display text-gray-900">2.4k</h3>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none">
                  Đang chờ
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đã Chọn Lọc</p>
              <h3 className="text-3xl font-bold font-display text-gray-900">24</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <CardTitle className="text-xl font-bold font-display text-gray-900">Tin Tuyển Dụng Gần Đây</CardTitle>
                <Link to="/employer/posts" className="text-sm font-medium text-brand hover:underline">Xem Tất Cả</Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {loading ? (
                    <div className="p-6 flex items-center justify-center">
                      <Loader className="h-6 w-6 animate-spin text-brand" />
                    </div>
                  ) : error ? (
                    <div className="p-6 text-red-600">{error}</div>
                  ) : (
                    jobs.slice(0, 4).map((job) => (
                      <div key={job.jobId || job.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <Link to={`/employer/jobs/${job.jobId || job.id}`} className="text-lg font-bold font-display text-gray-900 group-hover:text-brand transition-colors">
                              {job.jobTitle || job.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2 font-medium">
                              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {job.location || "Tương lượng"}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /> {job.employmentType || job.type || "Full-time"}</span>
                              <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-xs">Đang hoạt động</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full sm:w-auto bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none border border-gray-100 sm:border-none">
                            <div className="text-center flex-1 sm:flex-none">
                              <p className="text-xl font-bold font-display text-gray-900">12</p>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ứng Viên</p>
                            </div>
                            <div className="w-px h-10 bg-gray-100 hidden sm:block"></div>
                            <div className="text-center flex-1 sm:flex-none">
                              <p className="text-xl font-bold font-display text-gray-900">3</p>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Đã Chọn Lọc</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full shrink-0 cursor-pointer">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-none shadow-sm bg-brand text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
              <CardContent className="p-6 relative z-10">
                <h3 className="font-bold font-display text-lg mb-4">Thao Tác Nhanh</h3>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start mb-3 cursor-pointer">
                    <MessageSquare className="h-4 w-4 mr-3" /> Nhắn Tin Ứng Viên
                  </Button>
                  <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start mb-3 cursor-pointer">
                    <FileText className="h-4 w-4 mr-3" /> Xem Xét Hồ Sơ
                  </Button>
                  <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start mb-3 cursor-pointer">
                    <Users className="h-4 w-4 mr-3" /> Lên Lịch Phỏng Vấn
                  </Button>
                  <Link to="/employer/posts">
                    <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start cursor-pointer">
                      <FileEdit className="h-4 w-4 mr-3" /> Quản Lý Bài Viết
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <CardTitle className="text-lg font-bold font-display text-gray-900">Ứng Viên Mới Nhất</CardTitle>
                <Link to="/employer/applicants" className="text-sm font-medium text-brand hover:underline">Xem Tất Cả</Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {[
                    { name: "Nguyễn Văn A", role: "Frontend Developer", status: "Mới", time: "2 giờ trước", avatar: "https://picsum.photos/seed/a/100/100" },
                    { name: "Trần Thị B", role: "UI/UX Designer", status: "Đã xem", time: "5 giờ trước", avatar: "https://picsum.photos/seed/b/100/100" },
                    { name: "Lê Văn C", role: "Backend Engineer", status: "Đã chọn lọc", time: "1 ngày trước", avatar: "https://picsum.photos/seed/c/100/100" },
                    { name: "Phạm Thị D", role: "DevOps Engineer", status: "Phỏng vấn", time: "2 ngày trước", avatar: "https://picsum.photos/seed/d/100/100" },
                  ].map((app, i) => (
                    <Link key={i} to="/profile" className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar src={app.avatar} alt={app.name} className="h-10 w-10 rounded-xl" />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{app.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{app.role}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-none font-semibold uppercase tracking-wider ${
                          app.status === 'Mới' ? 'bg-blue-50 text-blue-700' :
                          app.status === 'Đã xem' ? 'bg-gray-100 text-gray-700' :
                          app.status === 'Đã chọn lọc' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {app.status}
                        </Badge>
                        <p className="text-[10px] text-gray-400 font-medium">{app.time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
