using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Resume
{
    [Key]
    public Guid ResumeId { get; set; }

    [Required]
    public Guid UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    [Required]
    [StringLength(255)]
    public string FileName { get; set; }

    [Required]
    public string FileURL { get; set; }

    [StringLength(255)]
    public string FileType { get; set; }
    
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public bool IsDefault { get; set; } = false;
}