using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Net.Mime.MediaTypeNames;

public class Job
{
    [Key]
    public Guid JobId { get; set; }

    [Required]
    [StringLength(255)]
    public string JobTitle { get; set; }

    [Required]
    public string JobDescription { get; set; }
    public string JobRequirements { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SalaryMin { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? SalaryMax { get; set; }

    [StringLength(50)]
    public string SalaryType { get; set; } = "Negotiable";

    [Required]
    [StringLength(255)]
    public string Location { get; set; }

    [StringLength(50)]
    public string JobLevel { get; set; }

    [StringLength(50)]
    public string EmploymentType { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = "Open";

    public DateTime? Deadline { get; set; }
    public bool IsPriority { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public Guid CompanyId { get; set; }
    [ForeignKey("CompanyId")]
    public virtual Company? Company { get; set; }

    public Guid? PostedByUserId { get; set; }
    [ForeignKey("PostedByUserId")]
    public virtual User? PostedByUser { get; set; }

    public virtual ICollection<JobSkill> JobSkills { get; set; } = new List<JobSkill>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<SavedJob> SavedByUsers { get; set; } = new List<SavedJob>();
    public virtual ICollection<JobTranslation> Translations { get; set; } = new List<JobTranslation>();
}