using SchneeJob.Models;

public class JobSeekerSkill
{
    public Guid ProfileId { get; set; }
    public virtual JobSeekerProfile Profile { get; set; }

    public Guid SkillId { get; set; }
    public virtual Skill Skill { get; set; }
}