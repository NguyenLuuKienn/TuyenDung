using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class NotificationServices : INotificationServices
    {
        private readonly SchneeJobDbContext _context;
        public NotificationServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Notification>> GetUnreadNotificationsAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20) // giới hạn thông báo trả về là 20
                .ToListAsync();
        }

        public async Task<bool> MarkAsReadAsync(long notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null || notification.IsRead)
            {
                return false;
            }

            notification.IsRead = true;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task CreateNotificationAsync(Guid userId, string notificationType, string content, string linkToAction)
        {
            var notification = new Notification
            {
                UserId = userId,
                NotificationType = notificationType,
                Content = content,
                LinkToAction = linkToAction,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            // tích hợp signalR
        }
    }
}
