import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  MoreVertical, 
  FileText, 
  MessageSquare, 
  Loader, 
  Briefcase, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Eye,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { applicationService } from "@/services";
import type { Application } from "@/services";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

interface ApplicantWithJobInfo extends Application {
  jobTitle?: string;
  companyName?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantAvatar?: string;
  applicantRole?: string;
  location?: string;
}

export function ManageApplicants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [applicants, setApplicants] = useState<ApplicantWithJobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getMyEmployerApplications?.();
      
      if (!response) {
        setApplicants([]);
        setError(null);
        return;
      }
      
      const appsData = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
      
      const enrichedApplicants: ApplicantWithJobInfo[] = appsData.map((app: Application) => {
        const job = (app as any)?.job || {};
        const user = (app as any)?.user || {};
        const company = job?.company || {};
        
        return {
          ...app,
          jobTitle: job?.jobTitle || job?.title || (app as any)?.jobTitle || (app as any)?.title || 'Job',
          companyName: company?.companyName || company?.name || (app as any)?.companyName || 'Company',
          applicantName: user?.fullName || (app as any)?.user?.fullName || (app as any)?.applicantName || 'Unknown',
          applicantEmail: user?.email || (app as any)?.user?.email || (app as any)?.applicantEmail || '',
          applicantAvatar: user?.avatarURL || user?.avatar || (app as any)?.user?.avatarURL || (app as any)?.user?.avatar || (app as any)?.applicantAvatar,
          applicantRole: (app as any)?.applicantRole || 'Job Seeker',
          location: job?.location || (app as any)?.location || 'Toàn quốc'
        };
      });
      
      setApplicants(enrichedApplicants);
      setError(null);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Không thể tải danh sách ứng viên. Vui lòng thử lại sau.");
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string | number, newStatus: string) => {
    try {
      // In a real app, applicationId might be a string or number depending on the API
      await applicationService.updateStatus(applicationId.toString(), newStatus);
      
      // Update local state
      setApplicants(prev => prev.map(app => {
        const id = app.applicationId || app.id;
        if (id === applicationId) {
          return { ...app, status: newStatus };
        }
        return app;
      }));
      
      toast.success(`Đã cập nhật trạng thái thành "${getStatusLabel(newStatus)}"`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'new': return 'Mới';
      case 'viewed': return 'Đã xem';
      case 'shortlisted': return 'Đã chọn lọc';
      case 'interview': return 'Phỏng vấn';
      case 'rejected': return 'Từ chối';
      case 'accepted': return 'Đã nhận';
      default: return status;
    }
  };

  const statusOptions = [
    { value: 'new', label: 'Mới', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'viewed', label: 'Đã xem', icon: Eye, color: 'text-gray-600', bg: 'bg-gray-100' },
    { value: 'shortlisted', label: 'Chọn lọc', icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { value: 'interview', label: 'Phỏng vấn', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'rejected', label: 'Từ chối', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { value: 'accepted', label: 'Đã nhận', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = (app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || app.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (status: string) => {
    const option = statusOptions.find(o => o.value === status?.toLowerCase()) || statusOptions[0];
    return `${option.bg} ${option.color}`;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#411c96] to-[#5b2cbb] pt-10 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <Link to="/employer/dashboard" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors font-medium text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Bảng điều khiển
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-0.5 px-2 text-[10px] uppercase tracking-wider font-bold">Employer Pro</Badge>
                <span className="text-white/60 text-xs flex items-center gap-1"><Briefcase className="h-3 w-3" /> Quản lý nhân sự</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Quản lý Ứng viên
              </h1>
              <p className="text-white/70 mt-2 font-medium max-w-xl">
                Theo dõi tiến độ, đánh giá hồ sơ và kết nối với những tài năng tiềm năng nhất cho doanh nghiệp của bạn.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên ứng viên hoặc vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all text-sm font-medium backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20">
        {/* Stats & Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <Card className="lg:w-64 shrink-0 border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#411c96]" /> Bộ lọc
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setStatusFilter("all")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${statusFilter === 'all' ? 'bg-[#411c96] text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Tất cả hồ sơ
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{applicants.length}</span>
                </button>
                {statusOptions.map((opt) => (
                  <button 
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${statusFilter === opt.value ? 'bg-[#411c96] text-white shadow-lg shadow-purple-200' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <opt.icon className={`h-4 w-4 ${statusFilter === opt.value ? 'text-white' : opt.color}`} />
                      {opt.label}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusFilter === opt.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {applicants.filter(a => a.status?.toLowerCase() === opt.value).length}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <Loader className="h-12 w-12 animate-spin text-[#411c96] mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Đang tải danh sách...</p>
              </div>
            ) : error ? (
              <Card className="border-none shadow-xl bg-red-50 p-8 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-bold">{error}</p>
                <Button onClick={fetchApplicants} variant="outline" className="mt-4 border-red-200 text-red-700 hover:bg-red-100">Thử lại</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map((app) => (
                    <Card key={app.id || app.applicationId} className="border-none shadow-lg shadow-gray-200/40 hover:shadow-xl hover:translate-y-[-2px] transition-all bg-white group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Applicant Info Column */}
                          <div className="p-6 flex-1 flex items-start gap-5">
                            <div className="relative">
                              <Avatar 
                                src={app.applicantAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicantName || 'Applicant')}&background=random`} 
                                alt={app.applicantName} 
                                className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border-2 border-gray-100 shadow-sm group-hover:scale-105 transition-transform object-cover" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-lg md:text-xl font-black text-gray-900 group-hover:text-[#411c96] transition-colors truncate uppercase tracking-tight">
                                  {app.applicantName || 'Ứng viên chưa rõ'}
                                </h3>
                                <Badge className={`text-[10px] font-black uppercase tracking-widest py-0.5 px-2 border-none ${getStatusStyles(app.status || 'new')}`}>
                                  {getStatusLabel(app.status || 'new')}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-500 font-bold mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                                <Briefcase className="h-3.5 w-3.5 text-blue-500" /> {app.jobTitle}
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                                <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                                  <Mail className="h-4 w-4 text-gray-400" /> {app.applicantEmail || 'Chưa cung cấp email'}
                                </div>
                                <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                                  <Calendar className="h-4 w-4 text-gray-400" /> {app.appliedDate || app.AppliedDate ? new Date(app.appliedDate || app.AppliedDate || '').toLocaleDateString('vi-VN') : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Column */}
                          <div className="bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-6 md:w-72 flex flex-col justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thay đổi trạng thái</label>
                                <select
                                  value={app.status?.toLowerCase() || 'new'}
                                  onChange={(e) => handleStatusChange(app.applicationId || app.id || 0, e.target.value)}
                                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-100 focus:border-[#411c96] focus:ring-0 transition-all outline-none cursor-pointer ${getStatusStyles(app.status || 'new')}`}
                                >
                                  {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value} className="text-gray-800 bg-white">
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link to={`/admin/profile?userId=${(app as any)?.userId}`} className="flex-1">
                                <Button variant="outline" className="w-full rounded-xl border-gray-200 hover:border-[#411c96] hover:text-[#411c96] font-bold text-xs h-10 flex items-center gap-2 transition-all bg-white">
                                  <FileText className="h-3.5 w-3.5" /> Xem CV
                                </Button>
                              </Link>
                              <Button 
                                onClick={() => toast.info("Chức năng chat đang được phát triển")}
                                className="bg-[#411c96] hover:bg-[#2d0f71] text-white rounded-xl font-bold text-xs h-10 px-4 transition-all flex items-center gap-2 shadow-lg shadow-purple-200"
                              >
                                <MessageSquare className="h-3.5 w-3.5" /> Chat
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-gray-400 hover:text-gray-900">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center shadow-xl shadow-gray-200/50 border border-dashed border-gray-200">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">Không tìm thấy ứng viên nào</h3>
                    <p className="text-gray-500 font-medium mb-8">Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc theo trạng thái khác.</p>
                    <Button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} variant="outline" className="rounded-2xl px-8 py-6 h-auto font-black text-sm border-2 border-[#411c96] text-[#411c96] hover:bg-[#411c96] hover:text-white transition-all">
                      Xóa tất cả bộ lọc
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

