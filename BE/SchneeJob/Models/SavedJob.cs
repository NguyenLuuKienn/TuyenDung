public class SavedJob
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; }

    public Guid JobId { get; set; }
    public virtual Job Job { get; set; }

    public DateTime SavedDate { get; set; } = DateTime.UtcNow;
}