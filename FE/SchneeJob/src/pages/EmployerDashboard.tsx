import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Briefcase, 
  Users, 
  Eye, 
  Plus, 
  MapPin, 
  Bell, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Timer,
  ArrowUpRight,
  Target,
  Zap,
  Loader,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { jobService, companyService, postService } from '@/services';
import api from '@/services/api';
import type { Job, Company, Post } from '@/services';

export function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const companyResponse = await companyService.getMyCompany();
        const companyData = companyResponse.data || (companyResponse as any)?.data || null;
        setCompany(companyData);
        
        // Fetch Jobs for the company
        const jobsResponse = await jobService.getAll();
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse as any)?.data || [];
        
        // Ensure companyId comparison is robust
        const cid = companyData?.id || companyData?.companyId;
        const filteredJobs = jobsData.filter((job: Job) => (job.companyId === cid || (job as any).CompanyId === cid));
        setJobs(filteredJobs);
        
        // Fetch Posts for the company
        if (cid) {
          try {
            const postsResponse = await postService.getByCompany(cid);
            const postsData = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse as any)?.data || [];
            setPosts(postsData);
          } catch (postErr) {
            console.error('Failed to load posts:', postErr);
          }
        }

        try {
          const appsResponse = await api.get('/applications/employer');
          const allApplications = Array.isArray(appsResponse.data) 
            ? appsResponse.data 
            : (appsResponse as any)?.data || [];
          
          const sortedApplications = allApplications.sort((a: any, b: any) => 
            new Date(b.appliedDate || b.AppliedDate).getTime() - new Date(a.appliedDate || a.AppliedDate).getTime()
          );
          
          setApplications(sortedApplications);
        } catch (appErr) {
          console.error('Failed to load applications:', appErr);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#f8f9fa]'>
        <div className='text-center'>
          <Loader className='h-10 w-10 animate-spin text-[#411c96] mx-auto mb-4' />
          <p className='text-gray-500 font-medium'>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#f8f9fa] min-h-screen pb-20 font-sans'>
      <div className='bg-gradient-to-r from-[#411c96] to-[#5b2cbb] pt-10 pb-24 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl'></div>

        <div className='container mx-auto px-4 max-w-7xl relative z-10'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
            <div className='flex items-center gap-5'>
              <div className='relative'>
                <Avatar 
                  src={company?.logo || 'https://picsum.photos/seed/company/200/200'} 
                  alt={company?.name} 
                  className='h-24 w-24 rounded-2xl border-4 border-white/20 shadow-xl bg-white' 
                />
                <div className='absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center'>
                  <div className='h-2 w-2 bg-white rounded-full animate-pulse'></div>
                </div>
              </div>
              <div className='text-white'>
                <div className='flex items-center gap-2 mb-2'>
                  <Badge className='bg-white/20 hover:bg-white/30 text-white border-none py-1 px-3 text-[12px] uppercase tracking-wider font-extrabold'>Employer Pro</Badge>
                  <span className='text-white/60 text-sm flex items-center gap-1.5 font-bold'><Target className='h-4 w-4' /> ID: {company?.id?.slice(0, 8) || 'N/A'}</span>
                </div>
                <h1 className='text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase'>
                  Chào mừng trở lại,<br /> 
                  <span className='text-blue-200 underline decoration-blue-400 decoration-4 underline-offset-8'>{company?.name || 'Công ty của bạn'}</span>
                </h1>
                <p className='text-white/70 mt-6 flex items-center gap-2 font-bold text-lg uppercase tracking-wide'>
                  <Calendar className='h-5 w-5 text-blue-300' /> Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 w-full md:w-auto'>
              <Link to='/employer/post-job' className='w-1/2 md:w-auto'>
                <Button className='w-full bg-[#2f91ff] hover:bg-[#2676d1] text-white rounded-xl shadow-lg shadow-blue-500/30 px-6 py-4 h-auto font-bold flex items-center justify-center gap-3 border-none transition-all hover:scale-105'>
                  <Plus className='h-5 w-5' /> 
                  <span className='text-sm uppercase tracking-wide'>Đăng tin tuyển dụng</span>
                </Button>
              </Link>
              <Link to='/employer/posts' className='w-1/2 md:w-auto'>
                <Button variant='outline' className='w-full bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl px-6 py-4 h-auto font-bold flex items-center justify-center gap-3 transition-all hover:scale-105'>
                  <LayoutDashboard className='h-5 w-5' /> 
                  <span className='text-sm uppercase tracking-wide'>Đăng bài Post</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 max-w-7xl -mt-10 relative z-20'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          {[
            { label: 'Việc làm đang tuyển', value: jobs.length, icon: Briefcase, color: 'bg-blue-600', lightColor: 'bg-blue-50', textColor: 'text-blue-600', trend: '+2', sub: 'Mới trong tuần' },
            { label: 'Tổng số ứng viên', value: applications.length, icon: Users, color: 'bg-indigo-600', lightColor: 'bg-indigo-50', textColor: 'text-indigo-600', trend: '+12', sub: 'Tăng trưởng 15%' },
            { label: 'Tin nhắn chưa đọc', value: 8, icon: MessageSquare, color: 'bg-amber-600', lightColor: 'bg-amber-50', textColor: 'text-amber-600', trend: '5', sub: 'Cần phản hồi sớm' },
            { label: 'Lượt xem tin tuyển dụng', value: '2.4k', icon: Eye, color: 'bg-emerald-600', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600', trend: '+18%', sub: 'Sức hút cao' }
          ].map((stat, idx) => (
            <Card key={idx} className='border-none shadow-lg shadow-gray-200/50 hover:translate-y-[-2px] transition-all duration-300 overflow-hidden group'>
              <CardContent className='p-0'>
                <div className={`h-1 w-full ${stat.color}`}></div>
                <div className='p-5'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform ${stat.lightColor} ${stat.textColor}`}>
                      <stat.icon className='h-5 w-5' />
                    </div>
                    <div className='text-right'>
                      <span className={`text-[12px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${stat.lightColor} ${stat.textColor}`}>
                        <ArrowUpRight className='h-3 w-3' /> {stat.trend}
                      </span>
                    </div>
                  </div>
                  <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1'>{stat.label}</p>
                  <h3 className='text-2xl font-black text-gray-800 tracking-tight'>{stat.value}</h3>
                  <p className='text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1 italic'>
                    <Timer className='h-3 w-3' /> {stat.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            <Card className='border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden'>
              <CardHeader className='flex flex-row items-center justify-between pb-6 px-8 pt-8 border-none'>
                <div>
                  <CardTitle className='text-xl font-black text-gray-800 flex items-center gap-2'>
                    <Zap className='h-5 w-5 text-amber-500 fill-amber-500' /> 
                    Ứng viên mới nhất
                  </CardTitle>
                  <p className='text-sm text-gray-500 font-medium mt-1'>Các ứng viên vừa ứng tuyển vào vị trí của bạn</p>
                </div>
                <Link to='/employer/applicants' className='text-sm font-bold text-[#411c96] hover:bg-[#411c96]/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1'>
                  Xem tất cả <ChevronRight className='h-4 w-4' />
                </Link>
              </CardHeader>
              <CardContent className='px-8 pb-8'>
                <div className='space-y-4'>
                  {applications.length > 0 ? (
                    applications.slice(0, 4).map((app, appIdx) => (
                      <div key={appIdx} className='flex items-center justify-between p-4 rounded-2xl bg-[#fafbfc] border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group'>
                        <div className='flex items-center gap-4'>
                          <Avatar 
                            src={app.user?.avatar || `https://i.pravatar.cc/150?u=${app.user?.id || 'guest'}`} 
                            className='h-12 w-12 border-2 border-white shadow-sm rounded-xl'
                          />
                          <div>
                            <h4 className='font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-[14px]'>{app.user?.fullName || 'Ứng viên ẩn danh'}</h4>
                            <p className='text-[13px] text-gray-500 font-medium flex items-center gap-1'>
                              Ứng tuyển: <span className='text-[#411c96] font-bold line-clamp-1'>{app.job?.jobTitle || 'Vị trí tuyển dụng'}</span>
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-4'>
                          <div className='text-right hidden sm:block'>
                            <p className='text-[12px] font-bold text-gray-800'>{new Date(app.appliedDate).toLocaleDateString()}</p>
                            <Badge className='mt-1 bg-amber-50 text-amber-600 border-none font-bold text-[10px] uppercase'>Đang chờ</Badge>
                          </div>
                          <Button size='sm' variant='ghost' className='rounded-xl h-10 w-10 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50'>
                            <ChevronRight className='h-5 w-5' />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-10 opacity-50'>
                      <p className='font-medium text-gray-500'>Chưa có ứng viên mới nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden'>
              <CardHeader className='flex flex-row items-center justify-between pb-6 px-8 pt-8 border-none'>
                <CardTitle className='text-xl font-black text-gray-800'>Công việc đang quản lý</CardTitle>
                <Link to='/employer/my-jobs' className='text-sm font-bold text-[#411c96] hover:underline'>Tất cả bài đăng</Link>
              </CardHeader>
              <CardContent className='px-8 pb-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {jobs.length > 0 ? (
                    jobs.slice(0, 4).map((job, jobIdx) => (
                      <div key={jobIdx} className='p-5 rounded-2xl border border-gray-100 bg-[#f8f9fa] hover:bg-white hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8'></div>
                        <div className='flex justify-between items-start mb-4'>
                          <div className='h-10 w-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center'>
                            <Briefcase className='h-5 w-5 text-blue-500' />
                          </div>
                          <Badge className='bg-green-50 text-green-600 border-none font-bold text-[10px] uppercase'>Đang tuyển</Badge>
                        </div>
                        <h4 className='font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-[14px] mb-2 line-clamp-1'>{job.jobTitle || job.title}</h4>
                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center gap-2 text-[12px] text-gray-500 font-medium'>
                            <MapPin className='h-3.5 w-3.5' /> {job.location || 'Toàn quốc'}
                          </div>
                          <div className='flex items-center gap-2 text-[12px] text-gray-500 font-medium'>
                            <Users className='h-3.5 w-3.5' /> {job.applications?.length || 0} Ứng viên
                          </div>
                        </div>
                        <div className='mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-400'>
                          <span>Hết hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Thông báo'}</span>
                          <ArrowUpRight className='h-3.5 w-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200'>
                      <div className='h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <Briefcase className='h-6 w-6 text-gray-400' />
                      </div>
                      <p className='text-gray-500 font-bold text-sm uppercase tracking-wide'>Chưa có tin tuyển dụng nào</p>
                      <Link to='/employer/post-job'>
                        <Button variant='link' className='mt-2 text-[#411c96] font-bold'>Đăng tuyển ngay</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden'>
              <CardHeader className='flex flex-row items-center justify-between pb-6 px-8 pt-8 border-none'>
                <CardTitle className='text-xl font-black text-gray-800 flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-indigo-500' />
                  Bài Post đã đăng
                </CardTitle>
                <Link to='/employer/posts' className='text-sm font-bold text-[#411c96] hover:underline'>Xem tất cả</Link>
              </CardHeader>
              <CardContent className='px-8 pb-8'>
                <div className='space-y-4'>
                  {posts.length > 0 ? (
                    posts.slice(0, 3).map((post, pIdx) => (
                      <div key={pIdx} className='p-4 rounded-xl border border-gray-50 bg-[#fafbfc] hover:shadow-md transition-all'>
                        <div className='flex items-start gap-4'>
                          {post.imageUrl && (
                            <img src={post.imageUrl} className='h-16 w-16 rounded-lg object-cover flex-shrink-0' alt='' />
                          )}
                          <div className='flex-1 min-w-0'>
                            <div 
                              className='text-sm text-gray-800 font-medium line-clamp-2 leading-relaxed prose prose-sm max-w-none'
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            <div className='flex items-center gap-4 mt-2'>
                              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Vừa xong'}
                              </span>
                              <div className='flex items-center gap-3'>
                                <span className='text-[10px] font-bold text-blue-500 flex items-center gap-1'>
                                  <MessageSquare className='h-3 w-3' /> {post.comments || 0}
                                </span>
                                <span className='text-[10px] font-bold text-emerald-500 flex items-center gap-1'>
                                  <Eye className='h-3 w-3' /> {post.views || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='py-8 text-center bg-gray-50 rounded-2xl border border-dotted border-gray-200'>
                      <p className='text-gray-400 font-medium text-xs'>Bạn chưa đăng bài post nào cho doanh nghiệp.</p>
                      <Link to='/employer/posts'>
                        <Button variant='link' className='mt-1 text-indigo-600 font-bold text-xs uppercase'>Tạo bài post đầu tiên</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-8'>
            <Card className='border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-[#411c96] to-[#2d0f71] text-white'>
              <CardContent className='p-8'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center'>
                    <CheckCircle2 className='h-6 w-6 text-green-400' />
                  </div>
                  <div>
                    <h3 className='font-black text-lg'>Hồ Sơ Doanh Nghiệp</h3>
                    <p className='text-white/60 text-xs font-medium italic'>Đã xác minh đầy đủ</p>
                  </div>
                </div>
                <div className='space-y-4 mb-8'>
                  <div className='bg-white/10 p-4 rounded-xl text-center'>
                    <p className='text-xs font-bold text-white/50 uppercase tracking-widest mb-2'>Điểm tin cậy</p>
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-3xl font-black'>9.8</span>
                      <span className='text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-[10px]'>TỐT NHẤT</span>
                    </div>
                  </div>
                </div>
                <Link to='/employer/settings'>
                  <Button className='w-full bg-white text-[#411c96] hover:bg-gray-100 rounded-xl py-6 font-black transition-all'>
                    Cập nhật Profile Ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='border-none shadow-xl shadow-gray-200/50 bg-white overflow-hidden'>
              <CardHeader className='pb-4 px-6 pt-6 border-none'>
                <CardTitle className='text-lg font-black text-gray-800 flex items-center gap-2'>
                  <Bell className='h-5 w-5 text-blue-500 fill-blue-500' /> 
                  Thông báo mới nhất
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y divide-gray-50'>
                  {[
                    { title: 'Phản hồi phỏng vấn', desc: 'Hệ thống vừa gửi mail cho 5 ứng viên...', time: '2 giờ trước', color: 'bg-blue-500' },
                    { title: 'Báo cáo hiệu suất', desc: 'Tin tuyển dụng Developer đã đạt mốc...', time: '5 giờ trước', color: 'bg-green-500' },
                    { title: 'Tin nhắn hỗ trợ', desc: 'Đội ngũ Support đã trả lời yêu cầu...', time: '1 ngày trước', color: 'bg-amber-500' }
                  ].map((notif, notIdx) => (
                    <div key={notIdx} className='p-5 hover:bg-gray-50 transition-colors cursor-pointer group'>
                      <div className='flex gap-4'>
                        <div className={`mt-1.5 h-2 w-2 rounded-full transition-transform ${notif.color}`}></div>
                        <div className='flex-1'>
                          <h5 className='font-bold text-gray-800 text-[13px] leading-tight mb-1 uppercase tracking-tight'>{notif.title}</h5>
                          <p className='text-[11px] text-gray-500 font-medium line-clamp-2 italic mb-2'>{notif.desc}</p>
                          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant='ghost' className='w-full rounded-none h-14 border-t border-gray-100 text-[#411c96] font-bold text-[12px] uppercase tracking-widest hover:bg-[#411c96]/5 transition-all'>
                  Xem tất cả thông báo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
