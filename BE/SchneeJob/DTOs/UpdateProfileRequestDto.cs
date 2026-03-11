using System;

namespace SchneeJob.DTOs
{
    public class UpdateProfileRequestDto
    {
        public Guid ProfileId { get; set; }
        public string Headline { get; set; }
        public string Summary { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsPublic { get; set; }
    }
}
