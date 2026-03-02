import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Briefcase, Mail, Lock, User, Building2, Phone, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { useState } from "react";
import authService from "@/services/authService";
import { extractRole } from "@/utils/roleUtils";

export function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("JobSeeker");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = role === "Applicant" ? "Vui lòng nhập họ và tên" : "Vui lòng nhập tên công ty";
    }
    if (!email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email không hợp lệ";
    }
    if (!phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{9,}$/.test(phone.replace(/[\s\-()]/g, ""))) {
      errors.phone = "Số điện thoại phải có ít nhất 9 chữ số";
    }
    if (!password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu không khớp";
    }
    if (!agreeTerms) {
      errors.terms = "Vui lòng đồng ý với điều khoản dịch vụ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (role === "JobSeeker") {
        response = await authService.registerJobSeeker({
          email: email.trim(),
          fullName: fullName.trim(),
          phoneNumber: phone.trim(),
          passwordHash: password,
        });
      } else {
        response = await authService.registerEmployer({
          email: email.trim(),
          fullName: fullName.trim(),
          phoneNumber: phone.trim(),
          passwordHash: password,
          companyName: fullName.trim(),
        });
      }

      // Check if registration was successful
      if (response.data.success) {
        // If API auto-logs in, store credentials
        if (response.data.token && response.data.userInfo) {
          const extractedRole = extractRole(response.data.userInfo);
          const user = {
            id: response.data.userInfo?.userID || response.data.userInfo?.id,
            email: response.data.userInfo?.email || email,
            name: response.data.userInfo?.name || fullName,
            fullName: response.data.userInfo?.name || fullName,
            avatar: response.data.userInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
            role: extractedRole,
          };
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // Dispatch custom event for Navbar to update immediately
          window.dispatchEvent(new CustomEvent('authChange', { detail: { user, token: response.data.token } }));
          
          // Auto-login on success
          navigate("/");
        } else {
          // Redirect to login if not auto-logged in
          navigate("/login?success=true");
        }
      } else {
        throw new Error(response.data.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message ||
        "Đăng ký thất bại. Vui lòng thử lại";
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-display">Tạo tài khoản mới</h2>
          <p className="mt-2 text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-medium text-brand hover:text-brand-hover transition-colors">
              Đăng nhập
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
            <div className="flex justify-center gap-4 mb-8 bg-gray-50 p-1 rounded-xl">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setRole("JobSeeker");
                  setValidationErrors({});
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  role === "JobSeeker"
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <User className="h-4 w-4 inline-block mr-2" />
                Ứng Viên
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setRole("Employer");
                  setValidationErrors({});
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  role === "Employer"
                    ? "bg-white text-brand shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Building2 className="h-4 w-4 inline-block mr-2" />
                Nhà Tuyển Dụng
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {role === "JobSeeker" ? "Họ và Tên" : "Tên Công Ty"} <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    {role === "JobSeeker" ? (
                      <User className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Building2 className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`pl-11 py-2.5 rounded-xl transition-all ${validationErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder={role === "JobSeeker" ? "Nguyễn Văn A" : "TechCorp Inc."}
                  />
                </div>
                {validationErrors.fullName && <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ Email <span className="text-red-500">*</span>
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
                    className={`pl-11 py-2.5 rounded-xl transition-all ${validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationErrors.email && <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    disabled={isSubmitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`pl-11 py-2.5 rounded-xl transition-all ${validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder="0987654321"
                  />
                </div>
                {validationErrors.phone && <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-11 pr-10 py-2.5 rounded-xl transition-all ${validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
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
                {validationErrors.password && <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-11 pr-10 py-2.5 rounded-xl transition-all ${validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-brand focus:ring-brand'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>}
              </div>

              <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    disabled={isSubmitting}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="font-semibold text-brand hover:text-brand-hover transition-colors">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="font-semibold text-brand hover:text-brand-hover transition-colors">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
              {validationErrors.terms && <p className="text-xs text-red-600">{validationErrors.terms}</p>}

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl text-base font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "\u0110ang đăng ký..." : "Đăng Ký"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
