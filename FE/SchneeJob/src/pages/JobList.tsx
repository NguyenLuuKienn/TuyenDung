import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Search, 
  Filter, 
  Loader, 
  Heart, 
  Zap, 
  FileText, 
  ChevronDown, 
  RotateCcw,
  X
} from "lucide-react";
import { jobService } from "@/services";
import type { Job } from "@/services";

export function JobList() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobService.getAll();
        const jobsData = Array.isArray(response.data) ? response.data : (response as any)?.data || [];
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        setError("Không thể tải việc làm. Vui lòng thử lại sau.");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on active filter
  const filteredJobs = jobs.filter(job => {
    let matches = true;
    
    if (activeFilter === "urgent") {
      matches = matches && job.isPriority;
    } else if (activeFilter === "no_cv") {
      matches = matches && !job.jobRequirements?.includes("CV");
    }
    
    if (searchTerm) {
      matches = matches && (
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedLocation) {
      matches = matches && job.location?.includes(selectedLocation);
    }
    
    return matches;
  });

  return (
    <div className="bg-[#f4f5f5] min-h-screen pb-16">
      {/* Professional Header Banner - Matching Screenshot */}
      <div className="bg-[#411c96] py-6 shadow-lg">
        <div className="container mx-auto px-4 max-w-[1300px]">
          {/* Top Search Row */}
          <div className="flex flex-col lg:flex-row gap-2 items-center bg-transparent">
            {/* Search Input */}
            <div className="relative flex-[2] w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input 
                type="text" 
                placeholder="Tìm kiếm cơ hội việc làm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none bg-white font-sans"
              />
            </div>

            {/* Profession Dropdown */}
            <div className="relative flex-1 w-full bg-white rounded flex items-center px-4 py-2.5 cursor-pointer">
              <select 
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                className="w-full bg-transparent border-none appearance-none text-[14px] text-gray-700 focus:outline-none cursor-pointer pr-4"
              >
                <option value="">Lọc theo nghề nghiệp</option>
                <option value="IT">Công nghệ thông tin</option>
                <option value="Sales">Kinh doanh / Bán hàng</option>
                <option value="Marketing">Marketing</option>
              </select>
              <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Dropdown */}
            <div className="relative flex-1 w-full bg-white rounded flex items-center px-4 py-2.5 cursor-pointer">
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent border-none appearance-none text-[14px] text-gray-700 focus:outline-none cursor-pointer pr-4"
              >
                <option value="">Lọc theo tỉnh thành</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
              <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Button */}
            <Button className="w-full lg:w-auto bg-[#2f91ff] hover:bg-[#2676d1] text-white font-bold h-[42px] px-8 rounded shadow-sm text-[15px]">
              Tìm kiếm
            </Button>

            {/* Advanced Filter Button */}
            <Button variant="ghost" className="w-full lg:w-auto bg-[#5a36b3] hover:bg-[#6c48c5] text-white border-none h-[42px] px-5 rounded flex items-center justify-center gap-2 text-[14px] font-medium">
              <Filter className="h-4 w-4" />
              Lọc nâng cao
            </Button>
          </div>

          {/* Bottom Filter Pills Row */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {/* Urgent Tag */}
            <button 
              onClick={() => setActiveFilter(activeFilter === "urgent" ? "all" : "urgent")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded bg-white border h-[38px] whitespace-nowrap transition-colors text-[14px] ${
                activeFilter === "urgent" ? "border-[#2f91ff] text-[#2f91ff] font-semibold" : "border-gray-100 text-[#4d5965]"
              }`}
            >
              <Zap className={`h-4 w-4 ${activeFilter === "urgent" ? "text-[#2f91ff]" : "text-blue-500"}`} />
              Tuyển nhanh
            </button>

            {/* No CV Tag */}
            <button 
              onClick={() => setActiveFilter(activeFilter === "no_cv" ? "all" : "no_cv")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded bg-white border h-[38px] whitespace-nowrap transition-colors text-[14px] ${
                activeFilter === "no_cv" ? "border-[#2f91ff] text-[#2f91ff] font-semibold" : "border-gray-100 text-[#4d5965]"
              }`}
            >
              <FileText className={`h-4 w-4 ${activeFilter === "no_cv" ? "text-[#2f91ff]" : "text-blue-500"}`} />
              Việc không cần CV
            </button>

            {/* Mock dropdown filters as shown in your image */}
            {["Tất cả kinh...", "Tất cả mức...", "Tất cả cấp...", "Tất cả trình...", "Loại công...", "Tất cả giới..."].map((label) => (
              <button key={label} className="flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-gray-100 h-[38px] text-[#4d5965] whitespace-nowrap text-[14px] hover:bg-gray-50">
                {label}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            ))}

            {/* Xoa Loc */}
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedLocation("");
                setSelectedProfession("");
                setActiveFilter("all");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-white/90 hover:text-white whitespace-nowrap text-[14px] ml-2"
            >
              <RotateCcw className="h-4 w-4" />
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-6 max-w-[1300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] text-[#4d5965]">
            Tìm thấy <span className="font-bold text-[#2f91ff]">{filteredJobs.length}</span> việc làm phù hợp với yêu cầu của bạn.
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin text-[#411c96]" />
            </div>
          ) : error ? (
            <div className="col-span-full bg-red-50 p-4 rounded border border-red-100 text-red-600 text-center">
              {error}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded border border-gray-200 text-center">
              <p className="text-gray-500">Không tìm thấy công việc nào phù hợp.</p>
            </div>
          ) : filteredJobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm hover:shadow-md hover:ring-1 hover:ring-[#411c96]/10 transition-all bg-white overflow-hidden group">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Employer Logo */}
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded border border-gray-100 flex items-center justify-center bg-white overflow-hidden">
                      <img 
                        src={job.company?.logo || "https://picsum.photos/seed/company/100/100"} 
                        alt={job.company?.name || "Company"} 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/60")}
                      />
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link to={`/jobs/${job.id}`} className="text-[#333] font-bold text-[16px] hover:text-[#411c96] transition-colors line-clamp-1 block uppercase">
                        {job.jobTitle || job.title}
                      </Link>
                      <button className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <p className="text-[#6f78a1] text-[14px] font-medium line-clamp-1 mt-0.5">
                      {job.company?.name || "Tên công ty đa quốc gia"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1 bg-[#f4f7ff] px-2 py-0.5 rounded text-[13px] font-semibold text-[#411c96]">
                        <DollarSign className="h-3.5 w-3.5" />
                        {job.salaryMax ? `${job.salaryMin}-${job.salaryMax} triệu` : "Thỏa thuận"}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-[13px]">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || "Hà Nội"}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-[12px] ml-auto">
                        Cập nhật 2 giờ trước
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
