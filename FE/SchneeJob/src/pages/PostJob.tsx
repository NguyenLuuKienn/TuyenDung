import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText, CheckCircle2, Loader } from "lucide-react";
import Swal from "sweetalert2";
import jobService from "@/services/jobService";

export function PostJob() {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(jobId ? true : false);
  const [isEditMode, setIsEditMode] = useState(!!jobId);
  
  // Form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    employmentType: "",
    jobLevel: "",
    location: "",
    deadline: "",
    salaryMin: "",
    salaryMax: "",
    jobDescription: "",
    jobRequirements: "",
    benefits: "",
    workMode: "onsite"
  });

  // Load job data if editing
  useEffect(() => {
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const loadJobData = async () => {
    try {
      const response = await jobService.getById(jobId!);
      const job = response.data || response;
      
      if (job) {
        setFormData({
          jobTitle: job.jobTitle || job.title || "",
          employmentType: job.employmentType || job.type || "",
          jobLevel: job.jobLevel || "",
          location: job.location || "",
          deadline: job.deadline || "",
          salaryMin: job.salaryMin || job.minimumSalary || "",
          salaryMax: job.salaryMax || job.maximumSalary || "",
          jobDescription: job.jobDescription || job.description || "",
          jobRequirements: job.jobRequirements || "",
          benefits: (job.benefits || []).join('\n') || "",
          workMode: job.workMode || "onsite"
        });
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error loading job:", error);
      Swal.fire("Lỗi", "Không thể tải dữ liệu công việc", "error").then(() => {
        navigate("/employer/my-jobs");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.jobTitle.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập tiêu đề công việc", "error");
      return;
    }
    if (!formData.employmentType) {
      Swal.fire("Lỗi", "Vui lòng chọn loại hình công việc", "error");
      return;
    }
    if (!formData.jobLevel) {
      Swal.fire("Lỗi", "Vui lòng chọn cấp bậc", "error");
      return;
    }
    if (!formData.location.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập địa điểm làm việc", "error");
      return;
    }
    if (!formData.deadline) {
      Swal.fire("Lỗi", "Vui lòng chọn hạn nộp hồ sơ", "error");
      return;
    }
    if (!formData.jobDescription.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập mô tả công việc", "error");
      return;
    }
    if (!formData.jobRequirements.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập yêu cầu ứng viên", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare job data for API
      const jobData = {
        jobTitle: formData.jobTitle.trim(),
        jobDescription: formData.jobDescription.trim(),
        jobRequirements: formData.jobRequirements.trim(),
        location: formData.location.trim(),
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : 0,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : 0,
        currency: "USD",
        jobLevel: formData.jobLevel,
        employmentType: formData.employmentType,
        workMode: formData.workMode,
        deadline: formData.deadline,
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : []
      };

      console.log(`[PostJob] ${isEditMode ? 'Updating' : 'Creating'} job data:`, jobData);
      
      // Call the job service
      let message = "";
      if (isEditMode && jobId) {
        await jobService.update(jobId, jobData);
        message = "Tin tuyển dụng của bạn đã được cập nhật thành công";
      } else {
        await jobService.create(jobData);
        message = "Tin tuyển dụng của bạn đã được đăng thành công";
      }
      
      // Success
      Swal.fire({
        title: "Thành công!",
        text: message,
        icon: "success",
        confirmButtonText: "Về Danh Sách Việc Làm"
      }).then(() => {
        navigate("/employer/my-jobs");
      });
      
    } catch (error: any) {
      console.error('[PostJob] Error creating job:', error);
      const errorMsg = error.response?.data?.message || error.message || "Không thể đăng tin tuyển dụng. Vui lòng thử lại sau.";
      Swal.fire("Lỗi", errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-brand" />
            <p className="text-gray-700">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/employer/my-jobs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Danh Sách Việc Làm
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center shadow-sm">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-gray-900">
                {isEditMode ? "Chỉnh Sửa Tin Tuyển Dụng" : "Đăng Tin Tuyển Dụng Mới"}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditMode ? "Cập nhật thông tin chi tiết tin tuyển dụng của bạn." : "Điền thông tin chi tiết để thu hút ứng viên tài năng."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Info */}
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand" /> Thông Tin Cơ Bản
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Tiêu đề công việc <span className="text-red-500">*</span></label>
                  <Input 
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="VD: Senior Frontend Developer" 
                    required 
                    className="h-12 rounded-xl border-gray-200 focus:border-brand focus:ring-brand/20" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Loại hình công việc <span className="text-red-500">*</span></label>
                    <select 
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" 
                      required
                    >
                      <option value="">Chọn loại hình</option>
                      <option value="fulltime">Toàn thời gian</option>
                      <option value="parttime">Bán thời gian</option>
                      <option value="contract">Hợp đồng</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Thực tập</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Cấp bậc <span className="text-red-500">*</span></label>
                    <select 
                      name="jobLevel"
                      value={formData.jobLevel}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors" 
                      required
                    >
                      <option value="">Chọn cấp bậc</option>
                      <option value="entry">Mới tốt nghiệp / Entry level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead / Manager</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" /> Địa điểm làm việc <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="VD: Hồ Chí Minh, Hà Nội..." 
                      required 
                      className="h-12 rounded-xl border-gray-200 focus:border-brand focus:ring-brand/20" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" /> Hạn nộp hồ sơ <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="date" 
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required 
                      className="h-12 rounded-xl border-gray-200 focus:border-brand focus:ring-brand/20" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary & Benefits */}
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" /> Mức Lương & Quyền Lợi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Mức lương tối thiểu (USD)</label>
                    <Input 
                      type="number" 
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      placeholder="VD: 1000" 
                      className="h-12 rounded-xl border-gray-200 focus:border-brand focus:ring-brand/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900">Mức lương tối đa (USD)</label>
                    <Input 
                      type="number" 
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      placeholder="VD: 2500" 
                      className="h-12 rounded-xl border-gray-200 focus:border-brand focus:ring-brand/20" 
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Để trống nếu bạn muốn hiển thị "Thỏa thuận"</p>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" /> Chi Tiết Công Việc
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Mô tả công việc <span className="text-red-500">*</span></label>
                  <textarea 
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    className="w-full min-h-[150px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-y" 
                    placeholder="Mô tả chi tiết về công việc, trách nhiệm hàng ngày..."
                    required
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Yêu cầu ứng viên <span className="text-red-500">*</span></label>
                  <textarea 
                    name="jobRequirements"
                    value={formData.jobRequirements}
                    onChange={handleInputChange}
                    className="w-full min-h-[150px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-y" 
                    placeholder="Kỹ năng, kinh nghiệm, bằng cấp yêu cầu..."
                    required
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Quyền lợi được hưởng</label>
                  <textarea 
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    className="w-full min-h-[100px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-y" 
                    placeholder="Bảo hiểm, thưởng, du lịch, môi trường làm việc... (một dòng một quyền lợi)"
                  ></textarea>
                  <p className="text-xs text-gray-500 italic">Mỗi dòng sẽ là một quyền lợi riêng</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link to="/employer/dashboard">
                <Button variant="outline" type="button" className="h-12 px-8 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-8 rounded-xl font-bold shadow-sm flex items-center gap-2">
                {isSubmitting ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> Đăng Tin Ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
