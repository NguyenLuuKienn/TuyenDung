using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Application
{
    [Key]
    public Guid ApplicationId { get; set; }

    [Required]
    public Guid JobId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ResumeId { get; set; }

    public string CoverLetter { get; set; }
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

    [StringLength(50)]
    public string Status { get; set; } = "Pending";

    [ForeignKey("JobId")]
    public virtual Job Job { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    [ForeignKey("ResumeId")]
    public virtual Resume Resume { get; set; }
}