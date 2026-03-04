import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import companyService from "../services/companyService";
import { industriesService, type Industry } from "@/services";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface RegistrationData {
  requestId: string;
  companyName: string;
  website: string;
  companyPhoneNumber: string;
  address: string;
  industryId: string | number;
  logoURL?: string;
  coverImageURL?: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhoneNumber: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export function EmployerRegistrations() {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({});
  const [website, setWebsite] = useState("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");

  useEffect(() => {
    fetchRegistration();
    loadIndustries();
  }, []);

  const fetchRegistration = async () => {
    try {
      const response = await companyService.getMyRegistration();
      const data = response.data || response;
      setRegistration(data);
      setFormData(data);
      setWebsite(data.website?.replace(/^https:\/\/|^http:\/\//i, "") || "");
      if (data.logoURL) setLogoPreview(data.logoURL);
      if (data.coverImageURL) setCoverPreview(data.coverImageURL);
    } catch (error) {
      console.error("Error fetching registration:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu đơn đăng ký",
        confirmButtonText: "Quay lại",
      }).then(() => {
        navigate("/employer/register-company");
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIndustries = async () => {
    try {
      const response = await industriesService.getAllIndustries();
      setIndustries(response.data || []);
    } catch (err) {
      console.error("Failed to load industries:", err);
    }
  };

  const getFullWebsiteUrl = (): string => {
    if (!website.trim()) return "";
    if (website.startsWith("http://") || website.startsWith("https://")) {
      return website;
    }
    return `https://${website}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWebsiteChange = (value: string) => {
    let cleanValue = value.replace(/^https:\/\/|^http:\/\//i, "");
    setWebsite(cleanValue);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          logoURL: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
        setFormData(prev => ({
          ...prev,
          coverImageURL: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResubmit = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);
    try {
      const submitData = {
        companyName: formData.companyName,
        website: getFullWebsiteUrl(),
        companyPhoneNumber: formData.companyPhoneNumber,
        address: formData.address,
        industryId: formData.industryId,
        logoURL: logoPreview,
        coverImageURL: coverPreview,
        contactPersonName: formData.contactPersonName,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonPhoneNumber: formData.contactPersonPhoneNumber,
      };

      const response = await companyService.submitRegistration(submitData);

      if (response.data || response.status === 200 || response.status === 201) {
        await Swal.fire({
          icon: 'success',
          title: 'Gửi lại thành công!',
          text: 'Đơn đăng ký của bạn đã được gửi lại. Admin sẽ xét duyệt sớm nhất.',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#3B82F6',
        });
        setIsEditing(false);
        fetchRegistration();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Gửi lại đơn thất bại";
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: errorMessage,
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy đơn đăng ký</h2>
          <p className="text-gray-600 mb-6">Bạn chưa gửi đơn đăng ký công ty nào.</p>
          <button
            onClick={() => navigate("/employer/register-company")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Đăng ký công ty
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
      case "submitted":
        return "Đang chờ xét duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const isRejected = (registration.status || "").toLowerCase() === "rejected";

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Trạng thái đơn đăng ký</h1>
          <div className="mt-4">
            <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(registration.status)}`}>
              {getStatusLabel(registration.status)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đơn đăng ký</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mã yêu cầu</p>
                <p className="font-mono text-gray-800">{registration.requestId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ngày gửi</p>
                <p className="text-gray-800">
                  {new Date(registration.requestedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {registration.reviewedAt && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Ngày xét duyệt</p>
                <p className="text-gray-800">
                  {new Date(registration.reviewedAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}

            {registration.adminNotes && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-600 font-semibold mb-2">Ghi chú từ Admin:</p>
                <p className="text-red-800">{registration.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Form Section */}
          {isEditing || isRejected ? (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isRejected ? "Chỉnh sửa và gửi lại đơn đăng ký" : "Chỉnh sửa thông tin"}
              </h2>

              <div className="space-y-8">
                {/* Company Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên công ty <span className="text-red-600">*</span>
                      </label>
                      <Input
                        name="companyName"
                        value={formData.companyName || ""}
                        onChange={handleInputChange}
                        placeholder="Tên công ty"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">https://</span>
                        <Input
                          value={website}
                          onChange={(e) => handleWebsiteChange(e.target.value)}
                          placeholder="example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại công ty <span className="text-red-600">*</span>
                      </label>
                      <Input
                        name="companyPhoneNumber"
                        value={formData.companyPhoneNumber || ""}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ <span className="text-red-600">*</span>
                      </label>
                      <Input
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ công ty"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngành nghề <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="industryId"
                        value={formData.industryId || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Chọn ngành nghề</option>
                        {industries.map(ind => (
                          <option key={ind.industryId} value={ind.industryId}>
                            {ind.industryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo công ty
                      </label>
                      {logoPreview && (
                        <div className="relative mb-3">
                          <img src={logoPreview} alt="logo" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setLogoPreview("")}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh bìa
                      </label>
                      {coverPreview && (
                        <div className="relative mb-3">
                          <img src={coverPreview} alt="cover" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setCoverPreview("")}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={handleCoverChange}
                        accept="image/*"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người liên hệ</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên <span className="text-red-600">*</span>
                      </label>
                      <Input
                        name="contactPersonName"
                        value={formData.contactPersonName || ""}
                        onChange={handleInputChange}
                        placeholder="Tên đầy đủ"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (tài khoản của bạn)
                      </label>
                      <Input
                        name="contactPersonEmail"
                        value={formData.contactPersonEmail || ""}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-600">*</span>
                      </label>
                      <Input
                        name="contactPersonPhoneNumber"
                        value={formData.contactPersonPhoneNumber || ""}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="border-t pt-8 flex gap-4">
                  <button
                    onClick={handleResubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi lại đơn đăng ký"}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Read-only details */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết công ty</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Tên công ty</p>
                      <p className="text-gray-800 font-semibold">{registration.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <p className="text-gray-800 font-semibold">{registration.website}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-gray-800 font-semibold">{registration.companyPhoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="text-gray-800 font-semibold">{registration.address}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người liên hệ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Tên</p>
                      <p className="text-gray-800 font-semibold">{registration.contactPersonName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-800 font-semibold">{registration.contactPersonEmail}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="text-gray-800 font-semibold">{registration.contactPersonPhoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t mt-8 pt-8 flex gap-4">
                {isRejected && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Chỉnh sửa và gửi lại
                  </button>
                )}
                {(registration.status || "").toLowerCase() === "approved" && (
                  <button
                    onClick={() => navigate("/employer/dashboard")}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Đi đến Dashboard
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Quay về Trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
