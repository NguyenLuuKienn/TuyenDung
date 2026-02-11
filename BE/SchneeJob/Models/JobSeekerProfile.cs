using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class JobSeekerProfile
{
    [Key]
    public Guid ProfileId { get; set; }

    public Guid UserId { get; set; }
    [ForeignKey("UserId")]
    [ValidateNever] 
    public virtual User? User { get; set; }

    [StringLength(200)]
    public string Headline { get; set; }
    public string Summary { get; set; }
    public DateTime? DateOfBirth { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [StringLength(500)]
    public string Address { get; set; }
    public bool IsPublic { get; set; } = false;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Education> Educations { get; set; } = new List<Education>();
    public virtual ICollection<Experience> Experiences { get; set; } = new List<Experience>();
    public virtual ICollection<JobSeekerSkill> JobSeekerSkills { get; set; } = new List<JobSeekerSkill>();
}