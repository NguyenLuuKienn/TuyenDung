import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Briefcase, MapPin, Clock, DollarSign, Eye, Edit2, Trash2, Plus, Loader, Search, Filter } from "lucide-react";
import { jobService } from "@/services";
import Swal from "sweetalert2";

interface JobListItem {
  jobId?: string;
  id?: string;
  jobTitle?: string;
  title?: string;
  location?: string;
  employmentType?: string;
  type?: string;
  salaryMin?: number;
  minimumSalary?: number;
  salaryMax?: number;
  maximumSalary?: number;
  jobDescription?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  postedAt?: string;
  applicantsCount?: number;
  isUrgent?: boolean;
}

export function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchTerm, filterStatus]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      console.log('[MyJobs] Starting fetchMyJobs');
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('[MyJobs] Token exists:', !!token);
      if (token) {
        console.log('[MyJobs] Token preview:', token.substring(0, 50) + '...');
      }
      
      const response = await jobService.getMyJobs?.();
      
      if (!response) {
        console.warn('[MyJobs] No response from getMyJobs, using fallback');
        setJobs([]);
        return;
      }
      
      const jobsList = response.data || response || [];
      const jobs = Array.isArray(jobsList) ? jobsList : [];
      console.log('[MyJobs] Fetched jobs:', jobs.length);
      setJobs(jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      console.log('[MyJobs] Error response status:', error?.response?.status);
      console.log('[MyJobs] Error response headers:', error?.response?.headers);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải danh sách việc làm";
      console.error("Error details:", error?.response?.data);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((job) =>
        (job.jobTitle || job.title || "").toLowerCase().includes(term) ||
        (job.location || "").toLowerCase().includes(term) ||
        (job.jobDescription || job.description || "").toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((job) => (job.status || "active").toLowerCase() === filterStatus);
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async (jobId: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn chắc chắn muốn xóa việc làm này? Hành động này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        setDeleting(jobId);
        await jobService.deleteJob?.(jobId);
        setJobs(jobs.filter((job) => (job.jobId || job.id) !== jobId));
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Việc làm đã được xóa",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa việc làm",
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch ((status || "active").toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "inactive":
      case "closed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch ((status || "active").toLowerCase()) {
      case "active":
        return "Đang tuyển";
      case "inactive":
      case "closed":
        return "Đã đóng";
      case "pending":
        return "Chờ duyệt";
      default:
        return status || "Đang tuyển";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Việc Làm</h1>
              <p className="text-gray-600 mt-1">
                Tổng cộng: <span className="font-semibold">{jobs.length}</span> việc làm
              </p>
            </div>
            <Button
              onClick={() => navigate("/employer/post-job")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Tạo Việc Làm Mới
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề hoặc địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-gray-700 hover:border-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang tuyển</option>
              <option value="inactive">Đã đóng</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>
        </div>

        {/* Job List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const jobId = job.jobId || job.id || "";
              const salary = `$${job.salaryMin || job.minimumSalary || 0} - $${job.salaryMax || job.maximumSalary || 0}`;
              return (
                <Card key={jobId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-brand transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${jobId}`)}>
                              {job.jobTitle || job.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location || "Không xác định"}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {salary}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {job.employmentType || job.type || "Toàn thời gian"}
                              </span>
                            </div>
                          </div>
                          {job.isUrgent && (
                            <Badge className="bg-red-100 text-red-700 font-semibold whitespace-nowrap">
                              Tuyển Gấp
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2">
                          {job.jobDescription || job.description || "Không có mô tả"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={`border ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </Badge>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/employer/manage-job/${jobId}`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Chi Tiết</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/employer/edit-job/${jobId}`)}
                            className="gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Sửa</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(jobId)}
                            disabled={deleting === jobId}
                            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">{deleting === jobId ? "Đang xóa..." : "Xóa"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" ? "Không tìm thấy việc làm" : "Bạn chưa tạo việc làm nào"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Hãy thử thay đổi bộ lọc tìm kiếm"
                  : "Hãy tạo việc làm đầu tiên của bạn để bắt đầu tuyển dụng"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={() => navigate("/employer/post-job")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo Việc Làm
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
