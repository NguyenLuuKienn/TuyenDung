public class ConversationParticipant
{
    public Guid ConversationId { get; set; }
    public virtual Conversation Conversation { get; set; }

    public Guid UserId { get; set; }
    public virtual User User { get; set; }
}