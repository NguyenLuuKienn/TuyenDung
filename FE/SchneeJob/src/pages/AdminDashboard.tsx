import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Briefcase, Building2, AlertTriangle, Activity, Settings, BarChart2, FileText, Search, Bell, ChevronRight, Edit2, Trash2, Eye, FileSignature, LogOut, Home, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Image as ImageIcon, Link as LinkIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { dashboardService, jobService, companyService } from "@/services";
import api from "@/services/api";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersTab />;
      case "companies":
        return <CompaniesTab />;
      case "company-requests":
        return <CompanyRequestsTab />;
      case "jobs":
        return <JobsTab />;
      case "career-guide":
        return <CareerGuideTab />;
      case "reports":
        return <ReportsTab />;
      case "audit":
        return <AuditTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
            <div className="bg-brand p-1.5 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            Admin Hub
          </h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {[
            { id: "dashboard", label: "Bảng Điều Khiển", icon: Activity },
            { id: "users", label: "Người Dùng", icon: Users },
            { id: "companies", label: "Công Ty", icon: Building2 },
            { id: "company-requests", label: "Duyệt Công Ty", icon: FileSignature },
            { id: "jobs", label: "Việc Làm", icon: Briefcase },
            { id: "career-guide", label: "Cẩm Nang Nghề Nghiệp", icon: FileText },
            { id: "reports", label: "Báo Cáo", icon: FileText },
            { id: "audit", label: "Nhật Ký Hệ Thống", icon: AlertTriangle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === item.id
                  ? "bg-brand/5 text-brand"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? "" : "text-gray-400"}`} /> 
                <span className="truncate">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-4">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start text-gray-600 hover:text-brand hover:bg-brand/5 border-gray-200 cursor-pointer mb-2">
              <Home className="h-4 w-4 mr-2" />
              Trang Chủ
            </Button>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm font-bold text-gray-900">Quản Trị Viên</p>
              <p className="text-xs text-gray-500">admin@schneejob.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Đăng Xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm người dùng, công ty, hoặc việc làm..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-brand/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full relative border-gray-200 cursor-pointer"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Thông báo hệ thống</h3>
                    <button className="text-xs text-brand font-medium hover:underline cursor-pointer">Đánh dấu đã đọc</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {[
                      { title: "Đơn đăng ký công ty mới", time: "10 phút trước", type: "company" },
                      { title: "Báo cáo vi phạm từ người dùng", time: "1 giờ trước", type: "report" },
                      { title: "Hệ thống sao lưu thành công", time: "3 giờ trước", type: "system" }
                    ].map((notif, i) => (
                      <div key={i} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'company' ? 'bg-blue-50 text-blue-600' :
                          notif.type === 'report' ? 'bg-red-50 text-red-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {notif.type === 'company' ? <Building2 className="h-4 w-4" /> :
                           notif.type === 'report' ? <AlertTriangle className="h-4 w-4" /> :
                           <Activity className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-50">
                    <button className="text-sm font-medium text-brand hover:underline cursor-pointer">Xem tất cả</button>
                  </div>
                </div>
              )}
            </div>
            <Button className="rounded-full shadow-sm cursor-pointer">
              <BarChart2 className="h-4 w-4 mr-2" /> Xuất Báo Cáo
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdminStats();
        setStats(res.data || res);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">Tổng Quan Hệ Thống</h1>
        <p className="text-gray-500 mt-1">Số liệu thời gian thực và tình trạng hệ thống.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                +5.2%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng Người Dùng</p>
            <h3 className="text-3xl font-bold font-display text-gray-900">{stats?.totalUsers || 0}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Building2 className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                +12%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Công Ty Đang Hoạt Động</p>
            <h3 className="text-3xl font-bold font-display text-gray-900">{stats?.totalCompanies || 0}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-none">
                -2.1%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Việc Làm Đang Tuyển</p>
            <h3 className="text-3xl font-bold font-display text-gray-900">{stats?.totalOpenJobs || 0}</h3>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                <Activity className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                Tốt
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Tình Trạng Hệ Thống</p>
            <h3 className="text-3xl font-bold font-display text-gray-900">99.9%</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-bold font-display text-gray-900">Hoạt Động Gần Đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {[
                { action: "Công ty mới đăng ký", target: "TechFlow Solutions", time: "10 phút trước", type: "success" },
                { action: "Người dùng báo cáo việc làm", target: "Nhập liệu (Spam)", time: "1 giờ trước", type: "warning" },
                { action: "Sao lưu hệ thống hoàn tất", target: "Database_v2.bak", time: "3 giờ trước", type: "info" },
                { action: "Đăng nhập thất bại", target: "IP: 192.168.1.100", time: "5 giờ trước", type: "error" },
                { action: "Cấp quyền quản trị viên mới", target: "nguyenvana@admin.com", time: "1 ngày trước", type: "info" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                    log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                    'bg-brand shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.target}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-400 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50">
              <Button variant="outline" className="w-full rounded-full cursor-pointer">Xem Toàn Bộ Nhật Ký</Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-lg font-bold font-display text-gray-900">Chờ Phê Duyệt</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Công Ty (3)</h4>
                <div className="space-y-3">
                  {[
                    { name: "Global Tech Innovations", email: "contact@globaltech.com", date: "26 Thg 10, 2023" },
                    { name: "NextGen Solutions", email: "hr@nextgen.io", date: "25 Thg 10, 2023" },
                  ].map((company, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-brand/30 transition-colors bg-white">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{company.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 rounded-full px-4 cursor-pointer">Duyệt</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-full px-4 cursor-pointer">Từ chối</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Đánh Giá Bị Báo Cáo (2)</h4>
                <div className="p-4 border border-red-100 rounded-2xl bg-red-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">Đánh giá về TechCorp Inc.</p>
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5 border-none uppercase tracking-wider font-bold">Spam</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 italic">"Công ty tồi tệ, đừng làm việc ở đây. Đăng tin tuyển dụng giả mạo."</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="rounded-full px-4 cursor-pointer">Xóa Đánh Giá</Button>
                    <Button size="sm" variant="outline" className="bg-white rounded-full px-4 border-red-200 text-red-700 hover:bg-red-50 cursor-pointer">Bỏ Qua</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function UsersTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: any) => {
    setModalMode("view");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId && u.userId !== userId));
        alert('Xóa người dùng thành công!');
      } catch (err) {
        alert('Không thể xóa người dùng!');
        console.error('Failed to delete user:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Quản Lý Người Dùng</h1>
          <p className="text-gray-500 mt-1">Xem và quản lý tất cả người dùng trong hệ thống.</p>
        </div>
        <Button className="rounded-full shadow-sm cursor-pointer" onClick={handleAddUser}>Thêm Người Dùng</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Người Dùng</th>
                  <th className="px-6 py-4 font-bold">Vai Trò</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold">Ngày Tham Gia</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id || user.userId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatarUrl || user.avatar || "https://i.pravatar.cc/150"} alt={user.fullName || user.name || "User"} className="h-10 w-10 rounded-full" />
                          <div>
                            <p className="font-bold text-gray-900">{user.fullName || user.name || "N/A"}</p>
                            <p className="text-gray-500 text-xs">{user.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{user.userRoles?.[0]?.role?.roleName || user.role || "JobSeeker"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.isActive !== false ? "success" : "destructive"} className="border-none">
                          {user.isActive !== false ? "Hoạt động" : "Bị khóa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handleViewUser(user)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handleEditUser(user)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 rounded-full cursor-pointer" onClick={() => handleDeleteUser(user.id || user.userId)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === "view" ? "Chi Tiết Người Dùng" : modalMode === "add" ? "Thêm Người Dùng Mới" : "Chỉnh Sửa Người Dùng"}
        footer={
          modalMode === "view" ? (
            <Button onClick={() => setIsModalOpen(false)} className="cursor-pointer">Đóng</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">Hủy</Button>
              <Button onClick={() => setIsModalOpen(false)} className="cursor-pointer">Lưu</Button>
            </>
          )
        }
      >
        {modalMode === "view" ? (
          selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar src={selectedUser.avatarURL || selectedUser.avatarUrl || "https://i.pravatar.cc/150"} alt={selectedUser.fullName || "User"} className="h-16 w-16 rounded-full border border-gray-100" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName || "N/A"}</h3>
                  <p className="text-gray-500">{selectedUser.email || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Số Điện Thoại</p>
                  <p className="font-medium text-gray-900">{selectedUser.phoneNumber || "N/A"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Trạng Thái</p>
                  <Badge variant={selectedUser.isActive !== false ? "success" : "destructive"} className="border-none mt-1">
                    {selectedUser.isActive !== false ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ngày Tham Gia</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Lần Đăng Nhập Cuối</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('vi-VN') : "Chưa đăng nhập"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">ID Người Dùng</h4>
                <p className="text-gray-600 text-sm font-mono bg-gray-50 p-3 rounded-xl break-all">
                  {selectedUser.userId || selectedUser.id || "N/A"}
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
              <Input defaultValue={selectedUser?.fullName || ""} placeholder="Nhập họ và tên" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" defaultValue={selectedUser?.email || ""} placeholder="Nhập email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai Trò</label>
              <select className="w-full h-10 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white text-sm" defaultValue={selectedUser?.role || "Ứng Viên"}>
                <option value="Ứng Viên">Ứng Viên</option>
                <option value="Nhà Tuyển Dụng">Nhà Tuyển Dụng</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
              <select className="w-full h-10 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white text-sm" defaultValue={selectedUser?.isActive !== false ? "Hoạt động" : "Bị khóa"}>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CompaniesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await companyService.getAll();
        setCompanies(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleViewCompany = (company: any) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Bạn có chắc muốn xóa công ty này?')) {
      try {
        await companyService.delete(companyId);
        setCompanies(companies.filter(c => c.id !== companyId && c.companyId !== companyId));
        alert('Xóa công ty thành công!');
      } catch (err) {
        alert('Không thể xóa công ty!');
        console.error('Failed to delete company:', err);
      }
    }
  };

  const handleVerifyCompany = async (companyId: string) => {
    try {
      await companyService.verify(companyId, true);
      setCompanies(companies.map(c => 
        c.id === companyId || c.companyId === companyId
          ? { ...c, isVerified: true }
          : c
      ));
      setSelectedCompany(selectedCompany && (selectedCompany.id === companyId || selectedCompany.companyId === companyId)
        ? { ...selectedCompany, isVerified: true }
        : selectedCompany);
      alert('Duyệt công ty thành công!');
    } catch (err) {
      alert('Không thể duyệt công ty!');
      console.error('Failed to verify company:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Quản Lý Công Ty</h1>
          <p className="text-gray-500 mt-1">Xem và phê duyệt các công ty đăng ký.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Công Ty</th>
                  <th className="px-6 py-4 font-bold">Ngành Nghề</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.length > 0 ? (
                  companies.map((company, i) => (
                    <tr key={company.id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={company.logoURL || company.logo || ""} alt={company.companyName || company.name || "Company"} className="h-10 w-10 rounded-xl border border-gray-100" />
                          <div>
                            <p className="font-bold text-gray-900">{company.companyName || company.name}</p>
                            <p className="text-gray-500 text-xs">{company.companyEmail || company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{company.industry?.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={company.isVerified ? "success" : "secondary"} className="border-none">
                          {company.isVerified ? "Đã duyệt" : "Chờ duyệt"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handleViewCompany(company)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 rounded-full cursor-pointer" onClick={() => handleDeleteCompany(company.id || company.companyId)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy công ty nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Chi Tiết Công Ty"
        footer={
          <div className="flex gap-2">
            {selectedCompany && !selectedCompany.isVerified && (
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer" onClick={() => { handleVerifyCompany(selectedCompany.id || selectedCompany.companyId); setIsModalOpen(false); }}>Duyệt Công Ty</Button>
            )}
            <Button onClick={() => setIsModalOpen(false)} className="cursor-pointer">Đóng</Button>
          </div>
        }
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={selectedCompany.logoURL || selectedCompany.logo || ""} alt={selectedCompany.companyName || selectedCompany.name || "Company"} className="h-16 w-16 rounded-xl border border-gray-100" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCompany.companyName || selectedCompany.name}</h3>
                <p className="text-gray-500 text-sm">{selectedCompany.address || "N/A"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                <p className="font-medium text-gray-900 text-sm break-all">{selectedCompany.companyEmail || selectedCompany.email || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Số Điện Thoại</p>
                <p className="font-medium text-gray-900">{selectedCompany.phoneNumber || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Địa Chỉ</p>
                <p className="font-medium text-gray-900 text-sm">{selectedCompany.address || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Thành Phố</p>
                <p className="font-medium text-gray-900">{selectedCompany.city || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Website</p>
                <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline text-sm break-all">
                  {selectedCompany.website || "N/A"}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Trạng Thái</p>
                <Badge variant={selectedCompany.isVerified ? "success" : "secondary"} className="border-none mt-1">
                  {selectedCompany.isVerified ? "Đã duyệt" : "Chờ duyệt"}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Quy Mô</p>
                <p className="font-medium text-gray-900">{selectedCompany.companySize || "N/A"}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Mô tả công ty</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedCompany.companyDescription || selectedCompany.description || "Chưa có mô tả"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CompanyRequestsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/registrations/pending');
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch company requests:", err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleViewRequest = (req: any) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await api.post(`/admin/registrations/${registrationId}/approve`, {});
      setRequests(requests.map(r => 
        r.id === registrationId || r.companyRegistrationId === registrationId 
          ? { ...r, status: "Approved" } 
          : r
      ));
      setSelectedRequest(selectedRequest && (selectedRequest.id === registrationId || selectedRequest.companyRegistrationId === registrationId)
        ? { ...selectedRequest, status: "Approved" }
        : selectedRequest);
      alert('Duyệt công ty thành công!');
    } catch (err) {
      alert('Không thể duyệt công ty!');
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await api.post(`/admin/registrations/${registrationId}/reject`, { Notes: "" });
      setRequests(requests.map(r => 
        r.id === registrationId || r.companyRegistrationId === registrationId 
          ? { ...r, status: "Rejected" } 
          : r
      ));
      setSelectedRequest(selectedRequest && (selectedRequest.id === registrationId || selectedRequest.companyRegistrationId === registrationId)
        ? { ...selectedRequest, status: "Rejected" }
        : selectedRequest);
      alert('Từ chối công ty thành công!');
    } catch (err) {
      alert('Không thể từ chối công ty!');
      console.error('Failed to reject:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Đơn Đăng Ký Công Ty</h1>
          <p className="text-gray-500 mt-1">Xem xét và phê duyệt các yêu cầu đăng ký công ty mới.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Mã Đơn</th>
                  <th className="px-6 py-4 font-bold">Tên Công Ty</th>
                  <th className="px-6 py-4 font-bold">Người Liên Hệ</th>
                  <th className="px-6 py-4 font-bold">Ngày Gửi</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id || req.companyRegistrationId}>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{req.id || req.companyRegistrationId || "N/A"}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{req.companyName || req.company || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-700">{req.contactName || req.contact || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : req.date || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={req.status === "Approved" || req.status === "Đã duyệt" ? "success" : req.status === "Rejected" || req.status === "Từ chối" ? "destructive" : "warning"} className="border-none">
                          {req.status === "Pending" ? "Chờ duyệt" : req.status === "Approved" ? "Đã duyệt" : req.status === "Rejected" ? "Từ chối" : req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(req.status === "Pending" || !req.status) && (
                            <>
                              <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 rounded-full cursor-pointer" onClick={() => handleApprove(req.id || req.companyRegistrationId)}>Duyệt</Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-full cursor-pointer" onClick={() => handleReject(req.id || req.companyRegistrationId)}>Từ chối</Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handleViewRequest(req)}><Eye className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy đơn đăng ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Chi Tiết Đơn Đăng Ký"
        footer={
          <div className="flex gap-2">
            {selectedRequest && (selectedRequest.status === "Pending" || !selectedRequest.status) && (
              <>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer" onClick={() => { handleReject(selectedRequest.id || selectedRequest.companyRegistrationId); setIsModalOpen(false); }}>Từ chối</Button>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer" onClick={() => { handleApprove(selectedRequest.id || selectedRequest.companyRegistrationId); setIsModalOpen(false); }}>Phê duyệt</Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">Đóng</Button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{selectedRequest.companyName || selectedRequest.company || "N/A"}</h3>
              <Badge variant={selectedRequest.status === "Approved" || selectedRequest.status === "Đã duyệt" ? "success" : selectedRequest.status === "Rejected" || selectedRequest.status === "Từ chối" ? "destructive" : "warning"} className="border-none">
                {selectedRequest.status === "Pending" ? "Chờ duyệt" : selectedRequest.status === "Approved" ? "Đã duyệt" : selectedRequest.status === "Rejected" ? "Từ chối" : selectedRequest.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Mã Đơn</p>
                <p className="font-medium text-gray-900">{selectedRequest.id || selectedRequest.companyRegistrationId || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ngày Gửi</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN') : selectedRequest.date || "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Người Liên Hệ</p>
                <p className="font-medium text-gray-900">{selectedRequest.contactName || selectedRequest.contact || "N/A"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email Liên Hệ</p>
                <p className="font-medium text-gray-900">{selectedRequest.email || selectedRequest.companyEmail || "N/A"}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Mô tả công ty</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedRequest.description || selectedRequest.companyDescription || "Chưa có mô tả"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function JobsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getAll();
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Quản Lý Việc Làm</h1>
          <p className="text-gray-500 mt-1">Kiểm duyệt các tin tuyển dụng trên hệ thống.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Việc Làm</th>
                  <th className="px-6 py-4 font-bold">Công Ty</th>
                  <th className="px-6 py-4 font-bold">Ngày Đăng</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <tr key={job.jobId || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{job.jobTitle || job.title}</td>
                      <td className="px-6 py-4 font-medium text-gray-700">{job.company?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={job.status === "Open" ? "success" : "destructive"} className="border-none">
                          {job.status === "Open" ? "Đang hiển thị" : "Đóng"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handleViewJob(job)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 rounded-full cursor-pointer"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy việc làm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Chi Tiết Việc Làm"
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} className="cursor-pointer">Đóng</Button>
          </>
        }
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedJob.jobTitle || selectedJob.title}</h3>
                <p className="text-brand font-medium mt-1">{selectedJob.company?.name || "N/A"}</p>
              </div>
              <Badge variant={selectedJob.status === "Open" ? "success" : "destructive"} className="border-none">
                {selectedJob.status === "Open" ? "Đang hiển thị" : "Đóng"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Ngày Đăng</p>
                <p className="font-medium text-gray-900">
                  {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Mức Lương</p>
                <p className="font-medium text-gray-900">
                  ${selectedJob.salaryMin} - ${selectedJob.salaryMax}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Mô tả công việc</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedJob.jobDescription || "Chưa có mô tả"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Báo Cáo Thống Kê</h1>
          <p className="text-gray-500 mt-1">Xem các báo cáo chi tiết về hoạt động của hệ thống.</p>
        </div>
      </div>
      <Card className="border-none shadow-sm p-12 text-center">
        <BarChart2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tính năng đang được phát triển</h3>
        <p className="text-gray-500">Biểu đồ và báo cáo chi tiết sẽ sớm ra mắt.</p>
      </Card>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Nhật Ký Hệ Thống</h1>
          <p className="text-gray-500 mt-1">Theo dõi mọi thay đổi và hoạt động quan trọng.</p>
        </div>
      </div>
      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {[
              { action: "Admin đăng nhập", user: "admin@schneejob.com", ip: "192.168.1.1", time: "10 phút trước" },
              { action: "Xóa tài khoản người dùng", user: "admin@schneejob.com", ip: "192.168.1.1", time: "1 giờ trước" },
              { action: "Cập nhật cấu hình hệ thống", user: "superadmin@schneejob.com", ip: "10.0.0.5", time: "3 giờ trước" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="mt-1 h-2.5 w-2.5 rounded-full shrink-0 bg-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Bởi: {log.user} (IP: {log.ip})</p>
                </div>
                <span className="text-xs font-medium text-gray-400 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CareerGuideTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const handlePreview = (post: any) => {
    setSelectedPost(post);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Quản Lý Cẩm Nang Nghề Nghiệp</h1>
          <p className="text-gray-500 mt-1">Quản lý các bài viết cẩm nang, hướng dẫn nghề nghiệp.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-sm cursor-pointer">Thêm Bài Viết Mới</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Tiêu Đề</th>
                  <th className="px-6 py-4 font-bold">Tác Giả</th>
                  <th className="px-6 py-4 font-bold">Ngày Đăng</th>
                  <th className="px-6 py-4 font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 font-bold text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { title: "Cách viết CV chuẩn ATS", author: "Admin", date: "26/10/2023", status: "Đã xuất bản", content: "Nội dung bài viết về cách viết CV chuẩn ATS..." },
                  { title: "Kinh nghiệm phỏng vấn IT", author: "Admin", date: "25/10/2023", status: "Bản nháp", content: "Nội dung bài viết về kinh nghiệm phỏng vấn IT..." },
                ].map((post, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{post.title}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{post.author}</td>
                    <td className="px-6 py-4 text-gray-500">{post.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === "Đã xuất bản" ? "success" : "secondary"} className="border-none">
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer" onClick={() => handlePreview(post)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-brand rounded-full cursor-pointer"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 rounded-full cursor-pointer"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Bài Viết Mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">Hủy</Button>
            <Button variant="outline" className="cursor-pointer">Lưu Nháp</Button>
            <Button onClick={() => setIsModalOpen(false)} className="cursor-pointer">Xuất Bản</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tiêu đề bài viết</label>
            <Input placeholder="Nhập tiêu đề..." className="rounded-xl border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Chuyên mục</label>
            <select className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent">
              <option>Kỹ năng mềm</option>
              <option>Kinh nghiệm phỏng vấn</option>
              <option>Định hướng nghề nghiệp</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nội dung</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Mock Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><Underline className="h-4 w-4" /></Button>
                <div className="w-px h-6 bg-gray-300 mx-1 my-auto"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><AlignLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><AlignCenter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><AlignRight className="h-4 w-4" /></Button>
                <div className="w-px h-6 bg-gray-300 mx-1 my-auto"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><ImageIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-200 cursor-pointer"><LinkIcon className="h-4 w-4" /></Button>
              </div>
              {/* Editor Area */}
              <textarea 
                className="w-full h-64 p-4 resize-none focus:outline-none text-sm"
                placeholder="Nhập nội dung bài viết ở đây..."
              ></textarea>
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Xem Trước Bài Viết"
        footer={
          <Button onClick={() => setIsPreviewOpen(false)} className="cursor-pointer">Đóng</Button>
        }
      >
        {selectedPost && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-display text-gray-900">{selectedPost.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Bởi: {selectedPost.author}</span>
              <span>•</span>
              <span>{selectedPost.date}</span>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl min-h-[200px] text-gray-700">
              {selectedPost.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
