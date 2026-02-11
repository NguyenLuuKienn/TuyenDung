using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Notification
{
    [Key]
    public long NotificationId { get; set; } 

    [Required]
    public Guid UserId { get; set; }

    [StringLength(100)]
    public string NotificationType { get; set; }

    [StringLength(500)]
    public string Content { get; set; }

    public string LinkToAction { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public virtual User User { get; set; }
}