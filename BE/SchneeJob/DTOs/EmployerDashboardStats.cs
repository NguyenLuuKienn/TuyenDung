namespace SchneeJob.DTOs
{
    public class EmployerDashboardStats
    {
        public int TotalJobsPosted { get; set; }
        public int TotalApplicationsReceived { get; set; }
        public List<Application> RecentApplications { get; set; }
        public List<JobPerformanceStat> JobPerformanceStats { get; set; }
    }
}
