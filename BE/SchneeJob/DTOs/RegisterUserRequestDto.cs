using System.ComponentModel.DataAnnotations;

namespace SchneeJob.DTOs
{
    public class RegisterUserRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string? FullName { get; set; }

        public string? PhoneNumber { get; set; }
    }
}
