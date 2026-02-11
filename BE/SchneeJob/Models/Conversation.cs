using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Conversation
{
    [Key]
    public Guid ConversationId { get; set; }
    
    [Required]
    public Guid InitiatedBy { get; set; }
    
    [ForeignKey("InitiatedBy")]
    public virtual User? Initiator { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected, Blocked
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }

    public virtual ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}