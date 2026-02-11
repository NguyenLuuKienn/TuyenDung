using System.ComponentModel.DataAnnotations;

namespace SchneeJob.Models
{
    public class EducationLevel
    {
        [Key]
        public Guid EducationLevelId { get; set; }

        [Required]
        [MaxLength(100)]
        public string LevelName { get; set; }

        public virtual ICollection<JobSeekerProfile> JobSeekerProfiles { get; set; } = new List<JobSeekerProfile>();
    }
}
