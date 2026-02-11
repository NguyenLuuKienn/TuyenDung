namespace SchneeJob.DTOs
{
    public class AdminDashboardStats
    {
        public long TotalUsers { get; set; }
        public long TotalCompanies { get; set; }
        public long TotalOpenJobs { get; set; }
        public long TotalApplications { get; set; }
        public List<TopIndustryStat> TopIndustries { get; set; }
        public List<TopSkillStat> TopSkills { get; set; }
    }
}
