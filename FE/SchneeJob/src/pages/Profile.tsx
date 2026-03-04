import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Upload, Plus, Edit2, Trash2, ChevronRight, CheckCircle2, Clock, XCircle, Save, X, Loader } from "lucide-react";
import { profileService, resumeService, applicationService, savedJobService } from "@/services";
import type { Profile as ProfileType } from "@/services";
import type { Resume } from "@/services/resumeService";
import type { Application } from "@/services/applicationService";
import type { SavedJob } from "@/services/savedJobService";
import { getStoredUser } from "@/utils/roleUtils";

export function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [storedUser, setStoredUser] = useState<any>(null);

  // Get stored user info on mount
  useEffect(() => {
    const user = getStoredUser();
    setStoredUser(user);
  }, []);

  // Handle saving profile summary
  const handleSaveSummary = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      await profileService.createOrUpdate(profile);
      setIsEditingIntro(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Lỗi: Không thể lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await profileService.getMyProfile();
        const profileData = profileResponse.data || (profileResponse as any)?.data || null;
        console.log('[Profile] Fetched profile:', profileData);
        setProfile(profileData);
        
        // Fetch resumes
        try {
          const resumesResponse = await resumeService.getMyResumes();
          const resumesData = Array.isArray(resumesResponse.data) ? resumesResponse.data : [];
          setResumes(resumesData);
        } catch (err) {
          console.warn("Failed to load resumes:", err);
        }
        
        // Fetch applications
        try {
          const applicationsResponse = await applicationService.getMyApplications();
          console.log('[Profile] Applications response:', applicationsResponse);
          const applicationsData = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
          console.log('[Profile] Applications data:', applicationsData);
          setApplications(applicationsData);
        } catch (err) {
          console.error("[Profile] Failed to load applications:", err);
        }
        
        // Fetch saved jobs
        try {
          const savedJobsResponse = await savedJobService.getMySavedJobs();
          console.log('[Profile] Saved jobs response:', savedJobsResponse);
          const savedJobsData = Array.isArray(savedJobsResponse.data) ? savedJobsResponse.data : [];
          console.log('[Profile] Saved jobs data:', savedJobsData);
          setSavedJobs(savedJobsData);
        } catch (err) {
          console.error("[Profile] Failed to load saved jobs:", err);
        }
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
                  <h2 className="text-2xl font-bold font-display text-gray-900">{storedUser?.fullName || profile?.headline?.split(' ')[0] || "Người dùng"}</h2>
                  <p className="text-gray-500 font-medium mt-1">{profile?.headline || "Open to work"}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1">Đang tìm việc</Badge>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 text-sm text-gray-600">
                  {storedUser?.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                        <Mail className="h-4 w-4 text-brand" />
                      </div>
                      <span className="truncate font-medium">{storedUser.email}</span>
                    </div>
                  )}
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                        <Phone className="h-4 w-4 text-brand" />
                      </div>
                      <span className="font-medium">{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                        <MapPin className="h-4 w-4 text-brand" />
                      </div>
                      <span className="font-medium">{profile.address}</span>
                    </div>
                  )}
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
                        <Button size="sm" className="rounded-full px-4 cursor-pointer" onClick={handleSaveSummary} disabled={isSaving}>
                          <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditingIntro ? (
                      <textarea 
                        className="w-full min-h-[120px] p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-y"
                        value={profile?.summary || ""}
                        onChange={(e) => setProfile(profile ? { ...profile, summary: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {profile?.summary || "Chưa có giới thiệu. Bấm chỉnh sửa để thêm giới thiệu về bản thân."}
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
                    
                    {profile?.experiences && profile.experiences.length > 0 ? (
                      profile.experiences.map((experience, idx) => {
                        const startDate = experience.startDate ? new Date(experience.startDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : '';
                        const endDate = experience.endDate ? new Date(experience.endDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : 'Hiện tại';
                        return (
                          <div key={experience.experienceId || idx} className="relative pl-8 border-l-2 border-gray-100 group">
                            <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full ${idx === 0 ? 'bg-brand' : 'bg-gray-300'} border-4 border-white shadow-sm`}></div>
                            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-brand bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                              <div>
                                <h4 className="text-lg font-bold font-display text-gray-900">{experience.jobTitle}</h4>
                                <p className="text-brand font-medium mt-1">{experience.companyName}{experience.location ? ` • ${experience.location}` : ''}</p>
                              </div>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-3 py-1 w-fit">{startDate} - {endDate}</Badge>
                            </div>
                            {experience.description && (
                              <p className="text-gray-600 mt-4">{experience.description}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-8">Chưa có kinh nghiệm. Bấm Thêm để thêm kinh nghiệm làm việc.</p>
                    )}
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
                      {profile?.educations && profile.educations.length > 0 ? (
                        profile.educations.map((education, idx) => (
                          <div key={education.educationId || idx} className="flex gap-4 group relative">
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
                              <h4 className="font-bold text-gray-900 text-lg leading-tight">{education.degree}</h4>
                              <p className="text-gray-600 mt-1">{education.schoolName}</p>
                              {education.fieldOfStudy && <p className="text-gray-500 text-sm mt-1">{education.fieldOfStudy}</p>}
                              <div className="flex items-center gap-3 mt-3">
                                {education.startDate && (
                                  <Badge variant="outline" className="border-gray-200 text-gray-500 font-medium">
                                    {new Date(education.startDate).getFullYear()} {education.endDate ? `- ${new Date(education.endDate).getFullYear()}` : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Chưa có học vấn. Bấm Thêm để thêm thông tin học vấn.</p>
                      )}
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
                      {profile?.jobSeekerSkills && profile.jobSeekerSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.jobSeekerSkills.map(skill => (
                            <Badge key={skill.skillId || skill.skillName} variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors cursor-default">
                              {skill.skillName || skill.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center">Chưa có kỹ năng nào</p>
                      )}
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
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none">Đã tải lên {resumes.length} / 5</Badge>
                    </div>
                    
                    {resumes.length > 0 ? (
                      <div className="space-y-4">
                        {resumes.map((resume, idx) => (
                          <div key={resume.id || resume.resumeId || idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 border-2 rounded-2xl gap-4 ${resume.isDefault ? 'border-brand bg-brand/5' : 'border border-gray-100 bg-white hover:border-brand/30'}`}>
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                <FileText className="h-6 w-6 text-red-500" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                  {resume.title}
                                  {resume.isDefault && <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none px-2 py-0.5 text-xs uppercase tracking-wider font-bold">Mặc định</Badge>}
                                </p>
                                <p className="text-sm text-gray-500 font-medium mt-1">Tải lên vào {new Date(resume.createdAt || '').toLocaleDateString('vi-VN')} • {resume.fileURL ? '...' : 'Không có file'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <Button variant="outline" size="sm" className="text-gray-600 hover:text-brand rounded-full px-4 border-gray-200">Xem</Button>
                              <Button variant="outline" size="icon" className="text-gray-500 hover:text-brand rounded-full bg-white border-gray-200"><Edit2 className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" className="text-gray-500 hover:text-red-600 rounded-full bg-white border-gray-200"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-gray-100 rounded-2xl bg-gray-50">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Chưa có hồ sơ nào. Tải lên để bắt đầu.</p>
                      </div>
                    )}
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
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((app, idx) => {
                        // Properly map the application data
                        const jobId = app.job?.jobId || app.jobId || '';
                        const jobTitle = app.job?.jobTitle || app.job?.title || 'Công việc';
                        const companyName = app.job?.company?.companyName || app.job?.company?.name || 'Công ty';
                        const appliedDate = app.appliedDate || (app as any)?.AppliedDate || '';
                        const status = app.status || 'Đã nộp';
                        
                        // Determine status color and icon
                        let statusIcon = Clock;
                        let statusColor = "text-blue-600";
                        let statusBg = "bg-blue-50";
                        let statusBorder = "border-blue-200";
                        let statusText = status;
                        
                        if (status.toLowerCase().includes('approved') || status.toLowerCase().includes('interview')) {
                          statusIcon = Clock;
                          statusColor = "text-amber-600";
                          statusBg = "bg-amber-50";
                          statusBorder = "border-amber-200";
                          statusText = "Phỏng vấn";
                        } else if (status.toLowerCase().includes('rejected') || status.toLowerCase().includes('decline')) {
                          statusIcon = XCircle;
                          statusColor = "text-red-600";
                          statusBg = "bg-red-50";
                          statusBorder = "border-red-200";
                          statusText = "Từ chối";
                        } else if (status.toLowerCase().includes('pending') || status.toLowerCase().includes('submitted')) {
                          statusIcon = Clock;
                          statusColor = "text-blue-600";
                          statusBg = "bg-blue-50";
                          statusBorder = "border-blue-200";
                          statusText = "Đã nộp";
                        }
                        
                        return (
                          <div key={app.id || app.applicationId || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-brand/30 transition-colors bg-white gap-4">
                            <div className="flex items-start gap-4">
                              <div className="h-14 w-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                                <Briefcase className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg hover:text-brand cursor-pointer transition-colors">{jobTitle}</h4>
                                <p className="font-medium text-gray-600 mt-0.5">{companyName}</p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">
                                  Đã ứng tuyển vào {appliedDate ? new Date(appliedDate).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 self-stretch sm:self-auto">
                              <Badge variant="outline" className={`border ${statusBorder} ${statusBg} ${statusColor} px-3 py-1 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5`}>
                                <statusIcon className="h-3.5 w-3.5" />
                                {statusText}
                              </Badge>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="text-brand font-bold h-auto p-0 hover:no-underline hover:text-blue-700"
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowApplicationModal(true);
                                }}
                              >
                                Xem Chi Tiết <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-gray-100 rounded-2xl bg-gray-50">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Chưa ứng tuyển công việc nào.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "saved" && (
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-6">
                  <CardTitle className="text-2xl font-bold font-display">Việc Đã Lưu</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((savedJob) => (
                        <div key={savedJob.id || savedJob.savedJobId} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-brand/30 transition-colors bg-white gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar src={savedJob.job?.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={savedJob.job?.company?.name || "Company"} className="h-14 w-14 rounded-2xl border border-gray-100 shadow-sm shrink-0" />
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg hover:text-brand cursor-pointer transition-colors">{savedJob.job?.title || "Công việc"}</h4>
                              <p className="font-medium text-gray-600 mt-0.5">{savedJob.job?.company?.name || "Công ty"}</p>
                              <p className="text-sm text-gray-400 mt-2 font-medium">Đã lưu vào {new Date(savedJob.savedAt || '').toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <Button className="rounded-full shadow-sm px-6">Ứng Tuyển Ngay</Button>
                            <Button variant="outline" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-full border-gray-200 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-gray-100 rounded-2xl bg-gray-50">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Chưa lưu công việc nào.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Application Details Modal */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Chi tiết ứng tuyển</CardTitle>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Vị trí ứng tuyển</h3>
                  <p className="text-lg font-bold text-gray-900">{selectedApplication.job?.jobTitle || selectedApplication.job?.title || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedApplication.job?.company?.companyName || selectedApplication.job?.company?.name || 'N/A'}</p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Trạng thái ứng tuyển</h3>
                  <div className="flex items-center gap-2">
                    {selectedApplication.status?.toLowerCase().includes('pending') || selectedApplication.status?.toLowerCase().includes('submitted') ? (
                      <>
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">Đang chờ xét duyệt</span>
                      </>
                    ) : selectedApplication.status?.toLowerCase().includes('approved') || selectedApplication.status?.toLowerCase().includes('interview') ? (
                      <>
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-600">Phỏng vấn</span>
                      </>
                    ) : selectedApplication.status?.toLowerCase().includes('rejected') ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Từ chối</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-gray-600">{selectedApplication.status || 'N/A'}</span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Ngày ứng tuyển</h3>
                  <p className="text-gray-900">
                    {selectedApplication.appliedDate 
                      ? new Date(selectedApplication.appliedDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>

                {selectedApplication.resume && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">CV sử dụng</h3>
                    <p className="text-gray-900">{selectedApplication.resume.title || 'N/A'}</p>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Thư xin việc</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                )}

                <div className="border-t pt-4 flex gap-3">
                  <Button
                    onClick={() => navigate(`/jobs/${selectedApplication.job?.jobId || selectedApplication.jobId}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Xem tin tuyển dụng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
