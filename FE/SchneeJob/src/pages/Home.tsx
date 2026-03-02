import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Bookmark, Clock, DollarSign, Heart, MessageCircle, Share2, Sparkles, Send, Filter, ChevronDown, Zap, Building2, Star, Users, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { jobService, postService } from "@/services";
import type { Job, Post } from "@/services";

export function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Fetch jobs and posts on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, postsResponse] = await Promise.all([
          jobService.getAll(),
          postService.getAll()
        ]);
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
        const postsData = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse as any)?.data || [];
        setAllJobs(jobsData);
        setJobs(jobsData);
        setPosts(postsData);
        setError(null);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const filtered = allJobs.filter(job => 
      (job.title || job.jobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setJobs(filtered);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const submitComment = (postId: string) => {
    if (!commentInputs[postId]?.trim()) return;
    // In a real app, this would send to an API
    alert(`Đã gửi bình luận: ${commentInputs[postId]}`);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="flex flex-col bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand px-4 py-24 text-white">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern/1920/1080')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-hover/50 blur-3xl"></div>
        
        <div className="container relative mx-auto max-w-5xl text-center z-10">
          <Badge variant="outline" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-2" /> Hơn 10,000+ việc làm IT đang chờ bạn
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl font-display">
            Tìm kiếm <span className="text-emerald-400">công việc mơ ước</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100/90 font-medium">
            Kết nối với các công ty hàng đầu, khám phá môi trường làm việc phù hợp và xây dựng sự nghiệp công nghệ của bạn.
          </p>
          
          <form onSubmit={handleSearch} className="mx-auto flex max-w-4xl flex-col gap-3 rounded-3xl bg-white/10 p-3 backdrop-blur-md shadow-2xl sm:flex-row border border-white/20">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-5 py-3 text-gray-900 shadow-inner">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Chức danh hoặc từ khóa"
                className="w-full bg-transparent outline-none placeholder:text-gray-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-5 py-3 text-gray-900 shadow-inner">
              <MapPin className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Thành phố hoặc làm từ xa"
                className="w-full bg-transparent outline-none placeholder:text-gray-400 font-medium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-0 h-auto py-3 px-8 text-base cursor-pointer">
              Tìm Kiếm
            </Button>
          </form>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-blue-100">
            <span className="opacity-80">Xu hướng:</span>
            {['Frontend', 'React', 'Node.js', 'Làm từ xa'].map(tag => (
              <button key={tag} className="rounded-full bg-white/10 px-4 py-1.5 hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm font-medium cursor-pointer">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Feed */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold font-display text-gray-900">Cập Nhật Từ Công Ty</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-brand" />
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-gray-100">
                    <CardHeader className="p-5 pb-2 sm:p-5 sm:pb-2 space-y-0 flex flex-row items-center gap-3">
                      <Avatar src={post.author?.avatar || "https://picsum.photos/seed/user1/100/100"} alt={post.author?.name || "User"} className="h-10 w-10 ring-2 ring-gray-50" />
                      <div>
                        <Link to={`/company/${(post.author?.companyId) || 0}`} className="font-bold text-gray-900 hover:text-brand transition-colors">
                          {(post.companyName) || post.author?.name || "Công ty"}
                        </Link>
                        <p className="text-xs text-gray-500">{new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 sm:p-5 sm:pt-0">
                      <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                      {(post.image || post.imageUrl) && (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-gray-100">
                          <img src={post.image || post.imageUrl} alt="Post attachment" className="w-full h-auto object-cover max-h-64" />
                        </div>
                      )}
                      <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-500">
                        <button className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer">
                          <div className="p-2 rounded-full group-hover:bg-brand/10 transition-colors">
                            <Heart className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{post.likes || post.likesCount || 0}</span>
                        </button>
                        <button 
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          <div className="p-2 rounded-full group-hover:bg-brand/10 transition-colors">
                            <MessageCircle className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{post.comments || post.commentsCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-brand transition-colors group ml-auto cursor-pointer">
                          <div className="p-2 rounded-full group-hover:bg-brand/10 transition-colors">
                            <Share2 className="h-5 w-5" />
                          </div>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <div className="space-y-4 mb-4">
                            {/* Comment placeholder */}
                            <div className="flex gap-3">
                              <Avatar src="https://picsum.photos/seed/user1/100/100" className="h-8 w-8" />
                              <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                <p className="font-semibold text-sm text-gray-900">Nguyễn Văn A</p>
                                <p className="text-sm text-gray-700 mt-1">Bài viết rất hữu ích, cảm ơn công ty đã chia sẻ!</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar src="https://picsum.photos/seed/myuser/100/100" className="h-8 w-8" />
                            <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all">
                              <input 
                                type="text" 
                                placeholder="Viết bình luận..." 
                                className="flex-1 bg-transparent outline-none text-sm"
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                              />
                              <button 
                                onClick={() => submitComment(post.id)}
                                className="text-brand hover:text-brand-hover p-1 cursor-pointer"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Jobs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold font-display text-gray-900">Việc Làm Đề Xuất</h2>
                <p className="text-sm text-gray-500 mt-1">Dựa trên hồ sơ của bạn</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                  <button className="px-4 py-1.5 text-sm font-semibold bg-gray-100 text-gray-900 rounded-lg cursor-pointer">Dành Cho Bạn</button>
                  <button className="px-4 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer">Gần Đây</button>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-600 gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors cursor-pointer">
                Địa điểm <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors cursor-pointer">
                Mức lương <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors cursor-pointer">
                Kinh nghiệm <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors cursor-pointer">
                Ngành nghề <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không tìm thấy việc làm phù hợp.</p>
              ) : (
                jobs.map((job) => (
                  <Card key={job.jobId || job.id} className="group hover:border-brand/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex-shrink-0">
                          <Avatar src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} alt={job.company?.name || "Company"} className="h-16 w-16 rounded-2xl border border-gray-100 shadow-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <Link to={`/jobs/${job.jobId || job.id}`} className="text-xl font-bold font-display text-gray-900 group-hover:text-brand transition-colors">
                                {job.jobTitle || job.title}
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
                          {job.salaryMin && job.salaryMax && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                              <DollarSign className="h-4 w-4 text-emerald-500" />
                              <span>${job.salaryMin} - ${job.salaryMax}</span>
                            </div>
                          )}
                          {job.workMode === 'Remote' && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-emerald-700">
                              <span>Làm từ xa</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {(job.jobSkills || job.skills) && (job.jobSkills || job.skills).slice(0, 3).map((skill: any) => (
                              <Badge key={typeof skill === 'string' ? skill : skill.name} variant="secondary" className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                                {typeof skill === 'string' ? skill : skill.name}
                              </Badge>
                            ))}
                            {(job.jobSkills || job.skills) && (job.jobSkills || job.skills).length > 3 && (
                              <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-500 font-medium">
                                +{(job.jobSkills || job.skills).length - 3}
                              </Badge>
                            )}
                          </div>
                          <Link to={`/jobs/${job.jobId || job.id}`}>
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
            
            <div className="pt-4 flex justify-center">
              <Button variant="outline" className="rounded-full px-8 cursor-pointer">Xem Tất Cả Việc Làm</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Jobs Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" /> Việc Làm Tuyển Gấp
              </h2>
              <p className="text-gray-500 mt-1">Các vị trí đang cần ứng viên gấp, phỏng vấn ngay.</p>
            </div>
            <Link to="/jobs?urgent=true" className="text-brand font-medium hover:underline hidden sm:block">Xem tất cả</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 3).map((job) => (
              <Card key={`urgent-${job.jobId || job.id}`} className="group hover:border-amber-200 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-xl z-10">
                  Tuyển Gấp
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar src={(typeof job.company === 'string' ? '' : job.company?.logo) || job.logo || "https://picsum.photos/seed/company/100/100"} alt={typeof job.company === 'string' ? job.company : job.company?.name || 'Company'} className="h-12 w-12 rounded-xl border border-gray-100" />
                    <div>
                      <Link to={`/jobs/${job.jobId || job.id}`} className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {job.jobTitle || job.title}
                      </Link>
                      <Link to={`/company/${job.companyId}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        {typeof job.company === 'string' ? job.company : job.company?.name || 'Company'}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {job.location || 'Remote'}</div>
                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center gap-1 font-medium text-emerald-600"><DollarSign className="h-4 w-4" /> ${job.salaryMin} - ${job.salaryMax}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(job.jobSkills || job.skills || []).slice(0, 3).map((skill: any) => (
                      <Badge key={typeof skill === 'string' ? skill : skill.name || skill} variant="secondary" className="bg-gray-50 text-gray-600 font-medium">
                        {typeof skill === 'string' ? skill : skill.name || skill}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/jobs/${job.jobId || job.id}`}>
                    <Button className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer">Ứng Tuyển Ngay</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate Start Jobs Section */}
      <section className="bg-gray-50/50 py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-500" /> Việc Làm Đi Làm Ngay
              </h2>
              <p className="text-gray-500 mt-1">Bắt đầu công việc mới của bạn ngay trong tuần tới.</p>
            </div>
            <Link to="/jobs?immediate=true" className="text-brand font-medium hover:underline hidden sm:block">Xem tất cả</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(2, 5).map((job) => (
              <Card key={`immediate-${job.id}`} className="group hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar src={job.company?.logo || job.logo || "https://picsum.photos/seed/company/100/100"} alt={typeof job.company === 'string' ? job.company : job.company?.name || 'Company'} className="h-12 w-12 rounded-xl border border-gray-100" />
                    <div>
                      <Link to={`/jobs/${job.jobId || job.id}`} className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {job.jobTitle || job.title}
                      </Link>
                      <Link to={`/company/${job.companyId}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        {typeof job.company === 'string' ? job.company : job.company?.name || 'Company'}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {job.location}</div>
                    <div className="flex items-center gap-1 font-medium text-emerald-600"><DollarSign className="h-4 w-4" /> ${job.salaryMin} - ${job.salaryMax}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-gray-50 text-gray-600 font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer">Xem Chi Tiết</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-gray-900 mb-4">Công Ty Nổi Bật</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Khám phá cơ hội nghề nghiệp tại các công ty công nghệ hàng đầu với môi trường làm việc tuyệt vời.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "TechCorp Inc.", logo: "https://logo.clearbit.com/google.com", cover: "https://picsum.photos/seed/techcorp_cover/400/200", industry: "Công nghệ thông tin", location: "Hồ Chí Minh", employees: "1000+", jobs: 12, rating: 4.8 },
              { name: "Global Solutions", logo: "https://logo.clearbit.com/microsoft.com", cover: "https://picsum.photos/seed/global_cover/400/200", industry: "Phần mềm", location: "Hà Nội", employees: "500-1000", jobs: 8, rating: 4.5 },
              { name: "InnovateTech", logo: "https://logo.clearbit.com/apple.com", cover: "https://picsum.photos/seed/innovate_cover/400/200", industry: "Phần cứng", location: "Đà Nẵng", employees: "100-500", jobs: 5, rating: 4.9 },
              { name: "DataSystems", logo: "https://logo.clearbit.com/amazon.com", cover: "https://picsum.photos/seed/data_cover/400/200", industry: "Dữ liệu lớn", location: "Hồ Chí Minh", employees: "1000+", jobs: 15, rating: 4.6 },
            ].map((company, i) => (
              <Card key={`company-${company.name}`} className="group hover:border-brand/30 hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-100">
                <div className="h-24 w-full relative overflow-hidden">
                  <img src={company.cover} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <CardContent className="p-5 pt-0 relative">
                  <div className="absolute -top-10 left-5 h-16 w-16 rounded-2xl border-4 border-white bg-white shadow-sm overflow-hidden">
                    <img src={company.logo} alt={company.name} className="h-full w-full object-contain p-1" />
                  </div>
                  <div className="pt-8">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{company.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {company.industry}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {company.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đánh giá</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-bold text-sm text-gray-900">{company.rating}</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quy mô</span>
                        <div className="flex items-center gap-1 text-gray-900">
                          <Users className="h-3.5 w-3.5 text-brand" />
                          <span className="font-bold text-sm">{company.employees}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/company/${i}`}>
                      <Button variant="outline" className="w-full rounded-xl group-hover:bg-brand group-hover:text-white group-hover:border-brand hover:!bg-brand-hover hover:!text-white transition-colors cursor-pointer font-semibold">
                        {company.jobs} Việc làm đang tuyển
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
