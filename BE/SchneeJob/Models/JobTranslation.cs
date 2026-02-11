using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class JobTranslation
{
    [Key]
    public Guid JobTranslationId { get; set; }

    [Required]
    public Guid JobId { get; set; }

    [Required]
    [StringLength(5)]
    public string LanguageCode { get; set; } 

    [StringLength(255)]
    public string JobTitle { get; set; }
    public string JobDescription { get; set; }
    public string JobRequirements { get; set; }

    [ForeignKey("JobId")]
    public virtual Job Job { get; set; }
}