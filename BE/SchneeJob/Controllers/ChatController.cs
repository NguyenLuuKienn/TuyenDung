using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Services;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatServices _chatServices;
        public ChatController(IChatServices chatServices)
        {
            _chatServices = chatServices;
        }
        [HttpGet("conversations")]
        public async Task<IActionResult> GetMyConversations()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var conversations = await _chatServices.GetMyConversationsAsync(userId);
            return Ok(conversations);
        }

        [HttpPost("conversations/start/{recipientId}")]
        public async Task<IActionResult> StartConversation(Guid recipientId)
        {
            var senderId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var conversation = await _chatServices.GetOrCreateConversationAsync(senderId, recipientId);
            return Ok(conversation);
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetConversationMessages(Guid conversationId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var messages = await _chatServices.GetMessagesAsync(conversationId, userId);
                return Ok(messages);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
