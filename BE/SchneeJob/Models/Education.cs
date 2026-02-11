using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Education
{
    [Key]
    public Guid EducationId { get; set; }

    [Required]
    public Guid ProfileId { get; set; }
    [ForeignKey("ProfileId")]
    [ValidateNever]
    public virtual JobSeekerProfile? Profile { get; set; }

    [Required]
    [StringLength(255)]
    public string SchoolName { get; set; }

    [StringLength(255)]
    public string Degree { get; set; }

    [StringLength(255)]
    public string FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Description { get; set; }
}