import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Upload, Plus, Edit2, Trash2, ChevronRight, CheckCircle2, Clock, XCircle, Save, X, Loader, Heart, Bell, Settings, Eye, Globe, Calendar, Users, Star, Award, DollarSign } from "lucide-react";
import { profileService, resumeService, applicationService, savedJobService, jobService } from "@/services";
import experienceService from "@/services/experienceService";
import educationService from "@/services/educationService";
import api from "@/services/api";
import type { JobSeekerProfile, Job } from "@/services";
import type { Resume } from "@/services/resumeService";
import type { Application } from "@/services/applicationService";
import type { SavedJob } from "@/services/savedJobService";
import { getStoredUser } from "@/utils/roleUtils";
import Swal from "sweetalert2";

export function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [showSeekerSettings, setShowSeekerSettings] = useState(true);

  // Experience form state
  const [expFormData, setExpFormData] = useState({
    jobTitle: "",
    companyName: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // Education form state
  const [eduFormData, setEduFormData] = useState({
    degree: "",
    schoolName: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  // Resume status helpers
  const handleViewResume = (resume: Resume) => {
    setViewingResume(resume);
    setShowViewResumeModal(true);
  };

  const handleDeleteResume = async (resumeId: string | number) => {
    Swal.fire({
      title: "Xóa CV?",
      text: "Bạn có chắc muốn xóa CV này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await (resumeService as any).delete(resumeId.toString());
          setResumes(prev => prev.filter(r => (r.resumeId as any) !== resumeId.toString() && (r.resumeId as any) !== Number(resumeId)));
          Swal.fire("Thành công!", "CV đã được xóa.", "success");
        } catch (err: any) {
          Swal.fire("Lỗi!", err.response?.data?.message || "Không thể xóa CV", "error");
        }
      }
    });
  };

  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingResumeTitle, setEditingResumeTitle] = useState("");
  const [showEditResumeModal, setShowEditResumeModal] = useState(false);
  const [viewingResume, setViewingResume] = useState<Resume | null>(null);
  const [showViewResumeModal, setShowViewResumeModal] = useState(false);

  // Profile edit state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    phone: "",
    city: "",
    gender: "",
    dateOfBirth: "",
    headline: "",
    summary: "",
  });

  // Skills state
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [loadingSkills, setLoadingSkills] = useState(false);

  const handleEditResume = (resume: Resume) => {
    setEditingResumeId((resume.resumeId || resume.id) as string);
    setEditingResumeTitle(resume.title || resume.fileName || "");
    setShowEditResumeModal(true);
  };

  const handleSaveResumeTitle = async () => {
    if (!editingResumeTitle.trim()) {
      Swal.fire("Cảnh báo", "Vui lòng nhập tên CV", "warning");
      return;
    }

    try {
      const resume = resumes.find(r => (r.resumeId || r.id) === editingResumeId);
      if (resume) {
        await resumeService.update(
          editingResumeId as string,
          editingResumeTitle,
          resume.fileName || "",
          resume.fileType || "PDF"
        );
        
        // Update local state
        setResumes(prev => prev.map(r => 
          (r.resumeId || r.id) === editingResumeId 
            ? { ...r, title: editingResumeTitle }
            : r
        ));
        
        Swal.fire("Thành công!", "CV đã được cập nhật tên.", "success");
        setShowEditResumeModal(false);
        setEditingResumeId(null);
        setEditingResumeTitle("");
      }
    } catch (err: any) {
      Swal.fire("Lỗi!", err.response?.data?.message || "Không thể cập nhật CV", "error");
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      alert("Vui lòng chọn file PDF hoặc DOCX");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    try {
      const uploadResponse = await (resumeService as any).uploadFile(file);
      const fileURL = uploadResponse.data?.url || uploadResponse.data;

      const resumeData = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileURL,
        fileType: file.type.includes("pdf") ? "PDF" : "DOCX",
      };

      const createResponse = await resumeService.create(resumeData);
      if (createResponse?.data) {
        const resumeData = (createResponse.data as any)?.data || createResponse.data;
        setResumes(prev => [...prev, resumeData as Resume]);
      }
      alert("Tải CV thành công!");
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to upload resume:", err);
      alert("Lỗi: Không thể tải CV. Vui lòng thử lại");
    }
  };

  const handleDeleteExperience = (index: number) => {
    const exp = profile?.experiences?.[index];
    Swal.fire({
      title: "Xóa kinh nghiệm?",
      text: `Bạn có chắc muốn xóa kinh nghiệm: ${exp?.jobTitle || "N/A"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await experienceService.deleteExperience(exp?.experienceId || index);
          if (profile) {
            const updatedExperiences = profile.experiences?.filter((_, i) => i !== index) || [];
            setProfile({
              ...profile,
              experiences: updatedExperiences,
            });
          }
          Swal.fire("Thành công!", "Kinh nghiệm đã được xóa.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", "Không thể xóa kinh nghiệm. Vui lòng thử lại.", "error");
        }
      }
    });
  };

  const handleEditExperience = (index: number) => {
    setEditingExperienceId(index);
    setIsAddingExperience(true);
  };

  const handleDeleteEducation = (index: number) => {
    const edu = profile?.educations?.[index];
    Swal.fire({
      title: "Xóa học vấn?",
      text: `Bạn có chắc muốn xóa học vấn: ${edu?.degree || "N/A"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await educationService.deleteEducation(edu?.educationId || index);
          if (profile) {
            const updatedEducations = profile.educations?.filter((_, i) => i !== index) || [];
            setProfile({
              ...profile,
              educations: updatedEducations,
            });
          }
          Swal.fire("Thành công!", "Học vấn đã được xóa.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", "Không thể xóa học vấn. Vui lòng thử lại.", "error");
        }
      }
    });
  };

  const handleEditEducation = (index: number) => {
    setEditingEducationId(index);
    setIsAddingEducation(true);
  };

  // Handle save experience
  const handleSaveExperience = async () => {
    if (!expFormData.jobTitle || !expFormData.companyName || !expFormData.startDate) {
      Swal.fire("Cảnh báo", "Vui lòng điền các trường bắt buộc", "warning");
      return;
    }

    try {
      setIsSaving(true);
      
      if (editingExperienceId !== null) {
        // Update existing experience
        const exp = profile?.experiences?.[editingExperienceId];
        await experienceService.updateExperience(exp?.experienceId || editingExperienceId, {
          jobTitle: expFormData.jobTitle,
          companyName: expFormData.companyName,
          location: "",
          startDate: expFormData.startDate,
          endDate: expFormData.endDate,
          description: expFormData.description,
        });
        Swal.fire("Thành công!", "Kinh nghiệm đã được cập nhật.", "success");
      } else {
        // Add new experience
        await experienceService.addExperience({
          jobTitle: expFormData.jobTitle,
          companyName: expFormData.companyName,
          location: "",
          startDate: expFormData.startDate,
          endDate: expFormData.endDate,
          description: expFormData.description,
        });
        Swal.fire("Thành công!", "Kinh nghiệm đã được thêm.", "success");
      }

      // Reload profile
      const updatedProfile = await profileService.getMyProfile();
      setProfile((updatedProfile as any).data);

      // Reset form and close modal
      setExpFormData({
        jobTitle: "",
        companyName: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setIsAddingExperience(false);
      setEditingExperienceId(null);
    } catch (err: any) {
      Swal.fire("Lỗi!", err.response?.data?.message || "Không thể lưu kinh nghiệm", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save education
  const handleSaveEducation = async () => {
    if (!eduFormData.degree || !eduFormData.schoolName) {
      Swal.fire("Cảnh báo", "Vui lòng điền các trường bắt buộc", "warning");
      return;
    }

    try {
      setIsSaving(true);

      if (editingEducationId !== null) {
        // Update existing education
        const edu = profile?.educations?.[editingEducationId];
        await educationService.updateEducation(edu?.educationId || editingEducationId, {
          degree: eduFormData.degree,
          schoolName: eduFormData.schoolName,
          fieldOfStudy: eduFormData.fieldOfStudy,
          startDate: eduFormData.startDate,
          endDate: eduFormData.endDate,
          description: eduFormData.description,
        });
        Swal.fire("Thành công!", "Học vấn đã được cập nhật.", "success");
      } else {
        // Add new education
        await educationService.addEducation({
          degree: eduFormData.degree,
          schoolName: eduFormData.schoolName,
          fieldOfStudy: eduFormData.fieldOfStudy,
          startDate: eduFormData.startDate,
          endDate: eduFormData.endDate,
          description: eduFormData.description,
        });
        Swal.fire("Thành công!", "Học vấn đã được thêm.", "success");
      }

      // Reload profile
      const updatedProfile = await profileService.getMyProfile();
      setProfile((updatedProfile as any).data);

      // Reset form and close modal
      setEduFormData({
        degree: "",
        schoolName: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setIsAddingEducation(false);
      setEditingEducationId(null);
    } catch (err: any) {
      Swal.fire("Lỗi!", err.response?.data?.message || "Không thể lưu học vấn", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle opening edit experience modal
  const handleOpenEditExperience = (index: number) => {
    const exp = profile?.experiences?.[index];
    if (exp) {
      setExpFormData({
        jobTitle: exp.jobTitle || "",
        companyName: exp.companyName || "",
        startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : "",
        endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : "",
        description: exp.description || "",
      });
      handleEditExperience(index);
    }
  };

  // Handle opening edit education modal
  const handleOpenEditEducation = (index: number) => {
    const edu = profile?.educations?.[index];
    if (edu) {
      setEduFormData({
        degree: edu.degree || "",
        schoolName: edu.schoolName || "",
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : "",
        endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : "",
        description: edu.description || "",
      });
      handleEditEducation(index);
    }
  };

  const handleRemoveSavedJob = async (jobId: string | number) => {
    if (window.confirm("Bỏ lưu công việc này?")) {
      try {
        await savedJobService.unsave(jobId.toString());
        setSavedJobs(prev => prev.filter(sj => sj.jobId !== jobId.toString()));
      } catch (err) {
        console.error("Failed to unsave job:", err);
        alert("Lỗi: Không thể bỏ lưu công việc");
      }
    }
  };

  // Get stored user info on mount
  useEffect(() => {
    const user = getStoredUser();
    setStoredUser(user);
    
    // Fetch suggested jobs for sidebar
    const fetchSuggestions = async () => {
      try {
        const response = await jobService.getAll();
        setSuggestedJobs(response.data || []);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    // Fetch all skills
    const fetchAllSkills = async () => {
      try {
        const response = await api.get('/skill');
        setAllSkills(Array.isArray(response.data) ? response.data : response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };

    fetchSuggestions();
    fetchAllSkills();
  }, []);

  // Handle saving profile summary
  const handleSaveSummary = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      await profileService.createOrUpdate(profile);
      setIsEditingIntro(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Lỗi: Không thể lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await profileService.getMyProfile();
        const profileData = profileResponse.data || (profileResponse as any)?.data || null;
        console.log('[Profile] Fetched profile:', profileData);
        setProfile(profileData);
        
        // Fetch resumes
        try {
          const resumesResponse = await resumeService.getMyResumes();
          const resumesData = Array.isArray(resumesResponse.data) ? resumesResponse.data : [];
          setResumes(resumesData);
        } catch (err) {
          console.warn("Failed to load resumes:", err);
        }
        
        // Fetch applications
        try {
          const applicationsResponse = await applicationService.getMyApplications();
          console.log('[Profile] Applications response:', applicationsResponse);
          const applicationsData = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
          console.log('[Profile] Applications data:', applicationsData);
          setApplications(applicationsData);
        } catch (err) {
          console.error("[Profile] Failed to load applications:", err);
        }
        
        // Fetch saved jobs
        try {
          const savedJobsResponse = await savedJobService.getMySavedJobs();
          console.log('[Profile] Saved jobs response:', savedJobsResponse);
          const savedJobsData = Array.isArray(savedJobsResponse.data) ? savedJobsResponse.data : [];
          console.log('[Profile] Saved jobs data:', savedJobsData);
          setSavedJobs(savedJobsData);
        } catch (err) {
          console.error("[Profile] Failed to load saved jobs:", err);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handler to open edit profile modal
  const handleOpenEditProfile = () => {
    setEditProfileData({
      phone: storedUser?.phoneNumber || "",
      city: profile?.address || "",
      gender: profile?.gender || "",
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
      headline: profile?.headline || "",
      summary: profile?.summary || "",
    });
    setShowEditProfileModal(true);
  };

  // Handler to save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);

      // Update profile with all fields including phone number
      const updateData = {
        id: profile?.id,
        headline: editProfileData.headline,
        summary: editProfileData.summary,
        address: editProfileData.city,
        gender: editProfileData.gender,
        dateOfBirth: editProfileData.dateOfBirth,
        phoneNumber: editProfileData.phone,
      };

      await profileService.createOrUpdate(updateData);

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Thông tin cá nhân đã được cập nhật.",
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) container.setAttribute('style', 'z-index: 99999 !important');
        }
      });
      setShowEditProfileModal(false);

      // Reload profile
      const profileResponse = await profileService.getMyProfile();
      const updatedProfile = profileResponse.data || (profileResponse as any)?.data || null;
      setProfile(updatedProfile);
      
      // Update storedUser with new phone number if it was changed
      if (updatedProfile?.user?.phoneNumber) {
        const updatedUser = {
          ...storedUser,
          phoneNumber: updatedProfile.user.phoneNumber
        };
        setStoredUser(updatedUser);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: err.response?.data?.message || "Không thể cập nhật thông tin",
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) container.setAttribute('style', 'z-index: 99999 !important');
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler to add skill to profile
  const handleAddSkill = async (skillId: string) => {
    try {
      const response = await profileService.addSkill(skillId);
      setProfile(response.data || (response as any)?.data || null);
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Kỹ năng đã được thêm.",
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) container.setAttribute('style', 'z-index: 99999 !important');
        }
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Không thể thêm kỹ năng";
      if (errorMsg.includes("already added")) {
        Swal.fire({
          icon: "info",
          title: "Thông báo",
          text: "Kỹ năng này đã được thêm rồi",
          didOpen: () => {
            const container = document.querySelector('.swal2-container');
            if (container) container.setAttribute('style', 'z-index: 99999 !important');
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: errorMsg,
          didOpen: () => {
            const container = document.querySelector('.swal2-container');
            if (container) container.setAttribute('style', 'z-index: 99999 !important');
          }
        });
      }
    }
  };

  // Handler to remove skill from profile
  const handleRemoveSkill = async (skillId: string) => {
    try {
      const response = await profileService.removeSkill(skillId);
      setProfile(response.data || (response as any)?.data || null);
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Kỹ năng đã được xóa.",
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) container.setAttribute('style', 'z-index: 99999 !important');
        }
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: err.response?.data?.message || "Không thể xóa kỹ năng",
        didOpen: () => {
          const container = document.querySelector('.swal2-container');
          if (container) container.setAttribute('style', 'z-index: 99999 !important');
        }
      });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-500 text-[11px]">Đang chuẩn bị không gian làm việc của bạn...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-10 max-w-[1440px]">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Sidebar Navigation (280px) */}
            <div className="w-full xl:w-[280px] shrink-0 space-y-6">
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden p-6 sticky top-8">
                <div className="mb-10 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar 
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedUser?.fullName || "User")}&background=F1F5F9&color=6366F1&size=128&bold=true`} 
                      className="h-20 w-20 rounded-2xl border-2 border-slate-50 object-cover shadow-sm bg-slate-50 mx-auto" 
                    />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 border-2 border-white"></div>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 leading-tight truncate">{storedUser?.fullName || "Người dùng"}</h2>
                  <p className="text-[10px] text-slate-400 mt-1">Cấp độ: Kim Cương</p>
                  {profile?.summary && (
                    <p className="text-[11px] text-slate-600 mt-3 line-clamp-2">{profile.summary}</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-between border border-slate-100/50">
                  <div className="flex-1 pr-2">
                    <p className="text-[10px] font-semibold text-slate-900 leading-tight">Cho phép tìm bạn</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">NTD có thể xem hồ sơ</p>
                  </div>
                  <div 
                    className={`w-11 h-6 rounded-full cursor-pointer transition-all relative ${showSeekerSettings ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    onClick={() => setShowSeekerSettings(!showSeekerSettings)}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showSeekerSettings ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {[
                    { id: "overview", label: "Tổng quan hồ sơ", icon: User },
                    { id: "resume", label: "Trang trí CV", icon: FileText },
                    { id: "applications", label: "Quản lý việc làm", icon: Briefcase },
                    { id: "saved", label: "Việc làm đã lưu", icon: Heart },
                    { id: "settings", label: "Cài đặt tài khoản", icon: Settings }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-[11px] transition-all rounded-2xl group relative ${
                        activeTab === tab.id 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <tab.icon className={`h-4.5 w-4.5 ${activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                      )}
                    </button>
                  ))}
                </nav>

                <div className="mt-10 pt-8 border-t border-slate-50">
                   <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                      <p className="text-[10px] font-semibold text-indigo-400 mb-2">Trợ giúp</p>
                      <p className="text-xs leading-relaxed opacity-90 mb-4">Cần cải thiện hồ sơ của bạn? Chat với AI ngay.</p>
                      <Button className="w-full bg-white text-slate-900 hover:bg-indigo-50 text-[9px] h-9 rounded-xl">Kích hoạt AI</Button>
                   </div>
                </div>
              </Card>
            </div>

            {/* MIDDLE COLUMN: Main Content (Fluid) */}
            <div className="flex-1 min-w-0 space-y-8">
              {activeTab === "overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8">
                  {/* Premium Header Card */}
                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-[2rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="relative shrink-0">
                          <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition items-center"></div>
                          <Avatar 
                            src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedUser?.fullName || "User")}&background=F1F5F9&color=334155&size=200`} 
                            className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-xl bg-slate-50 relative z-10" 
                          />
                          <button className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-xl z-20">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex-1 space-y-6 pt-2 w-full">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h1 className="text-3xl font-bold text-slate-900">{storedUser?.fullName || "Người dùng"}</h1>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[10px] rounded-lg">ONLINE</Badge>
                                <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3" /> {profile?.address || "Chưa cập nhật địa chỉ"}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" className="text-slate-900 border-slate-200 hover:bg-slate-50 rounded-2xl h-12 px-6 text-[10px] shrink-0 shadow-sm" onClick={handleOpenEditProfile}>
                              <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12 pt-2 border-t border-slate-50 mt-6">
                            <div className="flex items-center gap-4 group">
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0 border border-slate-100/50">
                                <Mail className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-400">Email liên hệ</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm text-slate-900 truncate">{storedUser?.email}</span>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0 border border-slate-100/50">
                                <Phone className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-400">Điện thoại</p>
                                <span className="text-sm text-indigo-600 cursor-pointer hover:underline" onClick={handleOpenEditProfile}>{storedUser?.phoneNumber || "Thêm số điện thoại"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0 border border-slate-100/50">
                                <User className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-400">Giới tính</p>
                                <span className="text-sm text-indigo-600 cursor-pointer hover:underline" onClick={handleOpenEditProfile}>{profile?.gender || "Chưa xác định"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0 border border-slate-100/50">
                                <Calendar className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[9px] text-slate-400">Ngày sinh</p>
                                <span className="text-sm text-indigo-600 cursor-pointer hover:underline" onClick={handleOpenEditProfile}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : "Thêm ngày sinh"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* 2-Column Section Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Job Criteria Card */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <h3 className="text-[13px] font-semibold text-slate-900">Tiêu chí tìm việc</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all h-9 w-9">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-6 flex-1">
                        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-[9px] text-slate-400 mb-1">Vị trí mong muốn</p>
                          <p className="text-sm text-slate-900">{profile?.jobTitle || "Chưa thiết lập"}</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-[9px] text-slate-400 mb-1">Mức lương tối thiểu</p>
                          <p className="text-sm text-orange-500">{profile?.expectedSalary ? `${profile.expectedSalary} VNĐ` : "Thỏa thuận"}</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                          <p className="text-[9px] text-slate-400 mb-1">Địa điểm</p>
                          <p className="text-sm text-slate-900">{profile?.city || "Toàn quốc"}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Quick Stats/Summary Card */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Star className="h-4 w-4" />
                          </div>
                          <h3 className="text-[13px] font-semibold text-slate-900">Kỹ năng nổi bật</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all h-9 w-9" onClick={() => setShowSkillsModal(true)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 flex-1">
                        {profile?.jobSeekerSkills && profile.jobSeekerSkills.length > 0 ? (
                          profile.jobSeekerSkills.map((skill, i) => (
                            <div key={i} className="relative group">
                              <Badge className="bg-slate-900 hover:bg-indigo-600 text-white border-none px-4 py-2 text-[9px] rounded-xl transition-all cursor-default">
                                {skill.skillName || (skill as any).skill?.skillName || (skill as any).name}
                              </Badge>
                              <button
                                onClick={() => handleRemoveSkill((skill as any).skillId)}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center py-10 opacity-40">
                             <p className="text-[10px] text-slate-400">Chưa có kỹ năng</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-slate-50">
                         <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <div>
                               <p className="text-[10px] font-semibold text-indigo-600">Độ hoàn thiện</p>
                               <p className="text-sm font-semibold text-indigo-900 mt-0.5">Hồ sơ: 85%</p>
                            </div>
                            <div className="h-10 w-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-white">
                               <span className="text-[9px] font-semibold text-indigo-600">85%</span>
                            </div>
                         </div>
                      </div>
                    </Card>
                  </div>

                  {/* Experience Section */}
                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-slate-900">Kinh nghiệm làm việc</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">Hành trình sự nghiệp của bạn</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-indigo-600 border-indigo-100 hover:bg-indigo-50 rounded-xl h-12 px-8 text-[10px] transition-all shadow-sm" onClick={() => setIsAddingExperience(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Thêm mới
                      </Button>
                    </div>

                    <div className="space-y-8 relative before:absolute before:left-[1.35rem] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      {profile?.experiences && profile.experiences.length > 0 ? (
                        profile.experiences.map((exp, i) => (
                          <div key={i} className="relative pl-12 group">
                            <div className="absolute left-0 top-1.5 w-[2.75rem] flex justify-center">
                               <div className="w-11 h-11 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center z-10 group-hover:border-indigo-500 transition-colors shadow-sm">
                                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
                               </div>
                            </div>
                            <div className="bg-slate-50/50 border border-slate-100/50 p-6 rounded-[1.5rem] group-hover:bg-white group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all">
                               <div className="flex items-center justify-between mb-4">
                                  <p className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN') : 'Bắt đầu'} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                  </p>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                                       onClick={() => handleOpenEditExperience(i)}
                                     >
                                       <Edit2 className="h-3.5 w-3.5" />
                                     </Button>
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                                       onClick={() => handleDeleteExperience(i)}
                                     >
                                       <Trash2 className="h-3.5 w-3.5" />
                                     </Button>
                                  </div>
                               </div>
                               <h4 className="text-lg font-semibold text-slate-900 mb-1">{exp.jobTitle}</h4>
                               <p className="text-sm font-bold text-slate-500 mb-2">{exp.companyName}</p>
                               {exp.location && <p className="text-xs text-slate-400 mb-3">📍 {exp.location}</p>}
                               <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">{exp.description || "Không có mô tả chi tiết cho vị trí này."}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="pl-12 py-10 opacity-30">
                           <p className="text-[11px] text-slate-400 italic">Chưa có thông tin kinh nghiệm.</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Education Section */}
                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-slate-900">Học vấn & Bằng cấp</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">Nền tảng tri thức của bạn</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-purple-600 border-purple-100 hover:bg-purple-50 rounded-xl h-12 px-8 text-[10px] transition-all shadow-sm" onClick={() => setIsAddingEducation(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Thêm mới
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {profile?.educations && profile.educations.length > 0 ? (
                         profile.educations.map((edu, i) => (
                           <div key={i} className="group p-6 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all relative">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 pr-8">
                                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{edu.degree}</h4>
                                  <p className="text-[11px] font-bold text-slate-500 mb-2">{edu.schoolName}</p>
                                  {edu.fieldOfStudy && <p className="text-[10px] text-slate-400 mb-2">Chuyên ngành: {edu.fieldOfStudy}</p>}
                                  <div className="text-[9px] text-slate-400">
                                    {edu.startDate ? new Date(edu.startDate).toLocaleDateString('vi-VN') : 'Bắt đầu'} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                                    onClick={() => handleOpenEditEducation(i)}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                                    onClick={() => handleDeleteEducation(i)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                               </div>
                              </div>
                              {edu.description && <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-100 mt-3">{edu.description}</p>}
                           </div>
                         ))
                       ) : (
                         <div className="col-span-2 text-center py-10 opacity-30">
                            <p className="text-[11px] text-slate-400 italic">Chưa có thông tin học vấn.</p>
                         </div>
                       )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Advanced Resume/CV Tab Content */}
              {activeTab === "resume" && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8">
                  <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900">Trang trí CV cá nhân</h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-2">Dùng Hồ sơ & CV chuyên nghiệp để nổi bật hơn</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100/50">
                       <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                          <p className="text-[9px] font-semibold text-indigo-600 opacity-60">SỐ LƯỢNG</p>
                          <p className="text-xl font-bold text-indigo-600 leading-none mt-1">{resumes.length}<span className="text-[10px] text-indigo-300 ml-1">/5</span></p>
                       </div>
                    </div>
                  </header>

                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-[2rem] overflow-hidden p-10">
                    <div className="relative group mb-12">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                      <div className="relative border-4 border-dashed border-slate-100 bg-slate-50/50 rounded-[2.5rem] p-16 text-center hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                        <div className="mx-auto w-20 h-20 bg-white text-indigo-600 rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Upload className="h-10 w-10" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Tải lên hồ sơ mới</h4>
                        <p className="text-slate-400 mb-10 font-semibold text-[10px]">Kích thước tối đa 5MB • Định dạng PDF, DOCX</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleUploadResume}
                          className="hidden"
                        />
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-2xl px-12 py-7 h-auto bg-slate-900 hover:bg-indigo-600 text-white text-[12px] shadow-2xl shadow-slate-200 transition-all active:scale-95"
                        >CHỌN TỪ MÁY TÍNH</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {resumes.length > 0 ? (
                        resumes.map((resume, idx) => (
                          <div key={resume.resumeId || `idx-${idx}`} className={`group relative p-8 rounded-[2rem] border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 ${resume.isDefault ? 'border-indigo-200 bg-indigo-50/30 ring-4 ring-indigo-500/5' : 'border-slate-50 bg-white hover:border-indigo-100'}`}>
                            {resume.isDefault && (
                               <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] shadow-lg shadow-indigo-200">
                                  MẶC ĐỊNH
                               </div>
                            )}
                            
                            <div className="flex items-start gap-6 mb-10">
                              <div className={`h-16 w-16 rounded-2xl shadow-xl flex items-center justify-center shrink-0 transition-transform group-hover:-rotate-3 ${resume.isDefault ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                                <FileText className="h-8 w-8" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-slate-900 text-lg leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">{resume.title || resume.fileName || 'Hồ sơ chưa đặt tên'}</h4>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {new Date(resume.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                   </div>
                                   <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                   <span className="text-[10px] font-semibold text-emerald-500">FILE PDF</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-100/50">
                              <Button 
                                variant="outline" 
                                className="flex-1 rounded-xl font-semibold text-[10px] h-12 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 bg-white transition-all shadow-sm"
                                onClick={() => handleViewResume(resume)}
                              >
                                XEM CHI TIẾT
                              </Button>
                              <div className="flex gap-2">
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 rounded-xl text-slate-400 hover:text-indigo-600 bg-slate-50 border-none transition-all hover:rotate-6"
                                    onClick={() => handleEditResume(resume)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                 </Button>
                                 <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-12 w-12 rounded-xl text-slate-400 hover:text-red-500 bg-red-50 border-none transition-all hover:-rotate-6"
                                    onClick={() => (resume.resumeId || (resume as any).id) && handleDeleteResume(resume.resumeId || (resume as any).id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 opacity-60">
                          <FileText className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                          <p className="text-slate-400 font-semibold text-[11px]">Không gian lưu trữ hiện đang trống</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Advanced Applications Tab Content */}
              {activeTab === "applications" && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8">
                  <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-semibold text-slate-900er">Hồ sơ ứng tuyển</h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-2">Theo dõi tình trạng phản hồi từ các doanh nghiệp</p>
                    </div>
                    <div className="bg-white px-8 py-5 rounded-[1.5rem] border border-slate-100 shadow-sm text-center">
                       <p className="text-[9px] font-semibold text-indigo-600 opacity-60 mb-1">TỔNG TUYỂN</p>
                       <p className="text-3xl font-semibold text-slate-900 leading-none">{applications.length}</p>
                    </div>
                  </header>

                  <div className="space-y-4">
                    {applications.length > 0 ? (
                      applications.map((app, idx) => {
                        const status = app.status?.toLowerCase() || 'pending';
                        const isPending = status.includes('pending') || status.includes('submitted');
                        const isApproved = status.includes('approved') || status.includes('interview');
                        const isRejected = status.includes('rejected') || status.includes('declined');
                        
                        let badgeStyle = "bg-slate-100 text-slate-500";
                        let ringStyle = " ring-slate-100";
                        
                        if (isApproved) {
                          badgeStyle = "bg-emerald-50 text-emerald-600";
                          ringStyle = " ring-emerald-100";
                        } else if (isRejected) {
                          badgeStyle = "bg-red-50 text-red-600";
                          ringStyle = " ring-red-100";
                        } else if (isPending) {
                          badgeStyle = "bg-indigo-50 text-indigo-600";
                          ringStyle = " ring-indigo-100";
                        }

                        return (
                          <div key={app.id || app.applicationId || idx} className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-1">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                              <div className="flex items-center gap-8">
                                <div className={`h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center ring-8 ${ringStyle} shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-inner`}>
                                  <Avatar 
                                    src={(app.job as any)?.company?.logo || (app.job as any)?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((app.job as any)?.company?.companyName || "C")}&background=F1F5F9&color=6366F1`} 
                                    className="h-20 w-20 rounded-none object-contain p-2" 
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-slate-900 text-xl leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                    {app.job?.jobTitle || (app.job as any)?.title || 'Vị trí đã ứng tuyển'}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                                    <p className="font-semibold text-[11px] text-slate-400">{(app.job as any)?.company?.companyName || (app.job as any)?.companyName || 'Doanh nghiệp'}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">
                                      <Clock className="h-3.5 w-3.5" />
                                      {new Date(app.appliedDate || Date.now()).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] shadow-sm ${badgeStyle}`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                      {app.status?.toUpperCase() || 'SENT'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Button 
                                  variant="ghost"
                                  className="rounded-xl text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-slate-50 h-14 px-6"
                                  onClick={() => navigate(`/jobs/${app.job?.jobId || app.jobId}`)}
                                >
                                  XEM TIN
                                </Button>
                                <Button 
                                  className="rounded-[1.25rem] bg-slate-900 text-white hover:bg-indigo-600 text-[10px] h-14 px-10 shadow-xl shadow-slate-200"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setShowApplicationModal(true);
                                  }}
                                >
                                  QUẢN LÝ
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-20 bg-white rounded-[2rem] border-4 border-dashed border-slate-50">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                           <Briefcase className="h-10 w-10" />
                        </div>
                        <p className="text-slate-400 font-semibold text-sm">Chưa có hoạt động ứng tuyển nào</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Advanced Saved Jobs Tab Content */}
              {activeTab === "saved" && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8">
                  <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-semibold text-slate-900er">Việc làm ưu thích</h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-2">Dành riêng cho mục tiêu tiềm năng của bạn</p>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {savedJobs.length > 0 ? (
                      savedJobs.map((savedJob) => (
                        <div key={savedJob.id || savedJob.savedJobId} className="group relative flex flex-col p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                          <button 
                            className="absolute top-8 right-8 p-3 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all cursor-pointer z-10"
                            onClick={() => handleRemoveSavedJob(savedJob.jobId || (savedJob as any).id)}
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                          
                          <div className="flex items-center gap-6 mb-10">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100/50 group-hover:scale-105 transition-transform shadow-inner">
                               <Avatar 
                                  src={(savedJob.job as any)?.company?.logo || (savedJob.job as any)?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((savedJob.job as any)?.company?.name || "C")}&background=F8FAFC&color=6366F1`} 
                                  className="h-full w-full rounded-none object-contain" 
                               />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-slate-900 text-lg leading-tight truncate group-hover:text-indigo-600 transition-colors mb-1">
                                {savedJob.job?.title || (savedJob.job as any)?.jobTitle || "Công việc"}
                              </h4>
                              <p className="text-slate-400 font-semibold text-[9px] truncate">{(savedJob.job as any)?.company?.name || (savedJob.job as any)?.companyName}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl">
                              <MapPin className="h-4 w-4 text-slate-300" />
                              <span className="text-[10px] font-semibold text-slate-500 truncate">{(savedJob.job as any)?.location || "Toàn quốc"}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl">
                              <DollarSign className="h-4 w-4 text-orange-400" />
                              <span className="text-[10px] font-semibold text-orange-600">{(savedJob.job as any)?.salaryMax ? `${(savedJob.job as any).salaryMax}M` : "Thỏa thuận"}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-[11px] py-6 h-auto shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 mt-auto"
                            onClick={() => navigate(`/jobs/${(savedJob.job as any)?.jobId || savedJob.jobId || (savedJob.job as any)?.id}`)}
                          >
                            ỨNG TUYỂN NGAY
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                           <Heart className="h-10 w-10" />
                        </div>
                        <p className="text-slate-400 font-semibold text-[11px] mb-8">Bạn chưa lưu bất kỳ công việc nào</p>
                        <Button 
                           className="rounded-2xl px-12 py-6 h-auto bg-slate-900 text-[10px] text-white hover:bg-indigo-600 shadow-xl shadow-slate-100" 
                           onClick={() => navigate('/jobs')}
                        >
                           KHÁM PHÁ NGAY
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Settings Tab Content */}
              {activeTab === "settings" && (
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8">
                  <header>
                    <h3 className="text-3xl font-bold text-slate-900">Trung tâm bảo mật</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-2">Quản lý quyền truy cập và dữ liệu cá nhân</p>
                  </header>

                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-[2rem] overflow-hidden p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                       <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-semibold text-slate-400 ml-2">Email ĐĂNG NHẬP</label>
                            <div className="relative group">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors">
                                 <Mail className="h-full w-full" />
                              </div>
                              <Input 
                                 value={storedUser?.email} 
                                 disabled 
                                 className="rounded-[1.25rem] border-slate-100 bg-slate-50 font-semibold text-slate-500 h-16 pl-14 pr-6 focus:ring-0 cursor-not-allowed" 
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-semibold text-slate-400 ml-2">Mật khẩu HIỆN TẠI</label>
                            <Button variant="outline" className="w-full justify-between rounded-[1.25rem] border-slate-100 h-16 px-6 text-slate-900 text-[11px] bg-white hover:bg-slate-50 border-2 transition-all group">
                              <span>Thay đổi mật khẩu</span>
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </Button>
                          </div>
                          <div className="pt-6">
                             <div className="p-6 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100/50">
                                <div className="flex items-center gap-3 mb-2">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                      <CheckCircle2 className="h-4 w-4" />
                                   </div>
                                   <p className="text-[10px] font-semibold text-indigo-900">Xác thực 2 yếu tố</p>
                                </div>
                                <p className="text-[11px] font-medium text-indigo-600/80 leading-relaxed">Nâng cao bảo mật cho tài khoản của bạn bằng cách thêm mã xác nhận OTP.</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 text-red-500">
                             <Trash2 className="h-10 w-10" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2">Hủy tư cách thành viên</h4>
                          <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10 max-w-[240px]">Lưu ý: Thao tác này sẽ xóa vĩnh viễn mọi dữ liệu, hồ sơ và đơn ứng tuyển của bạn.</p>
                          <Button variant="ghost" className="text-red-600 hover:bg-red-100 hover:text-red-700 text-[11px] px-10 h-14 rounded-2xl transition-all">XÓA TÀI KHOẢN</Button>
                       </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Job Suggestions (320px) */}
            <div className="w-full xl:w-[320px] shrink-0 space-y-8 lg:sticky lg:top-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-semibold text-slate-900er mb-0">Việc làm gợi ý</h3>
                  <Badge className="bg-slate-900 text-white border-none rounded-lg text-[9px] px-2">{suggestedJobs.length}</Badge>
                </div>

                <div className="space-y-5">
                  {suggestedJobs.length > 0 ? (
                    suggestedJobs.map((job) => (
                      <Card key={job.jobId} className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.02)] bg-white rounded-[1.5rem] p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group cursor-pointer relative overflow-hidden border border-transparent hover:border-indigo-100">
                        <button className="absolute top-6 right-6 text-slate-200 hover:text-indigo-500 hover:scale-125 transition-all z-10">
                          <Heart className="h-5 w-5" />
                        </button>
                        
                        <div className="flex flex-col gap-5">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl border border-slate-50 flex-shrink-0 flex items-center justify-center p-2 bg-slate-50 group-hover:bg-white transition-colors overflow-hidden shadow-inner">
                              <Avatar 
                                 src={(job as any).company?.logo || (job as any).logo || `https://ui-avatars.com/api/?name=${encodeURIComponent((job as any).company?.companyName || "C")}&background=random`} 
                                 className="h-full w-full rounded-none object-contain" 
                              />
                            </div>
                            <div className="min-w-0 pr-6">
                              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2 mb-1">
                                {job.jobTitle || job.title}
                              </h4>
                              <p className="text-[9px] font-semibold text-slate-400 truncate">{(job as any).company?.companyName || (job as any).companyName}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-[10px] font-semibold text-orange-600 bg-orange-50/50 w-fit px-3 py-1.5 rounded-lg">
                              <DollarSign className="h-3.5 w-3.5" />
                              {job.salaryMax ? `${job.salaryMin}-${job.salaryMax} TRIỆU` : "THỎA THUẬN"}
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 px-3">
                              <MapPin className="h-3.5 w-3.5 text-slate-300" />
                              <span className="truncate">{job.location || "TOÀN QUỐC"}</span>
                            </div>

                            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 px-3">
                              <Briefcase className="h-3.5 w-3.5 text-slate-300" />
                              <span className="truncate">TOÀN THỜI GIAN</span>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              HÀN 25 NGÀY
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="p-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                      <div className="animate-pulse flex flex-col items-center">
                         <div className="h-10 w-10 bg-slate-100 rounded-full mb-4"></div>
                         <p className="text-[9px] font-semibold text-slate-300">Đang đồng bộ...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                   variant="outline" 
                   className="w-full rounded-2xl border-2 border-dashed border-slate-200 text-indigo-600 font-semibold text-[11px] h-16 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                   onClick={() => navigate('/jobs')}
                >
                  XEM TẤT CẢ GỢI Ý <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Newsletter/Action Card */}
              <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                 <h4 className="text-xl font-semibolder mb-2 relative z-10">Bật thông báo</h4>
                 <p className="text-[11px] font-medium opacity-80 leading-relaxed mb-6 relative z-10">Nhận thông tin công việc phù hợp nhất ngay khi có tin tuyển dụng mới.</p>
                 <Button className="w-full bg-white text-indigo-600 hover:bg-slate-50 font-semibold text-[10px] h-12 rounded-xl relative z-10">KÍCH HOẠT NGAY</Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <Card className="w-full max-w-2xl shadow-[0_32px_128px_rgb(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 px-10 py-12 text-white flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-semibold">Chi tiết ứng tuyển</h3>
                  <p className="text-slate-400 text-[10px] font-semibold mt-2 opacity-70">MÃ HỒ SƠ: #{selectedApplication.applicationId?.substring(0, 8).toUpperCase() || 'N/A'}</p>
                </div>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="h-14 w-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative z-10 hover:rotate-90"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <CardContent className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                  <div className="h-24 w-24 bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                    <Avatar 
                       src={(selectedApplication.job as any)?.company?.logo || (selectedApplication.job as any)?.logo || `https://ui-avatars.com/api/?name=C&background=F1F5F9&color=6366F1`} 
                       className="h-full w-full rounded-none object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[10px] font-semibold text-indigo-600 mb-2">DOANH NGHIỆP TUYỂN DỤNG</h3>
                    <p className="text-2xl font-semibold text-slate-900er truncate mb-1">{selectedApplication.job?.jobTitle || (selectedApplication.job as any)?.title || 'Vị trí này'}</p>
                    <p className="text-slate-400 font-semibold text-xs">{(selectedApplication.job as any)?.company?.companyName || (selectedApplication.job as any)?.companyName || 'Doanh nghiệp ẩn danh'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-semibold text-slate-400 ml-2">TRẠNG THÁI HIỆN TẠI</h3>
                    <div className="flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl shadow-sm">
                      {selectedApplication.status?.toLowerCase().includes('pending') || selectedApplication.status?.toLowerCase().includes('submitted') ? (
                        <>
                          <div className="h-3 w-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
                          <span className="text-xs font-semibold text-indigo-600">Đang chờ xét duyệt</span>
                        </>
                      ) : selectedApplication.status?.toLowerCase().includes('approved') || selectedApplication.status?.toLowerCase().includes('interview') ? (
                        <>
                          <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                          <span className="text-xs font-semibold text-emerald-600">Đã nhận lịch hẹn</span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
                          <span className="text-xs font-semibold text-slate-600">{selectedApplication.status?.toUpperCase() || 'KHÔNG XÁC ĐỊNH'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-semibold text-slate-400 ml-2">THỜI GIAN GỬI</h3>
                    <div className="flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl shadow-sm">
                      <Clock className="h-5 w-5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-900">
                        {selectedApplication.appliedDate 
                          ? new Date(selectedApplication.appliedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {selectedApplication.resume && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-slate-400 ml-2">HỒ SƠ ĐÃ SỬ DỤNG</h3>
                    <div className="flex items-center justify-between p-6 bg-indigo-50/30 rounded-3xl border-2 border-indigo-100/50 group">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600">
                           <FileText className="h-7 w-7" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-slate-900 truncate block max-w-[280px]">{selectedApplication.resume.title || 'Hồ sơ ứng tuyển'}</span>
                          <span className="text-[10px] font-bold text-indigo-400">ĐỊNH DẠNG: PDF / DOCX</span>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-600 font-semibold text-[10px] hover:bg-indigo-600 hover:text-white transition-all px-8 h-12 shadow-sm">XEM FILE</Button>
                    </div>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-slate-400 ml-2">THƯ GIỚI THIỆU (COVER LETTER)</h3>
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] text-slate-600 text-[14px] font-medium leading-relaxed italic border border-slate-100 relative shadow-inner">
                      <div className="absolute top-6 left-6 opacity-10"><Briefcase className="h-10 w-10" /></div>
                      "{selectedApplication.coverLetter}"
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                  <Button
                    onClick={() => navigate(`/jobs/${selectedApplication.job?.jobId || selectedApplication.jobId}`)}
                    className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white h-16 rounded-2xl shadow-2xl shadow-slate-200 transition-all active:scale-95"
                  >
                    XEM BẢN TIN CHI TIẾT
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 font-semibold text-slate-400 h-16 rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    ĐÓNG CỬA SỔ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Experience Modal */}
      {isAddingExperience && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl shadow-[0_32px_128px_rgb(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 px-10 py-8 text-white flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{editingExperienceId !== null ? "Sửa kinh nghiệm" : "Thêm kinh nghiệm mới"}</h3>
              <button
                onClick={() => {
                  setIsAddingExperience(false);
                  setEditingExperienceId(null);
                  setExpFormData({
                    jobTitle: "",
                    companyName: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  });
                }}
                className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Chức danh công việc *</label>
                <Input
                  placeholder="Ví dụ: Senior Developer"
                  value={expFormData.jobTitle}
                  onChange={(e) => setExpFormData({ ...expFormData, jobTitle: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tên công ty *</label>
                <Input
                  placeholder="Ví dụ: Google Vietnam"
                  value={expFormData.companyName}
                  onChange={(e) => setExpFormData({ ...expFormData, companyName: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={expFormData.startDate}
                    onChange={(e) => setExpFormData({ ...expFormData, startDate: e.target.value })}
                    className="w-full rounded-xl h-12 px-4 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={expFormData.endDate}
                    onChange={(e) => setExpFormData({ ...expFormData, endDate: e.target.value })}
                    className="w-full rounded-xl h-12 px-4 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Mô tả công việc</label>
                <textarea
                  placeholder="Mô tả chi tiết về công việc của bạn..."
                  value={expFormData.description}
                  onChange={(e) => setExpFormData({ ...expFormData, description: e.target.value })}
                  className="w-full rounded-xl p-4 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-32"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveExperience}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-semibold"
                >
                  {editingExperienceId !== null ? "CẬP NHẬT" : "THÊM KINH NGHIỆM"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingExperience(false);
                    setEditingExperienceId(null);
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  HỦY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Education Modal */}
      {isAddingEducation && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl shadow-[0_32px_128px_rgb(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-300">
            <div className="bg-purple-600 px-10 py-8 text-white flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{editingEducationId !== null ? "Sửa học vấn" : "Thêm học vấn mới"}</h3>
              <button
                onClick={() => {
                  setIsAddingEducation(false);
                  setEditingEducationId(null);
                  setEduFormData({
                    degree: "",
                    schoolName: "",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  });
                }}
                className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Bằng cấp *</label>
                <Input
                  placeholder="Ví dụ: Cử nhân Khoa học Máy tính"
                  value={eduFormData.degree}
                  onChange={(e) => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tên trường học *</label>
                <Input
                  placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                  value={eduFormData.schoolName}
                  onChange={(e) => setEduFormData({ ...eduFormData, schoolName: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Ngành học</label>
                <Input
                  placeholder="Ví dụ: Khoa học Máy tính"
                  value={eduFormData.fieldOfStudy}
                  onChange={(e) => setEduFormData({ ...eduFormData, fieldOfStudy: e.target.value })}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={eduFormData.startDate}
                    onChange={(e) => setEduFormData({ ...eduFormData, startDate: e.target.value })}
                    className="w-full rounded-xl h-12 px-4 border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={eduFormData.endDate}
                    onChange={(e) => setEduFormData({ ...eduFormData, endDate: e.target.value })}
                    className="w-full rounded-xl h-12 px-4 border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả thêm về quá trình học tập của bạn..."
                  value={eduFormData.description}
                  onChange={(e) => setEduFormData({ ...eduFormData, description: e.target.value })}
                  className="w-full rounded-xl p-4 border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none h-32"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveEducation}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-semibold"
                >
                  {editingEducationId !== null ? "CẬP NHẬT" : "THÊM HỌC VẤN"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingEducation(false);
                    setEditingEducationId(null);
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  HỦY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resume Edit Title Modal */}
      {showEditResumeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Sửa tên CV</h2>
              <button
                onClick={() => {
                  setShowEditResumeModal(false);
                  setEditingResumeId(null);
                  setEditingResumeTitle("");
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tên CV *</label>
                <Input
                  placeholder="Ví dụ: CV - Lập trình viên Python"
                  value={editingResumeTitle}
                  onChange={(e) => setEditingResumeTitle(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveResumeTitle}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold"
                >
                  LƯU CV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditResumeModal(false);
                    setEditingResumeId(null);
                    setEditingResumeTitle("");
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  HỦY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showViewResumeModal && viewingResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <Card className="w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Chi tiết CV</h2>
              <button
                onClick={() => {
                  setShowViewResumeModal(false);
                  setViewingResume(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Tên CV</label>
                  <p className="text-slate-900 font-medium">{viewingResume.title || viewingResume.fileName || 'Chưa đặt tên'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Tên tệp</label>
                  <p className="text-slate-900 font-medium">{viewingResume.fileName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Loại tệp</label>
                  <p className="text-slate-900 font-medium">{viewingResume.fileType || 'PDF'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày tải lên</label>
                  <p className="text-slate-900 font-medium">{new Date(viewingResume.createdAt || viewingResume.uploadDate || Date.now()).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">Trạng thái</label>
                {viewingResume.isDefault ? (
                  <Badge className="bg-indigo-600 text-white">MẶC ĐỊNH</Badge>
                ) : (
                  <Badge className="bg-slate-200 text-slate-700">PHỤ</Badge>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    if (viewingResume.fileUrl) {
                      window.open(viewingResume.fileUrl, "_blank");
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-semibold"
                >
                  TẢI XUỐNG / XEM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewResumeModal(false);
                    setViewingResume(null);
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  ĐÓNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Chỉnh sửa thông tin cá nhân</h2>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tiêu đề / Vị trí</label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Lập trình viên Full Stack"
                  value={editProfileData.headline}
                  onChange={(e) => setEditProfileData({...editProfileData, headline: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Giới thiệu bản thân</label>
                <textarea
                  placeholder="Kể về bản thân, kinh nghiệm, kỹ năng của bạn..."
                  value={editProfileData.summary}
                  onChange={(e) => setEditProfileData({...editProfileData, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Số điện thoại</label>
                <Input
                  type="tel"
                  placeholder="0xxxx xxxxxx"
                  value={editProfileData.phone}
                  onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Địa chỉ / Thành phố</label>
                <Input
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  value={editProfileData.city}
                  onChange={(e) => setEditProfileData({...editProfileData, city: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Giới tính</label>
                <select
                  value={editProfileData.gender}
                  onChange={(e) => setEditProfileData({...editProfileData, gender: e.target.value})}
                  className="w-full h-12 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Ngày sinh</label>
                <Input
                  type="date"
                  value={editProfileData.dateOfBirth}
                  onChange={(e) => setEditProfileData({...editProfileData, dateOfBirth: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-semibold"
                >
                  {isSaving ? "Đang lưu..." : "LƯU"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  HỦY
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <Card className="w-full max-w-md mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Thêm kỹ năng</h2>
              <button
                onClick={() => {
                  setShowSkillsModal(false);
                  setSkillSearch("");
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Tìm kiếm kỹ năng..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="rounded-xl h-12 mb-4"
              />

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {allSkills
                  ?.filter(skill => 
                    skill.skillName?.toLowerCase().includes(skillSearch.toLowerCase())
                  )
                  .map((skill) => {
                    const isAdded = profile?.jobSeekerSkills?.some((js: any) => js.skillId === skill.skillId);
                    return (
                      <div key={skill.skillId} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50">
                        <span className="text-sm text-slate-700">{skill.skillName}</span>
                        <Button
                          size="sm"
                          onClick={() => !isAdded && handleAddSkill(skill.skillId)}
                          disabled={isAdded || loadingSkills}
                          className={`h-8 ${isAdded ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                          {isAdded ? '✓ Đã thêm' : '+ Thêm'}
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowSkillsModal(false);
                  setSkillSearch("");
                }}
                className="w-full h-12 rounded-xl"
              >
                ĐÓNG
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    );
}
