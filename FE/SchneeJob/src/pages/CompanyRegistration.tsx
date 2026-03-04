import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, Phone, MapPin, User, Mail, Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { industriesService, type Industry } from "@/services";
import companyService from "@/services/companyService";
import Swal from "sweetalert2";

export function CompanyRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyPhone: "",
    address: "",
    industry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    loadIndustries();
    loadUserEmail();
  }, []);

  const loadUserEmail = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const email = user.email || "";
        setUserEmail(email);
        setFormData(prev => ({
          ...prev,
          contactEmail: email
        }));
      }
    } catch (err) {
      console.error("Failed to load user email:", err);
    }
  };

  const loadIndustries = async () => {
    try {
      setLoadingIndustries(true);
      const response = await industriesService.getAllIndustries();
      const industryList = response.data || [];
      setIndustries(industryList);
    } catch (err) {
      console.error("Failed to load industries:", err);
      setIndustries([]);
    } finally {
      setLoadingIndustries(false);
    }
  };

  const handleWebsiteChange = (value: string) => {
    // Remove any existing https:// or http://
    let cleanValue = value.replace(/^https:\/\/|^http:\/\//i, "");
    setWebsite(cleanValue);
  };

  const getFullWebsiteUrl = (): string => {
    if (!website.trim()) return "";
    if (website.startsWith("http://") || website.startsWith("https://")) {
      return website;
    }
    return `https://${website}`;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit company registration with image data URLs
      const registrationData = {
        companyName: formData.companyName,
        website: getFullWebsiteUrl(),
        companyPhoneNumber: formData.companyPhone,
        address: formData.address,
        industryId: formData.industry,
        logoURL: logoPreview, // Use base64 data URL directly
        coverImageURL: coverPreview, // Use base64 data URL directly
        contactPersonName: formData.contactName,
        contactPersonEmail: formData.contactEmail,
        contactPersonPhoneNumber: formData.contactPhone,
      };

      const response = await companyService.submitRegistration(registrationData);

      if (response.data || response.status === 200 || response.status === 201) {
        // Success - show notification only, don't redirect
        await Swal.fire({
          icon: 'success',
          title: 'Đơn đăng ký thành công!',
          text: 'Đơn đăng ký công ty của bạn đã được gửi thành công. Admin sẽ duyệt trong thời gian sớm nhất. Vui lòng quay lại sau.',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#3B82F6',
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        // Reset form
        setFormData({
          companyName: "",
          companyPhone: "",
          address: "",
          industry: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
        });
        setWebsite("");
        setLogoFile(null);
        setLogoPreview("");
        setCoverFile(null);
        setCoverPreview("");
      } else {
        throw new Error("Gửi đơn không thành công");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Gửi đơn đăng ký thất bại. Vui lòng thử lại.";
      
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi gửi đơn',
        text: errorMessage,
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <CardDescription className="text-gray-500">Các trường có dấu <span className="text-red-600 font-bold">*</span> là bắt buộc.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Company Info Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">1. Thông tin chung</h3>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tên công ty <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="companyName" value={formData.companyName} onChange={handleFormChange} required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="VD: Công ty Cổ phần Công nghệ TechCorp" />
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
                      <div className="absolute inset-y-0 left-11 flex items-center text-gray-500 text-sm font-medium pointer-events-none">
                        https://
                      </div>
                      <Input id="website" type="text" value={website} onChange={(e) => handleWebsiteChange(e.target.value)} className="pl-28 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="example.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại công ty <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="companyPhone" type="tel" value={formData.companyPhone} onChange={handleFormChange} required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="(028) 3812 3456" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Địa chỉ trụ sở chính <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="address" value={formData.address} onChange={handleFormChange} required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ngành nghề hoạt động <span className="text-red-600 font-bold">*</span>
                    </label>
                    <select id="industry" value={formData.industry} onChange={handleFormChange} required disabled={loadingIndustries} className="w-full pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-xl border bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="">{loadingIndustries ? "Đang tải..." : "-- Chọn ngành nghề --"}</option>
                      {industries.map((ind) => (
                        <option key={ind.id || ind.industryId} value={ind.id || ind.industryId}>
                          {ind.name || ind.industryName}
                        </option>
                      ))}
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
                      Họ và tên người liên hệ <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="contactName" value={formData.contactName} onChange={handleFormChange} required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="Nguyễn Văn A" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email người liên hệ (Email tài khoản) <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input 
                        id="contactEmail" 
                        type="email" 
                        value={formData.contactEmail} 
                        readOnly 
                        className="pl-11 py-2.5 rounded-xl border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600" 
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email này được tự động lấy từ tài khoản của bạn và không thể thay đổi</p>
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại người liên hệ <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={handleFormChange} required className="pl-11 py-2.5 rounded-xl border-gray-200 focus:border-brand" placeholder="0901 234 567" />
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
                    {logoPreview ? (
                      <div className="mt-1 relative rounded-xl overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none">
                              <span>Tải ảnh lên</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 2MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ảnh bìa (Cover Image)
                    </label>
                    {coverPreview ? (
                      <div className="mt-1 relative rounded-xl overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeCover}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-brand hover:bg-brand/5 transition-colors cursor-pointer">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none">
                              <span>Tải ảnh lên</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleCoverChange} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                        </div>
                      </div>
                    )}
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
