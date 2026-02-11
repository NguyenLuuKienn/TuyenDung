using System.ComponentModel.DataAnnotations;

namespace SchneeJob.Models
{
    public class Skill
    {
        [Key]
        public Guid SkillId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SkillName { get; set; }
        public ICollection<JobSkill>? JobSkills { get; set; }
        public ICollection<JobSeekerSkill>? JobSeekerSkills { get; set; }
    }
}
