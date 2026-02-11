namespace SchneeJob.DTOs
{
    public class CreateMessageDto
    {
        public Guid ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class MessageResponseDto
    {
        public long MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderAvatar { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime SentAt { get; set; }
    }

    public class ConversationDto
    {
        public Guid ConversationId { get; set; }
        public UserSummaryDto OtherUser { get; set; } = new();
        public MessageResponseDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public bool IsInitiator { get; set; }
    }

    public class UserSummaryDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public bool IsOnline { get; set; }
    }
}
