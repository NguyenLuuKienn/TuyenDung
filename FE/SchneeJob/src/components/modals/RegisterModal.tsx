import { useState } from "react";
import { Mail, Lock, User, Building2, Phone, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import authService from "@/services/authService";
import Swal from "sweetalert2";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
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

      if (response.data && (response.data.email || response.data.userId || response.data.companyId)) {
        const token = response.data.token || btoa(JSON.stringify({ email: email.trim(), timestamp: Date.now() }));

        const userData = response.data;
        const user = {
          id: userData.userId || userData.id,
          email: userData.email || email,
          name: userData.fullName || userData.companyName || fullName,
          fullName: userData.fullName || userData.companyName || fullName,
          avatar: userData.avatarURL || userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
          role: role === "JobSeeker" ? "JobSeeker" : "Employer",
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        window.dispatchEvent(new CustomEvent("authChange", { detail: { user, token } }));

        // Close modal first, then show success message
        onClose();
        
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Đăng ký thành công!",
            text: `Chào mừng ${user.fullName}, tài khoản của bạn đã được tạo!`,
            confirmButtonText: "Tiếp tục",
            confirmButtonColor: "#3B82F6",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        }, 300);

        // Reset form
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);
        setError("");
        setValidationErrors({});
      } else {
        throw new Error(response.data?.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Đăng ký thất bại. Vui lòng thử lại";

      const errorText = errorMessage.toLowerCase();
      if (errorText.includes("already exists") || errorText.includes("already registered")) {
        errorMessage = "Email này đã được đăng ký. Vui lòng sử dụng email khác.";
      } else if (errorText.includes("invalid email")) {
        errorMessage = "Định dạng email không hợp lệ.";
      } else if (errorText.includes("password")) {
        errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng Ký Tài Khoản">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
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

        <div className="flex justify-center gap-3 bg-gray-50 p-1 rounded-lg">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setRole("JobSeeker");
              setValidationErrors({});
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              role === "JobSeeker"
                ? "bg-white text-brand shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="h-4 w-4 inline-block mr-1" />
            Ứng Viên
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setRole("Employer");
              setValidationErrors({});
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              role === "Employer"
                ? "bg-white text-brand shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Building2 className="h-4 w-4 inline-block mr-1" />
            Nhà Tuyển Dụng
          </button>
        </div>

        <form noValidate className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-gray-700 mb-1">
              {role === "JobSeeker" ? "Họ và Tên" : "Tên Công Ty"} <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {role === "JobSeeker" ? (
                  <User className="h-4 w-4 text-gray-400" />
                ) : (
                  <Building2 className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <Input
                id="reg-name"
                name="name"
                type="text"
                disabled={isSubmitting}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-10 py-2 rounded-lg text-sm transition-all ${
                  validationErrors.fullName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder={role === "JobSeeker" ? "Nguyễn Văn A" : "TechCorp Inc."}
              />
            </div>
            {validationErrors.fullName && <p className="mt-1 text-xs text-red-600">{validationErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-10 py-2 rounded-lg text-sm transition-all ${
                  validationErrors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder="you@example.com"
              />
            </div>
            {validationErrors.email && <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-xs font-medium text-gray-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="reg-phone"
                name="phone"
                type="tel"
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-10 py-2 rounded-lg text-sm transition-all ${
                  validationErrors.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder="0987654321"
              />
            </div>
            {validationErrors.phone && <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-10 pr-10 py-2 rounded-lg text-sm transition-all ${
                  validationErrors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="reg-confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                onInvalid={(e) => e.preventDefault()}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-10 py-2 rounded-lg text-sm transition-all ${
                  validationErrors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start pt-2">
            <div className="flex items-center h-5">
              <input
                id="reg-terms"
                name="terms"
                type="checkbox"
                disabled={isSubmitting}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer disabled:opacity-50"
              />
            </div>
            <label htmlFor="reg-terms" className="ml-2 block text-xs text-gray-600">
              Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
            </label>
          </div>
          {validationErrors.terms && <p className="text-xs text-red-600">{validationErrors.terms}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg text-sm font-semibold cursor-pointer"
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng Ký"}
          </Button>
        </form>

        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-500 font-medium">Đã có tài khoản?</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            onClose();
            onSwitchToLogin();
          }}
          disabled={isSubmitting}
          className="w-full py-2 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Đăng Nhập
        </Button>
      </div>
    </Modal>
  );
}
