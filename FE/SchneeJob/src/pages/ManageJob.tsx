import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Briefcase, MapPin, Clock, DollarSign, Users, Eye, Edit2, Trash2, MessageSquare, FileText, CheckCircle, ChevronLeft, Plus, Loader, X } from "lucide-react";
import { jobService, applicationService } from "@/services";
import type { Job } from "@/services";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  appliedDate: string;
  avatar?: string;
}

export function ManageJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applicants");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    jobRequirements: "",
    location: "",
    employmentType: "",
    salaryMin: 0,
    salaryMax: 0,
    currency: "VND",
    jobLevel: "",
    workMode: "",
    deadline: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          const response = await jobService.getById(id);
          const jobData = response.data || (response as any)?.data || null;
          setJob(jobData);
          setEditFormData({
            jobTitle: jobData?.jobTitle || jobData?.title || "",
            jobDescription: jobData?.jobDescription || jobData?.description || "",
            jobRequirements: jobData?.jobRequirements || jobData?.requirements || "",
            location: jobData?.location || "",
            employmentType: jobData?.employmentType || jobData?.type || "",
            salaryMin: jobData?.salaryMin || 0,
            salaryMax: jobData?.salaryMax || 0,
            currency: jobData?.currency || "VND",
            jobLevel: jobData?.jobLevel || "",
            workMode: jobData?.workMode || "",
            deadline: jobData?.deadline || "",
          });
          
          // Fetch applications for this job
          await fetchApplications(id);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const fetchApplications = async (jobId: string) => {
    try {
      const response = await applicationService.getForJob(jobId);
      const apps = response.data || (response as any)?.data || [];
      setApplications(
        apps.map((app: any) => ({
          id: app.applicationId || app.id,
          candidateName: app.user?.fullName || app.candidateName || "Unknown",
          candidateEmail: app.user?.email || app.candidateEmail || "",
          status: app.status || "new",
          appliedDate: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "Recently",
          avatar: app.user?.avatarURL || `https://picsum.photos/seed/${Math.random()}/100/100`,
        }))
      );
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const openEditModal = () => {
    if (job) {
      setEditFormData({
        jobTitle: job.jobTitle || job.title || "",
        jobDescription: job.jobDescription || job.description || "",
        jobRequirements: job.jobRequirements || job.requirements || "",
        location: job.location || "",
        employmentType: job.employmentType || job.type || "",
        salaryMin: job.salaryMin || 0,
        salaryMax: job.salaryMax || 0,
        currency: job.currency || "VND",
        jobLevel: job.jobLevel || "",
        workMode: job.workMode || "",
        deadline: job.deadline || "",
      });
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleJobSubmit = async () => {
    if (!job || !id) return;
    
    try {
      setIsSubmitting(true);
      await jobService.update(id, editFormData);
      alert("Job updated successfully!");
      setJob({ ...job, ...editFormData });
      closeEditModal();
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseJob = async () => {
    if (!id || !confirm("Are you sure you want to close this job posting?")) return;
    
    try {
      setIsSubmitting(true);
      await jobService.delete(id);
      alert("Job closed successfully!");
      navigate("/employer/dashboard");
    } catch (err) {
      console.error("Error closing job:", err);
      alert("Failed to close job");
      setIsSubmitting(false);
    }
  };


  // Mock linked posts
  const linkedPosts = [
    { id: 1, content: "Chúng tôi đang tìm kiếm Frontend Developer tài năng gia nhập đội ngũ! #hiring #frontend", likes: 24, comments: 5, postedAt: "2 ngày trước" }
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link to="/employer/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Bảng điều khiển
          </Link>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : !job ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Không tìm thấy công việc</p>
              <Link to="/employer/dashboard" className="text-brand hover:underline">Quay lại bảng điều khiển</Link>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">{job?.jobTitle || job?.title || 'Công việc'}</h1>
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-none">Đang hoạt động</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {job?.location || 'Vị trí'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> {job?.employmentType || job?.type || 'Loại hình'}</span>
                  <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-gray-400" /> ${job?.salaryMin || 0} - ${job?.salaryMax || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={openEditModal}
                  variant="outline" 
                  className="rounded-xl cursor-pointer"
                  disabled={isSubmitting}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                </Button>
                <Button 
                  onClick={handleCloseJob}
                  variant="destructive" 
                  className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Đang xử lý..." : "Đóng tin"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {job && (
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Lượt xem</p>
                <h3 className="text-2xl font-bold text-gray-900">{job?.views || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng ứng viên</p>
                <h3 className="text-2xl font-bold text-gray-900">{applications.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Đã chọn lọc</p>
                <h3 className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'shortlisted' || a.status === 'Đã chọn lọc').length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("applicants")}
            className={`pb-4 px-4 text-sm font-semibold transition-colors relative cursor-pointer ${activeTab === "applicants" ? "text-brand" : "text-gray-500 hover:text-gray-900"}`}
          >
            Quản Lý Ứng Viên ({applications.length})
            {activeTab === "applicants" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-4 px-4 text-sm font-semibold transition-colors relative cursor-pointer ${activeTab === "posts" ? "text-brand" : "text-gray-500 hover:text-gray-900"}`}
          >
            Bài Viết Liên Kết (1)
            {activeTab === "posts" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t-full"></span>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "applicants" && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có ứng viên nào cho công việc này</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold">Ứng Viên</th>
                        <th className="px-6 py-4 font-bold">Ngày Ứng Tuyển</th>
                        <th className="px-6 py-4 font-bold">Trạng Thái</th>
                        <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={app.avatar} alt={app.candidateName} className="h-10 w-10 rounded-xl" />
                              <div>
                                <p className="font-bold text-gray-900">{app.candidateName}</p>
                                <p className="text-gray-500 text-xs">{app.candidateEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-medium">{app.appliedDate}</td>
                          <td className="px-6 py-4">
                            <select 
                              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border-none outline-none cursor-pointer ${
                                app.status === 'new' ? 'bg-blue-50 text-blue-700' :
                                app.status === 'viewed' ? 'bg-gray-100 text-gray-700' :
                                app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700' :
                                app.status === 'interview' ? 'bg-emerald-50 text-emerald-700' :
                                'bg-red-50 text-red-700'
                              }`}
                              defaultValue={app.status}
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button className="rounded-xl cursor-pointer">
                <Plus className="h-4 w-4 mr-2" /> Tạo Bài Viết Mới
              </Button>
            </div>
            {linkedPosts.map((post) => (
              <Card key={post.id} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium">{post.postedAt}</span>
                        <span>•</span>
                        <span>{post.likes} Lượt thích</span>
                        <span>•</span>
                        <span>{post.comments} Bình luận</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand rounded-full cursor-pointer"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 rounded-full cursor-pointer"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl border-none shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Chỉnh Sửa Công Việc</CardTitle>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề công việc</label>
                <Input
                  type="text"
                  value={editFormData.jobTitle}
                  onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công việc</label>
                <textarea
                  value={editFormData.jobDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, jobDescription: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                  rows={4}
                  placeholder="Mô tả chi tiết về công việc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí</label>
                <Input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="e.g., Ho Chi Minh City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình công việc</label>
                <Input
                  type="text"
                  value={editFormData.employmentType}
                  onChange={(e) => setEditFormData({ ...editFormData, employmentType: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="e.g., Full-time, Part-time"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lương tối thiểu</label>
                  <Input
                    type="number"
                    value={editFormData.salaryMin}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryMin: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lương tối đa</label>
                  <Input
                    type="number"
                    value={editFormData.salaryMax}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryMax: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
            <div className="border-t border-gray-100 p-6 flex justify-end gap-3">
              <Button onClick={closeEditModal} variant="outline" className="rounded-lg" disabled={isSubmitting}>
                Hủy
              </Button>
              <Button 
                onClick={handleJobSubmit} 
                className="rounded-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                {isSubmitting ? "Đang cập nhật..." : "Cập Nhật"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
