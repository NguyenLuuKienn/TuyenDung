namespace SchneeJob.DTOs
{
    public class CreatePostDto
    {
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public Guid? JobId { get; set; }
    }

    public class UpdatePostDto
    {
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public Guid? JobId { get; set; }
    }

    public class PostResponseDto
    {
        public Guid PostId { get; set; }
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyLogo { get; set; }
        public Guid? JobId { get; set; }
        public JobSummaryDto? Job { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int Likes { get; set; }
        public int Comments { get; set; }
        public int Shares { get; set; }
        public int Views { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class JobSummaryDto
    {
        public Guid JobId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Location { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
    }
}
