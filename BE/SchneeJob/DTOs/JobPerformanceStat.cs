namespace SchneeJob.DTOs
{
    public class JobPerformanceStat
    {
        public Guid JobId { get; set; }
        public string JobTitle { get; set; }
        public int ApplicationCount { get; set; }
    }
}
