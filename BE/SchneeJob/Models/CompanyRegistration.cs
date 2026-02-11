using System.ComponentModel.DataAnnotations;

namespace SchneeJob.Models
{
    public class CompanyRegistration
    {
        [Key]
        public Guid RequestId { get; set; }

        // Company Info
        [Required][StringLength(255)] public string CompanyName { get; set; }
        [Url] public string Website { get; set; }
        [Phone] public string CompanyPhoneNumber { get; set; }
        public string Address { get; set; }
        public int IndustryId { get; set; }
        public string LogoURL { get; set; }
        public string CoverImageURL { get; set; }

        // Contact Person Info (người sẽ nhận tài khoản root)
        [Required][StringLength(100)] public string ContactPersonName { get; set; }
        [Required][EmailAddress] public string ContactPersonEmail { get; set; }
        [Phone] public string ContactPersonPhoneNumber { get; set; }

        // Status
        [Required][StringLength(20)] public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public Guid? ReviewedByAdminId { get; set; } // Admin nào đã duyệt
        public DateTime? ReviewedAt { get; set; }
        public string AdminNotes { get; set; }
    }
}
