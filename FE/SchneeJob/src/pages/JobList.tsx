import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Briefcase, DollarSign, Bookmark, Search, Filter, ChevronLeft, Loader } from "lucide-react";
import { jobService } from "@/services";
import type { Job } from "@/services";

export function JobList() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUrgent = searchParams.get("urgent") === "true";
  const isImmediate = searchParams.get("immediate") === "true";

  let title = "Tất Cả Việc Làm";
  let description = "Khám phá hàng ngàn cơ hội việc làm mới nhất.";

  if (isUrgent) {
    title = "Việc Làm Tuyển Gấp";
    description = "Các vị trí đang cần ứng viên gấp, phỏng vấn ngay.";
  } else if (isImmediate) {
    title = "Việc Làm Đi Làm Ngay";
    description = "Bắt đầu công việc mới của bạn ngay trong tuần tới.";
  }

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAll();
        const jobsData = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError("Không thể tải việc làm. Vui lòng thử lại sau.");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl">{description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm việc làm, công ty, kỹ năng..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all"
            />
          </div>
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 gap-2 cursor-pointer shrink-0">
            <Filter className="h-4 w-4" />
            Bộ lọc nâng cao
          </Button>
        </div>

        {/* Job List */}
        <div className="space-y-4">
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
          ) : jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không tìm thấy việc làm.</p>
          ) : jobs.map((job) => (
              <Card key={job.id} className="group hover:border-brand/30 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="shrink-0">
                      <Avatar src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={job.company?.name || "Company"} className="h-16 w-16 rounded-2xl border border-gray-100 shadow-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <Link to={`/jobs/${job.id}`} className="text-xl font-bold font-display text-gray-900 group-hover:text-brand transition-colors">
                            {job.title}
                          </Link>
                          <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-600">
                            <Link to={`/company/${job.companyId}`} className="font-medium hover:text-brand transition-colors">
                              {typeof job.company === 'string' ? job.company : job.company?.name || 'Company'}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {job.location || "Tương lượng"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand hover:bg-brand/10 rounded-full cursor-pointer">
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                          <Briefcase className="h-4 w-4 text-brand" />
                          <span>{job.employmentType || job.type || "Full-time"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span>${job.salaryMin || 0} - ${job.salaryMax || 0}</span>
                        </div>
                        {job.isRemote && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-emerald-700">
                            <span>Làm từ xa</span>
                          </div>
                        )}
                        {job.isPriority && (
                          <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-700">
                            <span>Tuyển Gấp</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-500 font-medium">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Link to={`/jobs/${job.id}`}>
                        <Button size="sm" className="rounded-full px-6 cursor-pointer">Ứng Tuyển</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          }
        </div>
      </div>
    </div>
  );
}
