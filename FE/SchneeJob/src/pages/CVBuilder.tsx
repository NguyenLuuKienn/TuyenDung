import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Edit3, ChevronLeft, PlusCircle } from "lucide-react";

export function CVBuilder() {
  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4 flex items-center gap-3">
            <div className="bg-brand p-2 rounded-xl text-white">
              <FileText className="h-6 w-6" />
            </div>
            Tạo CV Online
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">Tạo CV chuyên nghiệp, ấn tượng trong vài phút với các mẫu thiết kế sẵn.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold font-display text-gray-900 mb-4">Các Mẫu CV</h2>
                <div className="space-y-4">
                  {[
                    { id: 1, name: "Chuyên Nghiệp", image: "https://picsum.photos/seed/cv1/200/300" },
                    { id: 2, name: "Sáng Tạo", image: "https://picsum.photos/seed/cv2/200/300" },
                    { id: 3, name: "Tối Giản", image: "https://picsum.photos/seed/cv3/200/300" },
                  ].map((template) => (
                    <div key={template.id} className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-brand cursor-pointer transition-all">
                      <img src={template.image} alt={template.name} className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-center py-2 font-medium text-sm">
                        {template.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm min-h-[800px] bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-2xl font-bold font-display text-gray-900">Chỉnh Sửa CV</h2>
                  <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl cursor-pointer">
                      <Edit3 className="h-4 w-4 mr-2" /> Lưu Nháp
                    </Button>
                    <Button className="rounded-xl bg-brand text-white cursor-pointer">
                      <Download className="h-4 w-4 mr-2" /> Tải Xuống PDF
                    </Button>
                  </div>
                </div>

                {/* Mock Editor Area */}
                <div className="space-y-8">
                  {/* Personal Info */}
                  <div className="group relative border border-dashed border-gray-200 rounded-xl p-6 hover:border-brand/50 transition-colors">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-brand cursor-pointer">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                        <PlusCircle className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Họ và Tên</h3>
                        <p className="text-lg text-brand font-medium mb-2">Vị trí ứng tuyển</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Email</span>
                          <span>•</span>
                          <span>Số điện thoại</span>
                          <span>•</span>
                          <span>Địa chỉ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="group relative border border-dashed border-gray-200 rounded-xl p-6 hover:border-brand/50 transition-colors">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-brand cursor-pointer">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 mb-4 border-b-2 border-brand/20 inline-block pb-1">Kinh Nghiệm Làm Việc</h3>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-400">
                        <p>Chưa có kinh nghiệm nào được thêm.</p>
                        <Button variant="link" className="text-brand mt-2 cursor-pointer">Thêm kinh nghiệm</Button>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="group relative border border-dashed border-gray-200 rounded-xl p-6 hover:border-brand/50 transition-colors">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-brand cursor-pointer">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 mb-4 border-b-2 border-brand/20 inline-block pb-1">Học Vấn</h3>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-gray-400">
                        <p>Chưa có thông tin học vấn nào được thêm.</p>
                        <Button variant="link" className="text-brand mt-2 cursor-pointer">Thêm học vấn</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
