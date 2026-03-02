import { Link, useLocation } from "react-router-dom";
import { Briefcase, Bell, User, LogOut, Settings, Bookmark, ChevronDown, Calculator, FileText } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { useState, useRef, useEffect } from "react";
import { notificationService } from "../../services";
import type { Notification } from "../../services";

export function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("JobSeeker");
  const [user, setUser] = useState({ name: "User", avatar: "https://picsum.photos/seed/user1/100/100", email: "user@example.com" });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const getNextRole = (currentRole: string): string => {
    if (currentRole === "JobSeeker" || currentRole === "Applicant") return "Employer";
    if (currentRole === "Employer") return "Admin";
    return "JobSeeker";
  };

  const getRoleDisplay = (role: string): string => {
    if (role === "JobSeeker") return "Ứng Viên";
    if (role === "Applicant") return "Ứng Viên";
    if (role === "Employer") return "Nhà Tuyển Dụng";
    if (role === "Admin") return "Quản Trị";
    return "Ứng Viên";
  };

  const toggleRole = () => {
    setUserRole(prev => getNextRole(prev));
  };

  useEffect(() => {
    // Check if user is logged in from localStorage or auth context
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Normalize role: API returns "JobSeeker", we use it as is
        const normalizedRole = userData.role || "JobSeeker";
        setUserRole(normalizedRole);
        console.log('Navbar loaded user:', userData.name, 'Role:', normalizedRole);
      } catch (e) {
        console.warn('Failed to parse stored user data:', e);
        // Keep default user
      }
      
      // Load notifications
      loadNotifications();
      loadUnreadCount();
    } else {
      setIsLoggedIn(false);
      setUserRole("JobSeeker");
    }

    // Listen for custom auth change event
    const handleAuthChange = (e: any) => {
      console.log('authChange event received:', e.detail);
      if (e.detail?.user) {
        const userData = e.detail.user;
        setUser(userData);
        setIsLoggedIn(true);
        const normalizedRole = userData.role || "JobSeeker";
        setUserRole(normalizedRole);
        console.log('Navbar updated from authChange:', userData.name, 'Role:', normalizedRole);
        loadNotifications();
        loadUnreadCount();
      } else if (e.detail?.user === null) {
        // User logged out
        setIsLoggedIn(false);
        setUserRole("JobSeeker");
        setUser(null);
        console.log('Navbar: User logged out via authChange event');
      }
    };

    // Listen for storage changes (e.g., user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          setUser(userData);
          setIsLoggedIn(true);
          const normalizedRole = userData.role || "JobSeeker";
          setUserRole(normalizedRole);
          loadNotifications();
          loadUnreadCount();
        } catch (err) {
          console.warn('Failed to parse updated user data:', err);
        }
      } else if (e.key === "user" && !e.newValue) {
        // User logged out
        setIsLoggedIn(false);
        setUserRole("JobSeeker");
      } else if (e.key === "token" && !e.newValue) {
        // Token was removed
        setIsLoggedIn(false);
        setUserRole("JobSeeker");
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getMyNotifications(false); // false = get unread
      const data = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
      setNotifications(data.slice(0, 5)); // Show only first 5
    } catch (err: any) {
      // Silently ignore 404 errors - notifications endpoint may not exist
      if (err.response?.status !== 404) {
        console.error('Failed to load notifications:', err);
      }
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data || 0);
    } catch (err: any) {
      // Silently ignore 404 errors - notifications endpoint may not exist
      if (err.response?.status !== 404) {
        console.error('Failed to load unread count:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    
    // Dispatch custom event for other listeners to update
    window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null, token: null } }));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-2xl text-brand">
            <div className="bg-brand text-white p-1.5 rounded-xl">
              <Briefcase className="h-6 w-6" />
            </div>
            <span>SchneeJob</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link to="/" className={`hover:text-brand transition-colors ${location.pathname === '/' ? 'text-brand font-semibold' : ''}`}>Tìm Việc</Link>
            <Link to="/companies" className={`hover:text-brand transition-colors ${location.pathname === '/companies' ? 'text-brand font-semibold' : ''}`}>Công Ty</Link>
            
            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button 
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className={`flex items-center gap-1 hover:text-brand transition-colors cursor-pointer ${showToolsMenu ? 'text-brand font-semibold' : ''}`}
              >
                Công Cụ <ChevronDown className="h-4 w-4" />
              </button>
              
              {showToolsMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-2">
                    <Link to="/salary-calculator" onClick={() => setShowToolsMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-xl transition-colors">
                      <Calculator className="h-4 w-4" /> Tính lương Gross/Net
                    </Link>
                    <Link to="/cv-builder" onClick={() => setShowToolsMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-xl transition-colors">
                      <FileText className="h-4 w-4" /> Tạo CV
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/career-guide" className={`hover:text-brand transition-colors ${location.pathname === '/career-guide' ? 'text-brand font-semibold' : ''}`}>Cẩm Nang Nghề Nghiệp</Link>

            {(userRole === "Employer") && (
              <Link to="/employer/dashboard" className={`hover:text-brand transition-colors ${location.pathname.includes('/employer') ? 'text-brand font-semibold' : ''}`}>Nhà Tuyển Dụng</Link>
            )}
            {(userRole === "Admin") && (
              <Link to="/admin/dashboard" className={`hover:text-brand transition-colors ${location.pathname.includes('/admin') ? 'text-brand font-semibold' : ''}`}>Quản Trị Viên</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Role display - disabled when logged in */}
          {!isLoggedIn && (
            <button 
              onClick={toggleRole} 
              className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 hidden md:block hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Vai trò: {getRoleDisplay(userRole)}
            </button>
          )}
          
          {isLoggedIn && (
            <div className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 hidden md:block opacity-70">
              {getRoleDisplay(userRole)}
            </div>
          )}

          {isLoggedIn ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-400 hover:text-brand relative transition-colors p-2 hover:bg-gray-50 rounded-full cursor-pointer"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">{Math.min(unreadCount, 9)}</span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Thông báo</h3>
                      <button className="text-xs text-brand font-medium hover:underline cursor-pointer">Đánh dấu đã đọc</button>
                    </div>
                    <div className="max-h-75 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id || notif.notificationId} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                              <Briefcase className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-800 font-medium">{notif.title || notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt || '').toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">Không có thông báo nào</div>
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-gray-50">
                      <button className="text-sm font-medium text-brand hover:underline cursor-pointer">Xem tất cả</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-4 rounded-full transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                >
                  <Avatar src={user.avatar} fallback={user.name.substring(0, 2)} className="h-10 w-10 border-2 border-white shadow-sm" />
                  <span className="text-sm font-semibold text-gray-700 hidden md:block">{user.name}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-xl transition-colors">
                        <User className="h-4 w-4" /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/saved-jobs" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-xl transition-colors">
                        <Bookmark className="h-4 w-4" /> Việc làm đã lưu
                      </Link>
                      <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand/5 rounded-xl transition-colors">
                        <Settings className="h-4 w-4" /> Cài đặt
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-50">
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-semibold cursor-pointer">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button className="cursor-pointer">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
