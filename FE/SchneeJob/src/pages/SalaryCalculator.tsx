import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calculator, DollarSign, ChevronLeft } from "lucide-react";

export function SalaryCalculator() {
  const [salary, setSalary] = useState<string>("15000000");
  const [type, setType] = useState<"gross" | "net">("gross");

  // Simple mock calculation
  const calculate = () => {
    const amount = Number(salary.replace(/\D/g, ''));
    if (isNaN(amount)) return { gross: 0, net: 0 };
    
    if (type === "gross") {
      return {
        gross: amount,
        net: amount * 0.895 // Mock 10.5% deduction
      };
    } else {
      return {
        gross: amount / 0.895,
        net: amount
      };
    }
  };

  const result = calculate();

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Trở về trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4 flex items-center gap-3">
            <div className="bg-brand p-2 rounded-xl text-white">
              <Calculator className="h-6 w-6" />
            </div>
            Tính Lương Gross/Net
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">Công cụ tính toán lương chính xác theo quy định mới nhất.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold font-display text-gray-900 mb-6">Thông Tin Lương</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức Lương (VNĐ)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="pl-10 py-3 rounded-xl border-gray-200 text-lg font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại Lương</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setType("gross")}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        type === "gross"
                          ? "bg-brand text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Gross sang Net
                    </button>
                    <button
                      onClick={() => setType("net")}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        type === "net"
                          ? "bg-brand text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Net sang Gross
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full rounded-xl py-6 text-lg font-bold cursor-pointer">Tính Toán</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-brand/5 to-transparent">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold font-display text-gray-900 mb-6">Kết Quả</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">LƯƠNG GROSS</p>
                  <p className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.gross)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-brand/20 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                  <p className="text-sm font-medium text-brand uppercase tracking-wider mb-2">LƯƠNG NET (THỰC NHẬN)</p>
                  <p className="text-4xl font-bold text-brand">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.net)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm">Chi tiết các khoản trích trừ (Ước tính)</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Bảo hiểm xã hội (8%)</span>
                      <span className="font-medium">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.gross * 0.08)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Bảo hiểm y tế (1.5%)</span>
                      <span className="font-medium">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.gross * 0.015)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Bảo hiểm thất nghiệp (1%)</span>
                      <span className="font-medium">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.gross * 0.01)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
