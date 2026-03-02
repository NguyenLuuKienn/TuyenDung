import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Upload, Plus, Edit2, Trash2, ChevronRight, CheckCircle2, Clock, XCircle, Save, X, Loader } from "lucide-react";
import { profileService, jobService } from "@/services";
import type { Profile as ProfileType, Job } from "@/services";

export function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [introText, setIntroText] = useState("Lập trình viên Frontend đam mê với hơn 5 năm kinh nghiệm xây dựng các ứng dụng web mở rộng. Thành thạo React, TypeScript và các framework CSS hiện đại. Tập trung mạnh vào trải nghiệm người dùng, tối ưu hóa hiệu suất và kiến trúc mã sạch. Luôn mong muốn học hỏi công nghệ mới và giải quyết các vấn đề phức tạp.");
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingExperience, setIsEditingExperience] = useState<number | null>(null);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  
  const [isEditingEducation, setIsEditingEducation] = useState<number | null>(null);
  const [isAddingEducation, setIsAddingEducation] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await profileService.getMyProfile();
        const profileData = profileResponse.data || (profileResponse as any)?.data || null;
        setProfile(profileData);
        
        // Load bio/introduction from profile if available
        if (profileData?.bio || profileData?.introduction) {
          setIntroText(profileData.bio || profileData.introduction);
        }
        
        // Optionally fetch applied jobs
        const jobsResponse = await jobService.getAll();
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
        setAppliedJobs(jobsData.slice(0, 3)); // Show recent jobs
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
            <p className="text-gray-600">Đang tải hồ sơ của bạn...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Cover Image & Header */}
      <div className="h-64 bg-gradient-to-r from-brand to-blue-600 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 text-center border-b border-gray-50">
                  <div className="relative inline-block mb-4">
                    <Avatar src={profile?.avatar || "https://picsum.photos/seed/user1/100/100"} alt={profile?.fullName || "User"} className="h-32 w-32 mx-auto border-4 border-white shadow-md rounded-3xl" />
                    <button className="absolute -bottom-2 -right-2 p-2 bg-brand text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm border-2 border-white">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-gray-900">{profile?.fullName || "User"}</h2>
                  <p className="text-gray-500 font-medium mt-1">{profile?.title || "Lập Trình Viên Frontend"}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1">Đang tìm việc</Badge>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                      <Mail className="h-4 w-4 text-brand" />
                    </div>
                    <span className="truncate font-medium">{profile?.email || "user@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                      <Phone className="h-4 w-4 text-brand" />
                    </div>
                    <span className="font-medium">{profile?.phoneNumber || "+84 123 456 789"}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                      <MapPin className="h-4 w-4 text-brand" />
                    </div>
                    <span className="font-medium">{profile?.location || "Hồ Chí Minh, VN"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <div className="flex flex-col p-2">
                {[
                  { id: "overview", label: "Tổng quan", icon: User },
                  { id: "resume", label: "Hồ sơ & CV", icon: FileText },
                  { id: "applications", label: "Việc đã ứng tuyển", icon: Briefcase },
                  { id: "saved", label: "Việc đã lưu", icon: CheckCircle2 }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-all rounded-xl ${
                      activeTab === tab.id 
                        ? "bg-brand text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-white/80" : "text-gray-400"}`} />
                      {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6 mt-6 lg:mt-0">
            
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                    <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                      <div className="bg-brand/10 p-2 rounded-xl">
                        <User className="h-5 w-5 text-brand" />
                      </div>
                      Giới Thiệu
                    </CardTitle>
                    {!isEditingIntro ? (
                      <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/5 rounded-full px-4 cursor-pointer" onClick={() => setIsEditingIntro(true)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-full px-4 cursor-pointer" onClick={() => setIsEditingIntro(false)}>
                          <X className="h-4 w-4 mr-2" /> Hủy
                        </Button>
                        <Button size="sm" className="rounded-full px-4 cursor-pointer" onClick={() => setIsEditingIntro(false)}>
                          <Save className="h-4 w-4 mr-2" /> Lưu
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditingIntro ? (
                      <textarea 
                        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-y"
                        value={introText}
                        onChange={(e) => setIntroText(e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {introText}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                    <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                      <div className="bg-purple-50 p-2 rounded-xl">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      Kinh Nghiệm
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-brand hover:bg-brand/5 rounded-full px-4 cursor-pointer" onClick={() => setIsAddingExperience(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Thêm
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {isAddingExperience && (
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Thêm Kinh Nghiệm Mới</h4>
                        <div className="space-y-4">
                          <Input placeholder="Chức danh (VD: Senior Developer)" />
                          <Input placeholder="Công ty (VD: TechCorp Inc.)" />
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Từ năm (VD: 2021)" />
                            <Input placeholder="Đến năm (VD: Hiện tại)" />
                          </div>
                          <textarea className="w-full p-3 border border-gray-200 rounded-xl outline-none" placeholder="Mô tả công việc..." rows={3}></textarea>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsAddingExperience(false)}>Hủy</Button>
                            <Button onClick={() => setIsAddingExperience(false)}>Lưu</Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative pl-8 border-l-2 border-gray-100 group">
                      <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-brand border-4 border-white shadow-sm"></div>
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-brand bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div>
                          <h4 className="text-lg font-bold font-display text-gray-900">Senior Frontend Developer</h4>
                          <p className="text-brand font-medium mt-1">TechCorp Inc. • Hồ Chí Minh</p>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-3 py-1 w-fit">2021 - Hiện tại</Badge>
                      </div>
                      <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 marker:text-gray-300">
                        <li>Dẫn dắt nhóm 4 lập trình viên xây dựng lại bảng điều khiển sản phẩm cốt lõi bằng React và Redux.</li>
                        <li>Cải thiện 40% hiệu suất ứng dụng thông qua code splitting và lazy loading.</li>
                        <li>Hướng dẫn các lập trình viên trẻ và thiết lập tiêu chuẩn mã hóa frontend.</li>
                      </ul>
                    </div>
                    
                    <div className="relative pl-8 border-l-2 border-gray-100 group">
                      <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-gray-300 border-4 border-white shadow-sm"></div>
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-brand bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div>
                          <h4 className="text-lg font-bold font-display text-gray-900">Frontend Developer</h4>
                          <p className="text-brand font-medium mt-1">WebSolutions Studio • Đà Nẵng</p>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-3 py-1 w-fit">2018 - 2021</Badge>
                      </div>
                      <ul className="list-disc pl-5 text-gray-600 space-y-2 mt-4 marker:text-gray-300">
                        <li>Phát triển các ứng dụng web đáp ứng cho nhiều khách hàng khác nhau sử dụng Vue.js và Nuxt.</li>
                        <li>Hợp tác chặt chẽ với các nhà thiết kế để triển khai giao diện người dùng hoàn hảo đến từng pixel.</li>
                        <li>Tích hợp API RESTful và tối ưu hóa chiến lược tìm nạp dữ liệu.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                      <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                        <div className="bg-amber-50 p-2 rounded-xl">
                          <GraduationCap className="h-5 w-5 text-amber-600" />
                        </div>
                        Học Vấn
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="text-brand hover:bg-brand/5 rounded-full cursor-pointer" onClick={() => setIsAddingEducation(true)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      {isAddingEducation && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 space-y-3">
                          <Input placeholder="Bằng cấp (VD: Cử nhân KHMT)" />
                          <Input placeholder="Trường (VD: ĐH CNTT)" />
                          <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Năm (VD: 2014 - 2018)" />
                            <Input placeholder="GPA (VD: 3.8/4.0)" />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => setIsAddingEducation(false)}>Hủy</Button>
                            <Button size="sm" onClick={() => setIsAddingEducation(false)}>Lưu</Button>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 group relative">
                        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-brand bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button className="p-1 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                            <GraduationCap className="h-7 w-7 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">Cử nhân Khoa học Máy tính</h4>
                          <p className="text-gray-600 mt-1">Đại học Công nghệ Thông tin, ĐHQG-HCM</p>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline" className="border-gray-200 text-gray-500 font-medium">2014 - 2018</Badge>
                            <span className="text-sm font-bold text-gray-900">GPA: 3.8/4.0</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                      <CardTitle className="text-xl font-bold font-display flex items-center gap-2">
                        <div className="bg-emerald-50 p-2 rounded-xl">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        Kỹ Năng
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="text-brand hover:bg-brand/5 rounded-full">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {["React", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS", "Next.js", "Redux", "Git", "Jest", "Webpack"].map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors cursor-default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "resume" && (
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-6">
                  <CardTitle className="text-2xl font-bold font-display">Quản Lý Hồ Sơ</CardTitle>
                  <p className="text-gray-500 mt-1">Tải lên và quản lý CV của bạn. Bạn có thể chọn CV nào để sử dụng khi ứng tuyển.</p>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-brand/30 bg-brand/5 rounded-3xl p-10 text-center hover:bg-brand/10 transition-colors cursor-pointer group">
                    <div className="mx-auto w-16 h-16 bg-white text-brand rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Nhấp để tải lên hoặc kéo thả</h3>
                    <p className="text-gray-500 mb-6 font-medium">PDF, DOCX tối đa 5MB</p>
                    <Button className="rounded-full px-8 shadow-sm">Chọn Tệp</Button>
                  </div>

                  {/* Resume List */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">Hồ Sơ Của Bạn</h4>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none">Đã tải lên 2 / 5</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-2 border-brand bg-brand/5 rounded-2xl gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-white text-red-500 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                              NguyenVanA_Frontend_CV.pdf
                              <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none px-2 py-0.5 text-xs uppercase tracking-wider font-bold">Mặc định</Badge>
                            </p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Tải lên vào 24 Thg 10, 2023 • 1.2 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button variant="outline" size="icon" className="text-gray-500 hover:text-brand rounded-full bg-white border-gray-200"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="outline" size="icon" className="text-gray-500 hover:text-red-600 rounded-full bg-white border-gray-200"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 bg-white rounded-2xl hover:border-brand/30 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-50 text-blue-500 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">NguyenVanA_Fullstack_CV.docx</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Tải lên vào 15 Thg 9, 2023 • 2.4 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-brand rounded-full px-4 border-gray-200">Đặt Mặc Định</Button>
                          <Button variant="outline" size="icon" className="text-gray-500 hover:text-red-600 rounded-full border-gray-200"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "applications" && (
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-6">
                  <CardTitle className="text-2xl font-bold font-display">Việc Đã Ứng Tuyển</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { title: "Senior Frontend Developer", company: "TechCorp Inc.", status: "Phỏng vấn", date: "25 Thg 10, 2023", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                      { title: "React Developer", company: "Innovate Solutions", status: "Đã nộp", date: "20 Thg 10, 2023", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                      { title: "UI Engineer", company: "Creative Studio", status: "Từ chối", date: "10 Thg 10, 2023", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
                    ].map((app, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-brand/30 transition-colors bg-white gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                            <Briefcase className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg hover:text-brand cursor-pointer transition-colors">{app.title}</h4>
                            <p className="font-medium text-gray-600 mt-0.5">{app.company}</p>
                            <p className="text-sm text-gray-400 mt-2 font-medium">Đã ứng tuyển vào {app.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 self-stretch sm:self-auto">
                          <Badge variant="outline" className={`border ${app.border} ${app.bg} ${app.color} px-3 py-1 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5`}>
                            <app.icon className="h-3.5 w-3.5" />
                            {app.status}
                          </Badge>
                          <Button variant="link" size="sm" className="text-brand font-bold h-auto p-0 hover:no-underline hover:text-blue-700">Xem Chi Tiết <ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "saved" && (
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-6">
                  <CardTitle className="text-2xl font-bold font-display">Việc Đã Lưu</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {appliedJobs.slice(0, 2).map((job) => (
                      <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-brand/30 transition-colors bg-white gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={job.company?.name || "Company"} className="h-14 w-14 rounded-2xl border border-gray-100 shadow-sm shrink-0" />
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg hover:text-brand cursor-pointer transition-colors">{job.title}</h4>
                            <p className="font-medium text-gray-600 mt-0.5">{job.company?.name || job.company} • {job.location || "Tương lượng"}</p>
                            <p className="text-sm text-gray-400 mt-2 font-medium">Đã lưu vào {new Date().toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <Button className="rounded-full shadow-sm px-6">Ứng Tuyển Ngay</Button>
                          <Button variant="outline" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-full border-gray-200 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
