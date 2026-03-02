import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Search, MapPin, Briefcase, Star, Loader } from "lucide-react";
import { companyService } from "@/services";

export function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await companyService.getAll();
        const data = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
        setCompanies(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Không thể tải danh sách công ty. Vui lòng thử lại sau.");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => 
    (company.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((company.location || company.city) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gray-50/50 min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-brand text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Khám Phá Công Ty Hàng Đầu</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Tìm hiểu về môi trường làm việc, văn hóa và các cơ hội nghề nghiệp tại các công ty hàng đầu.
          </p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-lg flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Tên công ty, ngành nghề, địa điểm..." 
                className="pl-12 border-none bg-transparent shadow-none focus-visible:ring-0 h-12 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 rounded-xl font-bold">Tìm Kiếm</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display text-gray-900">
            {filteredCompanies.length} Công ty được tìm thấy
          </h2>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        {filteredCompanies.length === 0 ? (
          <Card className="border-none shadow-sm bg-gray-50">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">Không tìm thấy công ty nào.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar src={company.logo || company.logoUrl || "https://picsum.photos/seed/company/200/200"} alt={company.name} className="h-16 w-16 rounded-2xl border border-gray-100 shadow-sm group-hover:scale-105 transition-transform" />
                    <div>
                      <Link to={`/company/${company.id}`} className="text-lg font-bold font-display text-gray-900 group-hover:text-brand transition-colors line-clamp-1">
                        {company.name}
                      </Link>
                      <div className="flex items-center gap-1 text-amber-500 mt-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-bold text-gray-900">{company.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                    {company.description || company.companyDescription || "Một công ty tuyệt vời"}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary" className="bg-gray-50 text-gray-600 border border-gray-100">
                      <MapPin className="h-3 w-3 mr-1" /> {company.location || company.city || "Tương lượng"}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-50 text-gray-600 border border-gray-100">
                      <Briefcase className="h-3 w-3 mr-1" /> {company.industry || "Công nghệ"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-brand font-bold text-sm bg-brand/5 px-3 py-1 rounded-lg">
                      {company.jobsCount || 0} việc làm đang mở
                    </span>
                    <Link to={`/company/${company.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand hover:bg-brand/5 rounded-full">
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
