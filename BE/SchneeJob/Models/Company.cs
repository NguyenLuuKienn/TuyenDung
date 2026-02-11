using SchneeJob.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Net.Mime.MediaTypeNames;
using System.Text.Json.Serialization;

public class Company
{
    [Key]
    public Guid CompanyId { get; set; }

    [Required]
    [StringLength(255)]
    public string CompanyName { get; set; }

    [EmailAddress]
    [StringLength(255)]
    public string CompanyEmail { get; set; }

    [Phone]
    [StringLength(20)]
    public string PhoneNumber { get; set; }

    [Url]
    [StringLength(255)]
    public string Website { get; set; }

    public string LogoURL { get; set; }
    public string CoverImageURL { get; set; }
    public string CompanyDescription { get; set; }

    [StringLength(50)]
    public string CompanySize { get; set; }

    [StringLength(500)]
    public string Address { get; set; }

    [StringLength(100)]
    public string City { get; set; }

    [StringLength(100)]
    public string Country { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = false;

    public int? IndustryId { get; set; }
    [ForeignKey("IndustryId")]
    public virtual Industries Industry { get; set; }

    [JsonIgnore]
    public virtual ICollection<User> Employers { get; set; } = new List<User>();
    
    [NotMapped]
    public Guid? ContactUserId { get; set; }
    public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
    public virtual ICollection<CompanyReview> Reviews { get; set; } = new List<CompanyReview>();
    public virtual ICollection<CompanyFollow> Followers { get; set; } = new List<CompanyFollow>();
}

