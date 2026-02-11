using Microsoft.EntityFrameworkCore;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class MessageService : IMessageService
    {
        private readonly SchneeJobDbContext _context;

        public MessageService(SchneeJobDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId)
        {
            var conversations = await _context.Conversations
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .Where(c => c.Participants.Any(p => p.UserId == userId))
                .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? c.CreatedAt)
                .ToListAsync();

            var result = new List<ConversationDto>();
            foreach (var conv in conversations)
            {
                var otherParticipant = conv.Participants.FirstOrDefault(p => p.UserId != userId);
                if (otherParticipant?.User == null) continue;

                var unreadCount = await _context.Messages
                    .CountAsync(m => m.ConversationId == conv.ConversationId 
                                  && m.SenderId != userId 
                                  && !m.IsRead);

                var lastMessage = conv.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

                result.Add(new ConversationDto
                {
                    ConversationId = conv.ConversationId,
                    OtherUser = MapToUserSummary(otherParticipant.User),
                    LastMessage = lastMessage != null ? MapToMessageDto(lastMessage) : null,
                    UnreadCount = unreadCount,
                    Status = conv.Status,
                    CreatedAt = conv.CreatedAt,
                    AcceptedAt = conv.AcceptedAt,
                    IsInitiator = conv.InitiatedBy == userId
                });
            }

            return result;
        }

        public async Task<ConversationDto?> GetConversationByIdAsync(Guid conversationId, Guid userId)
        {
            var conv = await _context.Conversations
                .Include(c => c.Participants).ThenInclude(p => p.User)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId 
                                       && c.Participants.Any(p => p.UserId == userId));

            if (conv == null) return null;

            var otherParticipant = conv.Participants.FirstOrDefault(p => p.UserId != userId);
            if (otherParticipant?.User == null) return null;

            var unreadCount = await _context.Messages
                .CountAsync(m => m.ConversationId == conversationId 
                              && m.SenderId != userId 
                              && !m.IsRead);

            var lastMessage = conv.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

            return new ConversationDto
            {
                ConversationId = conv.ConversationId,
                OtherUser = MapToUserSummary(otherParticipant.User),
                LastMessage = lastMessage != null ? MapToMessageDto(lastMessage) : null,
                UnreadCount = unreadCount,
                Status = conv.Status,
                CreatedAt = conv.CreatedAt,
                AcceptedAt = conv.AcceptedAt,
                IsInitiator = conv.InitiatedBy == userId
            };
        }

        public async Task<IEnumerable<MessageResponseDto>> GetMessagesAsync(Guid conversationId, Guid userId)
        {
            // Verify user is participant
            var isParticipant = await _context.ConversationParticipants
                .AnyAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);

            if (!isParticipant) return new List<MessageResponseDto>();

            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages.Select(MapToMessageDto);
        }

        public async Task<MessageResponseDto> SendMessageAsync(Guid senderId, Guid receiverId, string content)
        {
            // Find or create conversation
            var conversation = await FindOrCreateConversationAsync(senderId, receiverId);

            // Check if conversation is blocked
            if (conversation.Status == "Blocked")
            {
                throw new InvalidOperationException("Cuộc trò chuyện đã bị chặn");
            }

            // Create message
            var message = new Message
            {
                ConversationId = conversation.ConversationId,
                SenderId = senderId,
                MessageContent = content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Reload with sender info
            var createdMessage = await _context.Messages
                .Include(m => m.Sender)
                .FirstAsync(m => m.MessageId == message.MessageId);

            return MapToMessageDto(createdMessage);
        }

        public async Task<bool> AcceptConversationAsync(Guid conversationId, Guid userId)
        {
            var conversation = await _context.Conversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId);

            if (conversation == null) return false;

            // Only the receiver (not initiator) can accept
            if (conversation.InitiatedBy == userId) return false;

            // Check if user is participant
            if (!conversation.Participants.Any(p => p.UserId == userId)) return false;

            conversation.Status = "Accepted";
            conversation.AcceptedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectConversationAsync(Guid conversationId, Guid userId)
        {
            var conversation = await _context.Conversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId);

            if (conversation == null) return false;

            // Only the receiver can reject
            if (conversation.InitiatedBy == userId) return false;

            if (!conversation.Participants.Any(p => p.UserId == userId)) return false;

            conversation.Status = "Rejected";
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> BlockConversationAsync(Guid conversationId, Guid userId)
        {
            var conversation = await _context.Conversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.ConversationId == conversationId);

            if (conversation == null) return false;

            if (!conversation.Participants.Any(p => p.UserId == userId)) return false;

            conversation.Status = "Blocked";
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAsReadAsync(Guid conversationId, Guid userId)
        {
            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId 
                         && m.SenderId != userId 
                         && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<Conversation> FindOrCreateConversationAsync(Guid user1Id, Guid user2Id)
        {
            // Find existing conversation between these two users
            var existingConv = await _context.Conversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Participants.Count == 2
                                       && c.Participants.Any(p => p.UserId == user1Id)
                                       && c.Participants.Any(p => p.UserId == user2Id));

            if (existingConv != null) return existingConv;

            // Create new conversation
            var conversation = new Conversation
            {
                ConversationId = Guid.NewGuid(),
                InitiatedBy = user1Id,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);

            _context.ConversationParticipants.Add(new ConversationParticipant
            {
                ConversationId = conversation.ConversationId,
                UserId = user1Id
            });

            _context.ConversationParticipants.Add(new ConversationParticipant
            {
                ConversationId = conversation.ConversationId,
                UserId = user2Id
            });

            await _context.SaveChangesAsync();

            return conversation;
        }

        private MessageResponseDto MapToMessageDto(Message message)
        {
            return new MessageResponseDto
            {
                MessageId = message.MessageId,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                SenderName = message.Sender?.FullName ?? "",
                SenderAvatar = message.Sender?.AvatarURL ?? "",
                Content = message.MessageContent,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt,
                SentAt = message.SentAt
            };
        }

        private UserSummaryDto MapToUserSummary(User user)
        {
            return new UserSummaryDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Avatar = user.AvatarURL ?? "",
                CompanyName = user.Company?.CompanyName,
                IsOnline = false // TODO: Implement online status
            };
        }
    }
}
