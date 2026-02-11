namespace SchneeJob.Interfaces
{
    public interface IChatServices
    {
        Task<Conversation> GetOrCreateConversationAsync(Guid user1Id, Guid user2Id);

        Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId, Guid currentUserId);

        Task<Message> SaveMessageAsync(Guid conversationId, Guid senderId, string messageContent);

        Task<IEnumerable<Conversation>> GetMyConversationsAsync(Guid userId);
    }
}
