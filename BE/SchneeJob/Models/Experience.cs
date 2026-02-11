using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Experience
{
    [Key]
    public Guid ExperienceId { get; set; }

    [Required]
    public Guid ProfileId { get; set; }
    [ForeignKey("ProfileId")]
    [ValidateNever]
    public virtual JobSeekerProfile? Profile { get; set; }

    [Required]
    [StringLength(255)]
    public string JobTitle { get; set; }

    [Required]
    [StringLength(255)]
    public string CompanyName { get; set; }

    [StringLength(255)]
    public string Location { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Description { get; set; }
}