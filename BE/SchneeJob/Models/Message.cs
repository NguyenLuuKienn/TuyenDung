using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Message
{
    [Key]
    public long MessageId { get; set; } 

    [Required]
    public Guid ConversationId { get; set; }

    [Required]
    public Guid SenderId { get; set; }

    [Required]
    public string MessageContent { get; set; } = string.Empty;
    
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ConversationId")]
    public virtual Conversation? Conversation { get; set; }

    [ForeignKey("SenderId")]
    public virtual User? Sender { get; set; }
}