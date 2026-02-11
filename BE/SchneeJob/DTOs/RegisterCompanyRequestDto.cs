using System.ComponentModel.DataAnnotations;

namespace SchneeJob.DTOs
{
    public class RegisterCompanyRequestDto : RegisterUserRequestDto
    {
        [Required]
        public string CompanyName { get; set; }
    }
}
