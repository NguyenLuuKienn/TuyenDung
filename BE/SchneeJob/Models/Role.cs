using System.ComponentModel.DataAnnotations;

namespace SchneeJob.Models
{
    public class Role
    {
        [Key]
        public Guid RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; }

        public virtual ICollection<UserRole>? UserRoles { get; set; } = new List<UserRole>();
    }
}
