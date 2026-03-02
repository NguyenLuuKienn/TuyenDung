import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, Phone, MapPin, User, Mail, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function CompanyRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Đơn đăng ký công ty của bạn đã được gửi thành công và đang chờ Admin phê duyệt!");
      navigate("/employer/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 font-display">Đăng Ký Hồ Sơ Công Ty</h1>
          <p className="mt-3 text-lg text-gray-500">
            Vui lòng cung cấp thông tin chi tiết về doanh nghiệp của bạn để chúng tôi xác minh và tạo hồ sơ nhà tuyển dụng.
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-gray-900">Thông Tin Doanh Nghiệp</CardTitle>
            <CardDescription className="text-gray-500">Các trường có dấu * là bắt buộc.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Company Info Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">1. Thông tin chung</h3>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên công ty *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="companyName" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="VD: Công ty Cổ phần Công nghệ TechCorp" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Website
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="website" type="url" className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="https://www.example.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại công ty *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="companyPhone" type="tel" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="(028) 3812 3456" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ trụ sở chính *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="address" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngành nghề hoạt động *
                    </label>
                    <select id="industry" required className="w-full pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-xl border bg-white text-gray-900">
                      <option value="">-- Chọn ngành nghề --</option>
                      <option value="1">Công nghệ thông tin / Phần mềm</option>
                      <option value="2">Tài chính / Ngân hàng</option>
                      <option value="3">Bán lẻ / Tiêu dùng</option>
                      <option value="4">Sản xuất</option>
                      <option value="5">Giáo dục</option>
                      <option value="6">Y tế / Chăm sóc sức khỏe</option>
                      <option value="7">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Person Section */}
              <div className="space-y-5 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">2. Thông tin người liên hệ</h3>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên người liên hệ *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="contactName" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="Nguyễn Văn A" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email người liên hệ *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="contactEmail" type="email" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="nguyenvana@techcorp.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại người liên hệ *
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="contactPhone" type="tel" required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="0901 234 567" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-5 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">3. Hình ảnh doanh nghiệp</h3>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Logo công ty
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none">
                            <span>Tải ảnh lên</span>
                            <input id="logoUrl" name="logoUrl" type="file" className="sr-only" accept="image/*" />
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ảnh bìa (Cover Image)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none">
                            <span>Tải ảnh lên</span>
                            <input id="coverUrl" name="coverUrl" type="file" className="sr-only" accept="image/*" />
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-xl px-6 cursor-pointer">
                  Hủy bỏ
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 cursor-pointer">
                  {isSubmitting ? "Đang gửi..." : "Gửi Đơn Đăng Ký"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
