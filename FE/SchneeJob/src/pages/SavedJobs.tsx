import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Briefcase, DollarSign, Bookmark, Trash2, ChevronLeft, Loader } from "lucide-react";
import { savedJobService } from "@/services";
import type { Job } from "@/services";

export function SavedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        const response = await savedJobService.getMySavedJobs();
        const jobsData = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError("Không thể tải việc làm đã lưu. Vui lòng thử lại sau.");
        console.error("Error fetching saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      await savedJobService.unsave(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error("Error removing saved job:", err);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">Việc Làm Đã Lưu</h1>
          <p className="text-lg text-gray-600 max-w-2xl">Quản lý các cơ hội việc làm bạn đang quan tâm.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Bạn chưa lưu việc làm nào.</p>
                <Link to="/">
                  <Button className="mt-4 rounded-full">Khám Phá Việc Làm</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="group hover:border-brand/30 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-shrink-0">
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
                              {job.company?.name || job.company}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {job.location || "Tương lượng"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer" 
                            title="Bỏ lưu"
                            onClick={() => handleUnsave(job.id)}
                          >
                            <Trash2 className="h-5 w-5" />
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
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {job.skills && job.skills.slice(0, 3).map(skill => (
                            <Badge key={typeof skill === 'string' ? skill : skill.name} variant="secondary" className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                              {typeof skill === 'string' ? skill : skill.name}
                            </Badge>
                          ))}
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
          )}
        </div>
      </div>
    </div>
  );
}
