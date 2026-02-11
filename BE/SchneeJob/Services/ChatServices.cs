using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class ChatServices : IChatServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly INotificationServices _notificationService;
        public ChatServices(SchneeJobDbContext context, INotificationServices notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        public async Task<Conversation> GetOrCreateConversationAsync(Guid user1Id, Guid user2Id)
        {
            var conversation = await _context.ConversationParticipants
                .Where(p1 => p1.UserId == user1Id)
                .Select(p1 => p1.Conversation)
                .Where(c => c.Participants.Any(p2 => p2.UserId == user2Id))
                .FirstOrDefaultAsync();

            if (conversation != null)
            {
                return conversation;
            }

            var newConversation = new Conversation { CreatedAt = DateTime.UtcNow };
            newConversation.Participants.Add(new ConversationParticipant { UserId = user1Id });
            newConversation.Participants.Add(new ConversationParticipant { UserId = user2Id });

            _context.Conversations.Add(newConversation);
            await _context.SaveChangesAsync();

            return newConversation;
        }

        public async Task<IEnumerable<Message>> GetMessagesAsync(Guid conversationId, Guid currentUserId)
        {
            var isParticipant = await _context.ConversationParticipants
                .AnyAsync(p => p.ConversationId == conversationId && p.UserId == currentUserId);

            if (!isParticipant)
            {
                throw new UnauthorizedAccessException("You are not part of this conversation.");
            }

            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .Include(m => m.Sender) 
                .OrderBy(m => m.SentAt)
                .Select(m => new Message 
                {
                    MessageId = m.MessageId,
                    MessageContent = m.MessageContent,
                    SentAt = m.SentAt,
                    SenderId = m.SenderId,
                    Sender = new User { FullName = m.Sender.FullName, AvatarURL = m.Sender.AvatarURL }
                })
                .ToListAsync();
        }

        public async Task<Message> SaveMessageAsync(Guid conversationId, Guid senderId, string messageContent)
        {
            var message = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                MessageContent = messageContent,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            var recipients = await _context.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId != senderId)
            .ToListAsync();

            var sender = await _context.Users.FindAsync(senderId);

            foreach (var recipient in recipients)
            {
                var messagee = $"You have a new message from {sender.FullName}.";
                var link = $"/chat/{conversationId}";
                await _notificationService.CreateNotificationAsync(recipient.UserId, "NewMessage", messagee, link);
            }
            return message;
        }

        public async Task<IEnumerable<Conversation>> GetMyConversationsAsync(Guid userId)
        {
            return await _context.Conversations
                .Where(c => c.Participants.Any(p => p.UserId == userId))
                .Include(c => c.Participants).ThenInclude(p => p.User) // Lấy thông tin người tham gia
                .OrderByDescending(c => c.Messages.Max(m => m.SentAt)) // Sắp xếp theo tin nhắn mới nhất
                .ToListAsync();
        }
    }
}
