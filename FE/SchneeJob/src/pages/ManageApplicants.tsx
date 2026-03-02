import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, ChevronLeft, MoreVertical, FileText, MessageSquare, Loader } from "lucide-react";
import { applicationService, jobService } from "@/services";
import type { Application } from "@/services";
import { Avatar } from "@/components/ui/Avatar";

interface ApplicantWithJobInfo extends Application {
  jobTitle?: string;
  applicantName?: string;
  applicantAvatar?: string;
  applicantRole?: string;
}

export function ManageApplicants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [applicants, setApplicants] = useState<ApplicantWithJobInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        // Fetch all jobs first
        const jobsResponse = await jobService.getAll();
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
        
        // Then fetch applications for each job
        const allApplicants: ApplicantWithJobInfo[] = [];
        
        for (const job of jobsData) {
          try {
            const appsResponse = await applicationService.getForJob(job.id);
            const jobApplicants = Array.isArray(appsResponse.data) ? appsResponse.data : (appsResponse as any)?.data || [];
            
            // Enrich applicant data with job title
            const enrichedApplicants = jobApplicants.map((app: Application) => ({
              ...app,
              jobTitle: job.title,
            }));
            
            allApplicants.push(...enrichedApplicants);
          } catch (err) {
            console.warn(`Failed to fetch applications for job ${job.id}:`, err);
          }
        }
        
        setApplicants(allApplicants);
        setError(null);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        setError("Không thể tải danh sách ứng viên. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const filteredApplicants = applicants.filter(app =>
    (app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'new':
      case 'mới':
        return 'bg-blue-50 text-blue-700';
      case 'viewed':
      case 'đã xem':
        return 'bg-gray-100 text-gray-700';
      case 'shortlisted':
      case 'đã chọn lọc':
        return 'bg-amber-50 text-amber-700';
      case 'interview':
      case 'phỏng vấn':
        return 'bg-emerald-50 text-emerald-700';
      case 'rejected':
      case 'từ chối':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link to="/employer/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Bảng điều khiển
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Tất Cả Ứng Viên</h1>
              <p className="text-gray-500 mt-1">Quản lý và theo dõi tất cả ứng viên đã ứng tuyển vào công ty của bạn.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ứng viên, việc làm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              </div>
              <Button variant="outline" className="rounded-xl cursor-pointer shrink-0">
                <Filter className="h-4 w-4 mr-2" /> Lọc
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold">Ứng Viên</th>
                      <th className="px-6 py-4 font-bold">Vị Trí Ứng Tuyển</th>
                      <th className="px-6 py-4 font-bold">Ngày Ứng Tuyển</th>
                      <th className="px-6 py-4 font-bold">Trạng Thái</th>
                      <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredApplicants.length > 0 ? (
                      filteredApplicants.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/profile`} className="flex items-center gap-3 group">
                              <Avatar src={app.applicantAvatar || `https://ui-avatars.com/api/?name=${app.applicantName}`} alt={app.applicantName || "Applicant"} className="h-10 w-10 rounded-xl group-hover:ring-2 ring-brand/20 transition-all" />
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-brand transition-colors">{app.applicantName || 'Unknown'}</p>
                                <p className="text-gray-500 text-xs">{app.applicantRole || 'Job Seeker'}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-700">{app.jobTitle || 'Not specified'}</td>
                          <td className="px-6 py-4 text-gray-500 font-medium">
                            {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border-none outline-none cursor-pointer ${getStatusColor(app.status || 'new')}`}
                              defaultValue={app.status || 'new'}
                            >
                              <option value="new">Mới</option>
                              <option value="viewed">Đã xem</option>
                              <option value="shortlisted">Đã chọn lọc</option>
                              <option value="interview">Phỏng vấn</option>
                              <option value="rejected">Từ chối</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" title="Xem CV"><FileText className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" title="Nhắn tin"><MessageSquare className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 rounded-full cursor-pointer"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Không tìm thấy ứng viên nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
