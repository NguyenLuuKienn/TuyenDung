import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Bookmark, MapPin, Briefcase, DollarSign, Clock } from "lucide-react";
import { jobService, savedJobService } from "@/services";
import { useState } from "react";

interface JobCardProps {
  job: any;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  isSaved?: boolean;
}

export function JobCard({ job, onSaveToggle, isSaved: initialIsSaved = false }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const jobId = job.jobId || job.id;
  const jobTitle = job.jobTitle || job.title;
  const companyName = typeof job.company === 'string' ? job.company : (job.company?.name || job.company?.companyName || job.companyName || 'Company');
  const companyLogo = `https://picsum.photos/seed/${jobId}/100/100`; // Random image based on job ID
  const description = job.jobDescription || job.description || "";
  const skills = job.jobSkills || job.skills || [];
  const salaryMin = job.salaryMin || job.minimumSalary;
  const salaryMax = job.salaryMax || job.maximumSalary;
  const employmentType = job.employmentType || job.type || "Full-time";
  const experience = job.experience || job.yearsRequired || "0-1 năm";
  const location = job.location || job.workingLocation || "Tương lượng";
  const workMode = job.workMode || job.remote || "On-site";
  const postDate = job.postedAt || job.createdAt;
  const isUrgent = job.isUrgent || false;

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!isSaved) {
        await savedJobService.saveJob(jobId);
        setIsSaved(true);
      } else {
        await savedJobService.unsaveJob(jobId);
        setIsSaved(false);
      }
      onSaveToggle?.(jobId, !isSaved);
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateDescription = (text: string, maxChars: number = 120) => {
    if (!text) return "";
    return text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Card className="group hover:border-brand/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        {/* Main Section - Logo + Info + Button in one row */}
        <div className="flex gap-4 sm:gap-5 items-start mb-4">
          {/* Company Logo */}
          <Avatar
            src={companyLogo}
            alt={companyName}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-gray-100 shadow-sm flex-shrink-0"
          />

          {/* Job Information */}
          <div className="flex-1 min-w-0">
            {/* Job Title and Urgent Badge */}
            <div className="flex items-start gap-2 mb-1">
              <Link to={`/jobs/${jobId}`} className="font-bold text-base sm:text-lg text-gray-900 hover:text-brand transition-colors line-clamp-2 flex-1">
                {jobTitle}
              </Link>
              {isUrgent && (
                <Badge className="bg-red-100 text-red-700 font-semibold text-xs whitespace-nowrap mt-0.5">
                  Tuyển Gấp
                </Badge>
              )}
            </div>

            {/* Company Name */}
            <Link to={`/company/${job.companyId}`} className="text-sm font-medium text-gray-600 hover:text-brand transition-colors block mb-1">
              {companyName}
            </Link>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveJob}
            disabled={isLoading}
            className={`text-gray-300 hover:text-brand hover:bg-brand/10 rounded-full transition-colors flex-shrink-0 ${
              isSaved ? "text-brand bg-brand/10" : ""
            }`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {truncateDescription(description)}
        </p>

        {/* Job Specifications and Apply Button */}
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700">
              <Briefcase className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="truncate">{employmentType}</span>
            </div>

            {salaryMin && salaryMax && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-emerald-700">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">${salaryMin} - ${salaryMax}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{experience}</span>
            </div>

            {workMode === "Remote" && (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs sm:text-sm font-medium text-emerald-700">
                <span>Làm từ xa</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 text-xs sm:text-sm font-medium text-gray-600">
              <span>{formatDate(postDate)}</span>
            </div>
          </div>

          {/* Apply Button */}
          <Link to={`/jobs/${jobId}`}>
            <Button className="bg-brand hover:bg-brand/90 text-white font-semibold rounded-full px-6 sm:px-8 py-2 transition-all hover:scale-105 cursor-pointer whitespace-nowrap flex-shrink-0">
              Ứng Tuyển
            </Button>
          </Link>
        </div>

        {skills && Array.isArray(skills) && skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.slice(0, 3).map((skill: any, idx: number) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-xs"
              >
                {typeof skill === "string" ? skill : skill.name || skill.skillName}
              </Badge>
            ))}
            {Array.isArray(skills) && skills.length > 3 && (
              <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-500 font-medium text-xs">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
