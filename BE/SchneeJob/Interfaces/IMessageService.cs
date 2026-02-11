using SchneeJob.DTOs;

namespace SchneeJob.Interfaces
{
    public interface IMessageService
    {
        Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId);
        Task<ConversationDto?> GetConversationByIdAsync(Guid conversationId, Guid userId);
        Task<IEnumerable<MessageResponseDto>> GetMessagesAsync(Guid conversationId, Guid userId);
        Task<MessageResponseDto> SendMessageAsync(Guid senderId, Guid receiverId, string content);
        Task<bool> AcceptConversationAsync(Guid conversationId, Guid userId);
        Task<bool> RejectConversationAsync(Guid conversationId, Guid userId);
        Task<bool> BlockConversationAsync(Guid conversationId, Guid userId);
        Task<bool> MarkAsReadAsync(Guid conversationId, Guid userId);
    }
}
