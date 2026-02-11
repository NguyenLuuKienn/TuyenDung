using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        // GET: api/messages/conversations
        [HttpGet("conversations")]
        public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var conversations = await _messageService.GetConversationsAsync(userId);
            return Ok(conversations);
        }

        // GET: api/messages/conversations/{id}
        [HttpGet("conversations/{id}")]
        public async Task<ActionResult<ConversationDto>> GetConversation(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var conversation = await _messageService.GetConversationByIdAsync(id, userId);
            if (conversation == null)
                return NotFound(new { message = "Cuộc trò chuyện không tồn tại" });

            return Ok(conversation);
        }

        // GET: api/messages/conversations/{id}/messages
        [HttpGet("conversations/{id}/messages")]
        public async Task<ActionResult<IEnumerable<MessageResponseDto>>> GetMessages(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var messages = await _messageService.GetMessagesAsync(id, userId);
            return Ok(messages);
        }

        // POST: api/messages
        [HttpPost]
        public async Task<ActionResult<MessageResponseDto>> SendMessage([FromBody] CreateMessageDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                var message = await _messageService.SendMessageAsync(userId, dto.ReceiverId, dto.Content);
                return Ok(message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/messages/conversations/{id}/accept
        [HttpPost("conversations/{id}/accept")]
        public async Task<IActionResult> AcceptConversation(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var result = await _messageService.AcceptConversationAsync(id, userId);
            if (!result)
                return BadRequest(new { message = "Không thể chấp nhận cuộc trò chuyện" });

            return Ok(new { message = "Đã chấp nhận cuộc trò chuyện" });
        }

        // POST: api/messages/conversations/{id}/reject
        [HttpPost("conversations/{id}/reject")]
        public async Task<IActionResult> RejectConversation(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var result = await _messageService.RejectConversationAsync(id, userId);
            if (!result)
                return BadRequest(new { message = "Không thể từ chối cuộc trò chuyện" });

            return Ok(new { message = "Đã từ chối cuộc trò chuyện" });
        }

        // POST: api/messages/conversations/{id}/block
        [HttpPost("conversations/{id}/block")]
        public async Task<IActionResult> BlockConversation(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var result = await _messageService.BlockConversationAsync(id, userId);
            if (!result)
                return BadRequest(new { message = "Không thể chặn cuộc trò chuyện" });

            return Ok(new { message = "Đã chặn cuộc trò chuyện" });
        }

        // PUT: api/messages/conversations/{id}/read
        [HttpPut("conversations/{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            await _messageService.MarkAsReadAsync(id, userId);
            return Ok();
        }
    }
}
