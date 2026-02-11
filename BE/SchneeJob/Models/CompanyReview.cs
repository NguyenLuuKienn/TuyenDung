using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CompanyReview
{
    [Key]
    public Guid ReviewId { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [Range(1, 5)]
    [Column(TypeName = "decimal(2, 1)")]
    public decimal Rating { get; set; }

    [StringLength(255)]
    public string Title { get; set; }

    public string ReviewContent { get; set; }
    public bool IsAnonymous { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CompanyId")]
    public virtual Company Company { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; }
}