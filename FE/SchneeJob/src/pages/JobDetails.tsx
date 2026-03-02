import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Briefcase, DollarSign, Building2, Globe, Users, ChevronLeft, Bookmark, CheckCircle2, Loader } from "lucide-react";
import { jobService, companyService } from "@/services";
import type { Job, Company } from "@/services";

export function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await jobService.getById(id);
          const jobData = response.data || (response as any)?.data || null;
          setJob(jobData);
          
          // Fetch company info if we have a company ID
          if (jobData?.companyId) {
            try {
              const companyResponse = await companyService.getById(jobData.companyId);
              const companyData = companyResponse.data || (companyResponse as any)?.data || null;
              setCompany(companyData);
            } catch (err) {
              console.error('Failed to fetch company details:', err);
            }
          }
          
          // Fetch all jobs to find similar ones
          const allJobsResponse = await jobService.getAll();
          const allJobs = Array.isArray(allJobsResponse.data) 
            ? allJobsResponse.data 
            : (allJobsResponse as any)?.data || [];
          
          // Filter similar jobs (same location, employment type, or company)
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
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về kết quả tìm kiếm
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex gap-6 items-start">
              <Avatar src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={job.company?.name || "Company"} className="h-24 w-24 rounded-3xl border border-gray-100 shadow-sm" />
              <div>
                <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                  <Link to={`/company/${job.companyId}`} className="font-semibold hover:text-brand transition-colors">{job.company?.name || (typeof job.company === 'string' ? job.company : 'Công ty')}</Link>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {job.location || "Tương lượng"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-brand/5 text-brand border-none px-3 py-1.5 text-sm">{job.employmentType || job.type || "Full-time"}</Badge>
                  {job.isRemote && <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1.5 text-sm">Remote</Badge>}
                  <Badge variant="outline" className="bg-white px-3 py-1.5 text-sm border-gray-200 text-gray-600">
                    <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-400 inline" />
                    ${job.salaryMin || 0} - ${job.salaryMax || 0} {job.salaryType ? `(${job.salaryType})` : ''}
                  </Badge>
                  {job.jobLevel && (
                    <Badge variant="outline" className="bg-white px-3 py-1.5 text-sm border-gray-200 text-gray-600">
                      <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-400 inline" />
                      {typeof job.jobLevel === 'string' 
                        ? job.jobLevel 
                        : ((job.jobLevel as any)?.jobLevelName || (job.jobLevel as any)?.name || 'Level')}
                    </Badge>
                  )}
                  {job.isPriority && (
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-none px-3 py-1.5 text-sm">
                      Tuyển Gấp
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
              <Button variant="outline" size="lg" className="rounded-full shadow-sm cursor-pointer">
                <Bookmark className="h-5 w-5 mr-2" /> Lưu
              </Button>
              <Button size="lg" className="rounded-full shadow-sm px-8 cursor-pointer">
                Ứng Tuyển Ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold font-display mb-4 text-gray-900">Về vị trí này</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {job.jobDescription ? job.jobDescription : (
                    <>
                      <p>
                        Chúng tôi đang tìm kiếm một {job.title} tài năng để gia nhập đội ngũ năng động tại {job.company?.name || (typeof job.company === 'string' ? job.company : 'công ty')}. 
                        Trong vai trò này, bạn sẽ chịu trách nhiệm thiết kế, phát triển và duy trì các giải pháp phần mềm chất lượng cao 
                        đáp ứng nhu cầu kinh doanh của chúng tôi. Bạn sẽ làm việc chặt chẽ với các nhóm liên chức năng để cung cấp các sản phẩm sáng tạo 
                        thúc đẩy sự thành công của công ty.
                      </p>
                      <p className="mt-4">
                        Ứng viên lý tưởng có nền tảng vững chắc về kỹ thuật phần mềm, kỹ năng giải quyết vấn đề xuất sắc, 
                        và niềm đam mê xây dựng các hệ thống có thể mở rộng và đáng tin cậy. Nếu bạn phát triển mạnh trong một môi trường nhịp độ nhanh 
                        và mong muốn tạo ra tác động đáng kể, chúng tôi muốn nghe từ bạn!
                      </p>
                    </>
                  )}
                </div>

                <h3 className="text-lg font-bold font-display mt-8 mb-4 text-gray-900">Yêu Cầu</h3>
                <ul className="space-y-3">
                  {job.jobRequirements ? (
                    job.jobRequirements.split('\n').map((item: string, index: number) => (
                      <li key={`req-${item.substring(0, 10)}-${index}`} className="flex items-start gap-3 text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    [
                      "Bằng Cử nhân Khoa học Máy tính, Kỹ thuật hoặc lĩnh vực liên quan.",
                      `Kinh nghiệm làm việc đã được chứng minh với vai trò ${job.title} hoặc tương đương.`,
                      `Thành thạo ${job.skills.join(", ")} và các công nghệ liên quan.`,
                      "Kinh nghiệm với các phương pháp phát triển linh hoạt (Agile).",
                      "Kỹ năng giao tiếp và làm việc nhóm xuất sắc.",
                      "Khả năng làm việc độc lập và quản lý nhiều ưu tiên hiệu quả."
                    ].map((item) => (
                      <li key={`static-req-${(item.codePointAt(0) ?? 0)}-${item.length}`} className="flex items-start gap-3 text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold font-display mb-6 text-gray-900">Kỹ Năng Yêu Cầu</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills && Array.isArray(job.skills) && job.skills.map((skill, idx) => (
                    <Badge 
                      key={typeof skill === 'string' ? skill : ((skill as any)?.name || (skill as any)?.skillName || `skill-${idx}`)} 
                      variant="secondary" 
                      className="px-4 py-2 bg-gray-50 border border-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      {typeof skill === 'string' ? skill : ((skill as any)?.name || (skill as any)?.skillName || 'Skill')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-brand text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
              <CardContent className="p-8 relative z-10">
                <h3 className="font-bold font-display text-xl mb-2">Sẵn sàng ứng tuyển?</h3>
                <p className="text-blue-100 text-sm mb-6">Gia nhập {company?.name || job?.company?.name || 'công ty'} và cùng xây dựng tương lai.</p>
                <Button className="w-full bg-white text-brand hover:bg-gray-50 rounded-full font-bold cursor-pointer">
                  Ứng tuyển vị trí này
                </Button>
                <p className="text-xs text-center mt-4 text-blue-200">
                  Đã đăng {new Date(job.createdAt || job.postedAt).toLocaleDateString()}
                  {job.deadline && ` • Hạn nộp: ${new Date(job.deadline).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold font-display text-lg mb-4 text-gray-900">Về {company?.name || job?.company?.name || 'Công ty'}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar 
                    src={company?.logo || job?.company?.logo || "https://picsum.photos/seed/company/100/100"} 
                    alt={company?.name || job?.company?.name || "Company"} 
                    className="h-12 w-12 rounded-xl border border-gray-100" 
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{company?.name || job?.company?.name || 'N/A'}</h4>
                    <Link to={`/company/${job?.companyId}`} className="text-sm text-brand hover:underline">Xem Hồ Sơ</Link>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {company?.description || job?.description || 'Một công ty tuyệt vời'}
                </p>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg"><Building2 className="h-4 w-4 text-gray-400" /></div>
                    <span className="font-medium">
                      {typeof company?.industry === 'string' 
                        ? company.industry 
                        : ((company?.industry as any)?.industryName || (company?.industry as any)?.name || 'Công nghệ thông tin')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg"><Users className="h-4 w-4 text-gray-400" /></div>
                    <span className="font-medium">{company?.size || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg"><MapPin className="h-4 w-4 text-gray-400" /></div>
                    <span className="font-medium">{company?.city || company?.address || job?.location || 'N/A'}</span>
                  </div>
                  {company?.website && (
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-2 rounded-lg"><Globe className="h-4 w-4 text-gray-400" /></div>
                      <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-medium">{company.website}</a>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-6 rounded-full cursor-pointer">Theo Dõi Công Ty</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Jobs Section (Full Width) */}
        <div className="mt-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h3 className="font-bold font-display text-xl mb-6 text-gray-900 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-brand" /> Gợi Ý Công Việc Tương Tự
              </h3>
              {similarJobs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {similarJobs.map(similarJob => (
                      <div key={similarJob.id} className="flex flex-col gap-4 items-start p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-brand/30 hover:shadow-sm">
                        <Avatar src={similarJob.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={similarJob.company?.name || "Company"} className="h-12 w-12 rounded-xl border border-gray-100 shadow-sm" />
                        <div className="w-full">
                          <Link to={`/jobs/${similarJob.id}`} className="font-bold text-gray-900 hover:text-brand transition-colors line-clamp-1">{similarJob.title}</Link>
                          <p className="text-sm text-gray-500 mt-1">{similarJob.company?.name || "Company"}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-medium text-gray-600">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><MapPin className="h-3 w-3" /> {similarJob.location}</span>
                            {!!(similarJob.salaryMin || similarJob.salaryMax) && (
                              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md"><DollarSign className="h-3 w-3" /> ${similarJob.salaryMin} - ${similarJob.salaryMax}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="rounded-full px-8 cursor-pointer">Xem tất cả gợi ý</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Không tìm thấy công việc tương tự</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
