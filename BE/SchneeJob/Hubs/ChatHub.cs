using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SchneeJob.Interfaces;
using System.Security.Claims;

namespace SchneeJob.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMessageService _messageService;
        
        public ChatHub(IMessageService messageService)
        {
            _messageService = messageService;
        }

        public async Task SendMessage(Guid receiverId, string messageContent)
        {
            var senderId = Guid.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            
            // Save message via service
            var message = await _messageService.SendMessageAsync(senderId, receiverId, messageContent);
            
            // Send to receiver
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", message);
            
            // Send back to sender for confirmation
            await Clients.Caller.SendAsync("ReceiveMessage", message);
        }

        public async Task AcceptConversation(Guid conversationId)
        {
            var userId = Guid.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _messageService.AcceptConversationAsync(conversationId, userId);
            
            if (result)
            {
                var conversation = await _messageService.GetConversationByIdAsync(conversationId, userId);
                if (conversation != null)
                {
                    // Notify both users
                    await Clients.User(conversation.OtherUser.UserId.ToString())
                        .SendAsync("ConversationStatusChanged", new { conversationId, status = "Accepted" });
                    await Clients.Caller
                        .SendAsync("ConversationStatusChanged", new { conversationId, status = "Accepted" });
                }
            }
        }

        public async Task MarkAsRead(Guid conversationId)
        {
            var userId = Guid.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await _messageService.MarkAsReadAsync(conversationId, userId);
            
            var conversation = await _messageService.GetConversationByIdAsync(conversationId, userId);
            if (conversation != null)
            {
                // Notify sender that messages were read
                await Clients.User(conversation.OtherUser.UserId.ToString())
                    .SendAsync("MessageRead", new { conversationId });
            }
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
