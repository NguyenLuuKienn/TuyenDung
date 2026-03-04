import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Briefcase, DollarSign, Clock, Users, ChevronLeft, Heart, Send, Flag, Loader, GraduationCap, Share2 } from "lucide-react";
import { jobService, companyService, savedJobService, applicationService, resumeService } from "@/services";
import type { Job, Company } from "@/services";
import type { Resume } from "@/services/resumeService";
import Swal from "sweetalert2";

export function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Apply/Save states
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await jobService.getById(id);
          const jobData = response.data || (response as any)?.data || null;
          setJob(jobData);
          
          // Check if job is already saved
          try {
            const savedJobsResponse = await savedJobService.getMySavedJobs();
            const savedJobs = Array.isArray(savedJobsResponse.data) 
              ? savedJobsResponse.data 
              : [];
            const isSaved = savedJobs.some((savedJob: any) => savedJob.jobId === id || savedJob.id === id);
            setIsJobSaved(isSaved);
          } catch (err) {
            console.warn('Failed to check saved status:', err);
            setIsJobSaved(false);
          }
          
          // Fetch company info
          if (jobData?.companyId) {
            try {
              const companyResponse = await companyService.getById(jobData.companyId);
              const companyData = companyResponse.data || (companyResponse as any)?.data || null;
              setCompany(companyData);
            } catch (err) {
              console.error('Failed to fetch company details:', err);
            }
          }
          
          // Fetch similar jobs
          const allJobsResponse = await jobService.getAll();
          const allJobs = Array.isArray(allJobsResponse.data) 
            ? allJobsResponse.data 
            : (allJobsResponse as any)?.data || [];
          
          const similar = allJobs.filter((j: Job) => 
            j.id !== id && (
              j.location === jobData?.location || 
              j.employmentType === jobData?.employmentType ||
              j.companyId === jobData?.companyId
            )
          ).slice(0, 4);
          
          setSimilarJobs(similar);
        }
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin việc làm. Vui lòng thử lại sau.");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await resumeService.getMyResumes();
        const resumeData = Array.isArray(res.data) ? res.data : [];
        setResumes(resumeData);
      } catch (err) {
        console.warn('Failed to fetch resumes:', err);
        setResumes([]);
      }
    };

    fetchResumes();
  }, []);

  const handleSaveJob = async () => {
    try {
      setIsSaving(true);
      if (isJobSaved) {
        // Remove from saved
        await savedJobService.unsave(id);
        setIsJobSaved(false);
        Swal.fire('Thành công', 'Đã bỏ lưu công việc', 'success');
      } else {
        // Add to saved
        await savedJobService.save(id);
        setIsJobSaved(true);
        Swal.fire('Thành công', 'Đã lưu công việc', 'success');
      }
    } catch (err) {
      console.error('Failed to save/unsave job:', err);
      Swal.fire('Lỗi', 'Không thể lưu công việc này', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyForJob = async () => {
    if (!selectedResumeId) {
      Swal.fire('Vui lòng chọn hồ sơ', '', 'warning');
      return;
    }

    try {
      setIsApplying(true);
      await applicationService.applyForJob(id, selectedResumeId, '');
      Swal.fire('Thành công', 'Bạn đã ứng tuyển thành công', 'success');
      setShowApplyModal(false);
      setSelectedResumeId(null);
    } catch (err) {
      console.error('Failed to apply for job:', err);
      Swal.fire('Lỗi', 'Không thể ứng tuyển. Vui lòng thử lại sau.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50/50 min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-gray-50/50 min-h-screen flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardContent className="p-6">
            <p className="text-red-600">{error || "Không tìm thấy việc làm."}</p>
            <Link to="/" className="text-sm text-red-700 hover:underline mt-4 block">
              Trở về trang chủ
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-brand transition-colors">Trang Chủ</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-brand transition-colors">Việc Làm</Link>
          <span>/</span>
          <span className="hover:text-brand transition-colors cursor-pointer">{job.company?.name || 'Công ty'}</span>
          <span>/</span>
          <span className="text-gray-400">{job.jobTitle || job.title || 'Job'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">{job.jobTitle || job.title || 'Job'}</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mức lương</p>
                      <p className="font-semibold text-blue-600">${job.salaryMin || 0} - ${job.salaryMax || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Khu vực tuyển</p>
                      <p className="font-semibold text-gray-900">{job.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kinh nghiệm</p>
                      <p className="font-semibold text-gray-900">{job.experience || job.yearsRequired || "1 năm"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trình độ</p>
                      <p className="font-semibold text-gray-900">{job.educationLevel || "Cao đẳng"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-8 bg-gray-50 p-3 rounded-lg w-fit">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Hạn nộp hồ sơ: <span className="font-semibold text-gray-900">{job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'N/A'}</span></span>
                  <span className="text-gray-300">•</span>
                  <span className="text-blue-600 font-medium">Hãy là người đầu tiên nộp hồ sơ!</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1 rounded-xl bg-[#4A148C] hover:bg-[#380b6e] text-white py-6 text-lg font-bold cursor-pointer" 
                    onClick={() => setShowApplyModal(true)}
                    disabled={isApplying}
                  >
                    <Send className="h-5 w-5 mr-2" /> {isApplying ? 'Đang xử lý...' : 'Ứng tuyển ngay'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl bg-purple-50 text-[#4A148C] border-none hover:bg-purple-100 py-6 text-lg font-bold cursor-pointer"
                    onClick={handleSaveJob}
                    disabled={isSaving}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isJobSaved ? 'fill-current' : ''}`} /> {isJobSaved ? 'Đã lưu' : 'Lưu công việc này'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Mô tả công việc</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line mb-8">
                  {job.jobDescription || 'Mô tả công việc sẽ cập nhật sớm.'}
                </div>

                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Yêu cầu công việc</h2>
                <ul className="space-y-3 mb-8 list-disc pl-5 text-gray-600 marker:text-gray-400">
                  {job.jobRequirements ? (
                    job.jobRequirements.split('\n').filter((item: string) => item.trim()).map((item: string, index: number) => (
                      <li key={`req-${index}-${item.substring(0, 10)}`}>{item}</li>
                    ))
                  ) : (
                    <li>Yêu cầu sẽ cập nhật sớm.</li>
                  )}
                </ul>

                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Quyền lợi</h2>
                <ul className="space-y-3 mb-8 list-disc pl-5 text-gray-600 marker:text-gray-400">
                  <li>Mức lương cạnh tranh và thưởng hiệu suất.</li>
                  <li>Bảo hiểm sức khỏe toàn diện.</li>
                  <li>Môi trường làm việc linh hoạt và cơ hội làm việc từ xa.</li>
                  <li>Cơ hội phát triển nghề nghiệp và đào tạo liên tục.</li>
                  <li>Môi trường làm việc thân thiện, năng động và sáng tạo.</li>
                </ul>

                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Thông tin chung</h2>
                <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ngày đăng</p>
                    <p className="font-semibold text-gray-900">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cấp bậc</p>
                    <p className="font-semibold text-gray-900">{job.jobLevel || "Nhân viên"}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 h-px bg-gray-200"></div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Số lượng tuyển</p>
                    <p className="font-semibold text-gray-900">{job.numberOfPositions || '1'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hình thức làm việc</p>
                    <p className="font-semibold text-gray-900">{job.employmentType || "Toàn thời gian cố định"}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 h-px bg-gray-200"></div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Yêu cầu bằng cấp</p>
                    <p className="font-semibold text-gray-900">{job.educationLevel || "Cao đẳng"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Yêu cầu kinh nghiệm</p>
                    <p className="font-semibold text-gray-900">{job.experience || job.yearsRequired || "1 năm"}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 h-px bg-gray-200"></div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Ngành nghề</p>
                    <p className="font-semibold text-blue-600">
                      {typeof job.industry === 'string' 
                        ? job.industry 
                        : ((job.industry as unknown as any)?.industryName || (job.industry as unknown as any)?.name || 'N/A')}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Địa điểm làm việc</h2>
                <div className="flex items-start gap-2 mb-8">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-gray-600"><span className="font-semibold text-[#4A148C]">{job.location}:</span> {job.location || 'Không xác định'}</p>
                </div>

                <div className="h-px bg-gray-100 w-full mb-8"></div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Từ khoá</p>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills && Array.isArray(job.skills) ? job.skills : []).map((skill: string, idx: number) => (
                      <Badge key={`${skill}-${idx}`} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none font-normal px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">Chia sẻ</span>
                    <button className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                    </button>
                    <button className="h-8 w-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="ghost" className="text-[#4A148C] hover:text-[#380b6e] hover:bg-purple-50 font-semibold cursor-pointer">
                    <Flag className="h-4 w-4 mr-2" /> Báo xấu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 mx-auto mb-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                  <Avatar 
                    src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} 
                    alt={job.company?.name || "Company"} 
                    className="h-16 w-16 rounded-none"
                  />
                </div>
                <h3 className="font-bold font-display text-lg mb-4 text-gray-900 uppercase">{job.company?.name || company?.name || 'Công ty'}</h3>
                <div className="space-y-3 text-sm text-gray-600 text-left mb-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <span><span className="font-semibold text-gray-900">Địa chỉ:</span> {company?.address || job.location || 'Không xác định'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <span><span className="font-semibold text-gray-900">Quy mô:</span> {company?.size || company?.companySize || 'N/A'}</span>
                  </div>
                </div>
                <Link to={`/company/${job.companyId || company?.id || ''}`} className="text-blue-500 font-semibold hover:underline flex items-center justify-center gap-1">
                  Xem trang công ty <ChevronLeft className="h-4 w-4 rotate-180" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold font-display text-lg mb-4 text-gray-900 text-center">Việc làm tương tự cho bạn</h3>
                <div className="space-y-4">
                  {similarJobs.length > 0 ? (
                    similarJobs.map(similarJob => (
                      <div key={similarJob.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white group">
                        <div className="flex items-start justify-between mb-2">
                          <Link to={`/jobs/${similarJob.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 pr-4">{similarJob.jobTitle || similarJob.title || 'Job'}</Link>
                          <button className="text-blue-400 hover:text-blue-600 shrink-0 cursor-pointer">
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar 
                            src={similarJob.company?.logo || "https://picsum.photos/seed/company/60/60"} 
                            alt={similarJob.company?.name || "Company"} 
                            className="h-8 w-8 rounded border border-gray-100"
                          />
                          <p className="text-sm text-gray-500 line-clamp-1">{similarJob.company?.name || "Company"}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className="font-semibold">${similarJob.salaryMin || 0} - ${similarJob.salaryMax || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{similarJob.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                          {similarJob.isPriority ? (
                            <span className="flex items-center gap-1 text-red-500 font-semibold">
                              🔥 HOT
                            </span>
                          ) : <span></span>}
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3.5 w-3.5" /> {similarJob.deadline ? Math.ceil((new Date(similarJob.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0} ngày
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không tìm thấy công việc tương tự</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-2xl border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Ứng Tuyển Vị Trí</h3>
              <p className="text-sm text-gray-600 mb-4">{job?.jobTitle || job?.title || 'Job'}</p>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Chọn hồ sơ của bạn:</h4>
              
              {resumes.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {resumes.map((resume) => {
                      const resumeId = resume.id || resume.resumeId || '';
                      const isSelected = selectedResumeId === resumeId;
                      const dateStr = resume.createdAt 
                        ? new Date(resume.createdAt).toLocaleDateString('vi-VN')
                        : 'Ngày không xác định';
                      return (
                        <button
                          key={resumeId}
                          onClick={() => setSelectedResumeId(resumeId)}
                          className={`w-full p-4 border-2 rounded-xl cursor-pointer transition-all text-left ${
                            isSelected
                              ? 'border-brand bg-brand/5'
                              : 'border-gray-100 hover:border-brand/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{resume.title || 'Hồ sơ không tên'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Ngày tạo: {dateStr}
                              </p>
                            </div>
                            {resume.isDefault && (
                              <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none px-2 py-0.5 text-xs">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-full"
                      onClick={() => setShowApplyModal(false)}
                    >
                      Hủy
                    </Button>
                    <Button 
                      className="flex-1 rounded-full"
                      onClick={handleApplyForJob}
                      disabled={isApplying || !selectedResumeId}
                    >
                      {isApplying ? 'Đang gửi...' : 'Ứng Tuyển'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Bạn chưa có hồ sơ nào. Vui lòng tạo hồ sơ trước.</p>
                  <Button 
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Đóng
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
