using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Net.Mime.MediaTypeNames;

public class User
{
    [Key]
    public Guid UserId { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }

    [StringLength(100)]
    public string FullName { get; set; }

    [Phone]
    [StringLength(20)]
    public string PhoneNumber { get; set; }
    public string AvatarURL { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }

    public Guid? CompanyId { get; set; }
    [ForeignKey("CompanyId")]
    [ValidateNever]
    public virtual Company? Company { get; set; }

    public virtual JobSeekerProfile JobSeekerProfile { get; set; } // 1-1 
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
    public virtual ICollection<CompanyFollow> FollowingCompanies { get; set; } = new List<CompanyFollow>();
    public virtual ICollection<CompanyReview> CompanyReviews { get; set; } = new List<CompanyReview>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<ConversationParticipant> ConversationParticipants { get; set; } = new List<ConversationParticipant>();
    public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
}