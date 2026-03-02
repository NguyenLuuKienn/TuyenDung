import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Briefcase, Mail, Lock, Github, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import authService from "@/services/authService";
import { extractRole } from "@/utils/roleUtils";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await authService.login(email, password);
      
      // Check if API returned success
      if (!response.data.success || !response.data.token) {
        throw new Error(response.data.message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
      
      const { token, userInfo } = response.data;
      
      // Normalize user object from API response
      const extractedRole = extractRole(userInfo);
      const user = {
        id: userInfo?.userID || userInfo?.id,
        email: userInfo?.email || email,
        name: userInfo?.name || userInfo?.fullName || "User",
        fullName: userInfo?.name || userInfo?.fullName || "User",
        avatar: userInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.name || "User")}&background=random`,
        role: extractedRole,
      };
      
      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Dispatch custom event for Navbar to update immediately
      window.dispatchEvent(new CustomEvent('authChange', { detail: { user, token } }));
      
      // Redirect based on user role
      const userRole = user.role || "JobSeeker";
      
      if (userRole === "Employer") {
        navigate("/employer/dashboard");
      } else if (userRole === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-3xl text-brand mb-2">
            <div className="bg-brand text-white p-1.5 rounded-xl">
              <Briefcase className="h-8 w-8" />
            </div>
            <span>SchneeJob</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-display">Đăng nhập tài khoản</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hoặc{" "}
            <Link to="/register" className="font-medium text-brand hover:text-brand-hover transition-colors">
              tạo tài khoản mới
            </Link>
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-700 shrink-0 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-11 py-2.5 rounded-xl transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-11 pr-10 py-2.5 rounded-xl transition-all ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    disabled={isSubmitting}
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className={`font-semibold transition-colors ${isSubmitting ? 'opacity-50 pointer-events-none text-gray-400' : 'text-brand hover:text-brand-hover'}`}>
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl text-base font-semibold cursor-pointer">
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Button variant="outline" className="w-full flex justify-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                        fill="#34A853"
                      />
                    </svg>
                    Google
                  </Button>
                </div>
                <div>
                  <Button variant="outline" className="w-full flex justify-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <Github className="h-5 w-5" />
                    GitHub
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
