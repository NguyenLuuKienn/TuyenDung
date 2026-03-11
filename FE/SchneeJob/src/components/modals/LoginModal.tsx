import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import authService from "@/services/authService";
import companyService from "@/services/companyService";
import { extractRole } from "@/utils/roleUtils";
import Swal from "sweetalert2";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
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

      const data = response.data;
      let token = data.token;
      let userInfo = data.userInfo || data.user || data;

      if (!token) {
        token = btoa(JSON.stringify({ email, timestamp: Date.now() }));
      }

      if (!userInfo || !(userInfo.email || userInfo.userId || userInfo.id)) {
        throw new Error(data.message || "Đăng nhập thất bại. Vui lòng thử lại");
      }

      const extractedRole = extractRole(userInfo);
      const user = {
        id: userInfo?.userID || userInfo?.id || userInfo?.userId,
        email: userInfo?.email || email,
        name: userInfo?.name || userInfo?.fullName || "User",
        fullName: userInfo?.name || userInfo?.fullName || "User",
        avatar: userInfo?.avatar || userInfo?.avatarURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo?.name || "User")}&background=random`,
        role: extractedRole,
        companyId: userInfo?.companyId,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      globalThis.dispatchEvent(new CustomEvent("authChange", { detail: { user, token } }));

      // Close modal first
      onClose();

      // Then show success message
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công!",
          text: `Chào mừng, ${user.fullName}!`,
          confirmButtonText: "Tiếp tục",
          confirmButtonColor: "#3B82F6",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          // Redirect based on role after alert closes
          const userRole = user.role || "JobSeeker";
          if (userRole === "Employer") {
            handleEmployerRedirect(user);
          }
        });
      }, 300);

      // Reset form
      setEmail("");
      setPassword("");
      setError("");
      return;

      // Function to handle employer redirect
      async function handleEmployerRedirect(user: any) {
        try {
          const registrationRes = await companyService.getMyRegistration();
          const registration = registrationRes.data;

          if (!registration) {
            window.location.href = "/employer/register-company";
          } else {
            const status = (registration.status || "").toLowerCase().trim();
            if (status === "approved") {
              window.location.href = "/employer/dashboard";
            } else if (status === "pending" || status === "submitted") {
              window.location.href = "/employer/registrations";
            } else {
              window.location.href = "/employer/register-company";
            }
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            window.location.href = "/employer/register-company";
          }
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng Nhập">
      <div className="space-y-4">
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

        <form noValidate className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-11 py-2.5 rounded-xl transition-all ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInvalid={(e) => e.preventDefault()}
                className={`pl-11 pr-10 py-2.5 rounded-xl transition-all ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand focus:ring-brand"
                }`}
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
                id="modal-remember-me"
                name="remember-me"
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="modal-remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-base font-semibold cursor-pointer"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </div>
        </form>

        <div className="relative pt-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Chưa có tài khoản?</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            onClose();
            onSwitchToRegister();
          }}
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl text-base font-semibold cursor-pointer"
        >
          Đăng Ký Ngay
        </Button>
      </div>
    </Modal>
  );
}
