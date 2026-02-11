namespace SchneeJob.Interfaces
{
    public interface INotificationServices
    {
        Task<IEnumerable<Notification>> GetUnreadNotificationsAsync(Guid userId);

        Task<bool> MarkAsReadAsync(long notificationId, Guid userId);

        Task CreateNotificationAsync(Guid userId, string notificationType, string content, string linkToAction);
    }
}
