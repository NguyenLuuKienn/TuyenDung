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
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationServices _notificationServices;
        public NotificationsController(INotificationServices notificationServices)
        {
            _notificationServices = notificationServices;
        }
        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var notifications = await _notificationServices.GetUnreadNotificationsAsync(userId);
            return Ok(notifications);
        }

        // PATCH: api/notifications/{id}/read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var success = await _notificationServices.MarkAsReadAsync(id, userId);
            if (!success)
            {
                return NotFound();
            }
            return Ok(new { message = "Notification marked as read." });
        }
    }
}
