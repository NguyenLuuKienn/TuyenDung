import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapPin, Globe, Users, Building2, Star, Heart, MessageCircle, Sparkles, ChevronLeft, Loader } from "lucide-react";
import { companyService, jobService, postService } from "@/services";
import type { Company, Job, Post } from "@/services";

export function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const companyResponse = await companyService.getById(id);
          const companyData = companyResponse.data || (companyResponse as any)?.data || null;
          setCompany(companyData);
          
          const jobsResponse = await jobService.getByCompanyId(id);
          const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
          setJobs(jobsData);
          
          const postsResponse = await postService.getAll();
          const allPosts = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse as any)?.data || [];
          const companyPosts = allPosts.filter((p: Post) => p.author?.companyId === id);
          setPosts(companyPosts);
        }
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin công ty. Vui lòng thử lại sau.");
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getIndustryName = (industry: any) => {
    if (typeof industry === 'string') return industry;
    if (industry?.name) return industry.name;
    return 'Công nghệ';
  };

  if (loading) {
    return (
      <div className="bg-gray-50/50 min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-gray-50/50 min-h-screen">
        <div className="container mx-auto px-4 py-32 max-w-6xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-600">{error || "Không tìm thấy công ty."}</p>
              <Link to="/companies" className="text-sm text-red-700 hover:underline mt-4 block">
                Trở về danh sách công ty
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="relative h-64 md:h-80 w-full bg-gray-900">
        <img src={company.coverImage || "https://picsum.photos/seed/company-cover/1200/400"} alt="Cover" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent"></div>
        <div className="absolute top-6 left-6">
          <Link to="/companies" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-md transition-colors">
            <ChevronLeft className="h-4 w-4" /> Trở về danh sách
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <Avatar src={company.logo} alt={company.name} className="h-32 w-32 rounded-3xl border-4 border-white shadow-lg bg-white" />
              <div className="pb-2">
                <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gray-400" /> {getIndustryName(company.industry)}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {company.location || "Tương lượng"}</span>
                  {company.rating && (
                    <span className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="h-4 w-4 fill-current" /> {company.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto pb-2">
              <Button variant="outline" className="flex-1 md:flex-none rounded-full cursor-pointer">Theo Dõi</Button>
              <Button className="flex-1 md:flex-none rounded-full px-8 cursor-pointer">Xem Việc Làm</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-4">Về Chúng Tôi</h2>
                <p className="text-gray-600 leading-relaxed">{company.description}</p>
              </CardContent>
            </Card>

            {posts.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-brand" /> Cập Nhật Mới Nhất
                </h2>
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-none shadow-sm">
                    <CardHeader className="p-6 pb-2 space-y-0 flex flex-row items-center gap-3">
                      <Avatar src={post.author?.avatar || "https://picsum.photos/seed/user1/100/100"} alt={post.author?.name || "User"} className="h-12 w-12 rounded-xl" />
                      <div>
                        <p className="font-bold text-gray-900">{post.author?.name || "Công ty"}</p>
                        <p className="text-xs text-gray-500">{new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-500">
                        <button className="flex items-center gap-2 hover:text-brand transition-colors group">
                          <Heart className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-brand transition-colors group">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.comments || 0}</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-display text-gray-900">
                Vị Trí Đang Tuyển ({jobs.length})
              </h2>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="group hover:border-brand/30 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <Link to={`/jobs/${job.id}`} className="text-lg font-bold font-display text-gray-900 group-hover:text-brand transition-colors">
                              {job.title}
                            </Link>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 font-medium">
                              <span><MapPin className="h-4 w-4 text-gray-400 inline mr-1" />{job.location}</span>
                              <span>{job.employmentType}</span>
                            </div>
                          </div>
                          <Link to={`/jobs/${job.id}`}>
                            <Button className="rounded-full cursor-pointer">Chi Tiết</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-none shadow-sm bg-gray-50">
                  <CardContent className="p-8 text-center text-gray-500">
                    Không có vị trí nào đang tuyển
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <h3 className="font-bold font-display text-lg mb-6 text-gray-900">Tổng Quan</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">Website</p>
                      {company.website && typeof company.website === 'string' && (
                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline text-sm">
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">Quy Mô</p>
                      <p>{company.size || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">Ngành</p>
                      <p>{getIndustryName(company.industry)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {Array.isArray(company.techStack) && company.techStack.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-8">
                  <h3 className="font-bold font-display text-lg mb-4 text-gray-900">Công Nghệ</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.techStack.map(tech => (
                      <Badge key={tech} variant="secondary" className="bg-brand/10 text-brand">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
