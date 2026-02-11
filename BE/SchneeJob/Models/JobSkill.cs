using SchneeJob.Models;

public class JobSkill
{
    public Guid JobId { get; set; }
    public virtual Job? Job { get; set; }

    public Guid SkillId { get; set; }
    public virtual Skill? Skill { get; set; }
}