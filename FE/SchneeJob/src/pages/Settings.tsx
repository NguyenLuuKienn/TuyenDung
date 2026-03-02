import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Globe, Monitor, Moon, Sun, Bell, Shield, Smartphone } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("vi");

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">Cài Đặt Hệ Thống</h1>
          <p className="text-lg text-gray-600 max-w-2xl">Tùy chỉnh giao diện, ngôn ngữ và các thiết lập hệ thống khác.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {[
              { id: "appearance", label: "Giao Diện & Màu Sắc", icon: Monitor, active: true },
              { id: "language", label: "Ngôn Ngữ", icon: Globe, active: false },
              { id: "notifications", label: "Thông Báo", icon: Bell, active: false },
              { id: "privacy", label: "Quyền Riêng Tư", icon: Shield, active: false },
              { id: "devices", label: "Thiết Bị Đăng Nhập", icon: Smartphone, active: false },
            ].map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                  item.active
                    ? "bg-brand/5 text-brand"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.active ? "" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-bold font-display text-gray-900">Giao Diện (Theme)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${theme === "light" ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <Sun className={`h-8 w-8 mb-3 ${theme === "light" ? "text-brand" : "text-gray-400"}`} />
                    <span className={`font-semibold ${theme === "light" ? "text-brand" : "text-gray-600"}`}>Sáng</span>
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${theme === "dark" ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <Moon className={`h-8 w-8 mb-3 ${theme === "dark" ? "text-brand" : "text-gray-400"}`} />
                    <span className={`font-semibold ${theme === "dark" ? "text-brand" : "text-gray-600"}`}>Tối</span>
                  </button>
                  <button 
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer ${theme === "system" ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <Monitor className={`h-8 w-8 mb-3 ${theme === "system" ? "text-brand" : "text-gray-400"}`} />
                    <span className={`font-semibold ${theme === "system" ? "text-brand" : "text-gray-600"}`}>Hệ Thống</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-bold font-display text-gray-900">Ngôn Ngữ</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${language === "vi" ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇻🇳</span>
                      <span className="font-medium text-gray-900">Tiếng Việt</span>
                    </div>
                    <input type="radio" name="language" value="vi" checked={language === "vi"} onChange={() => setLanguage("vi")} className="h-5 w-5 text-brand focus:ring-brand" />
                  </label>
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${language === "en" ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇺🇸</span>
                      <span className="font-medium text-gray-900">English</span>
                    </div>
                    <input type="radio" name="language" value="en" checked={language === "en"} onChange={() => setLanguage("en")} className="h-5 w-5 text-brand focus:ring-brand" />
                  </label>
                </div>
                <div className="pt-6 flex justify-end">
                  <Button className="rounded-full px-8 cursor-pointer">Lưu Cài Đặt</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
