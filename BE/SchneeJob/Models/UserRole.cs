using SchneeJob.Models;

public class UserRole
{
    public Guid UserID { get; set; }
    public virtual User User { get; set; }

    public Guid RoleID { get; set; }
    public virtual Role Role { get; set; }
}