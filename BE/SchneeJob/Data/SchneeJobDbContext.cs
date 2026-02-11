// --- File: ApplicationDbContext.cs ---
using Microsoft.EntityFrameworkCore;
using SchneeJob.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

public class SchneeJobDbContext : DbContext
{
    public SchneeJobDbContext(DbContextOptions<SchneeJobDbContext> options) : base(options) { }

    // Master Data
    public DbSet<Role> Roles { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<Industries> Industry { get; set; }
    public DbSet<EducationLevel> EducationLevels { get; set; }

    // User & Company
    public DbSet<Company> Companies { get; set; }
    public DbSet<User> Users { get; set; }

    // Job Seeker
    public DbSet<JobSeekerProfile> JobSeekerProfiles { get; set; }
    public DbSet<Resume> Resumes { get; set; }
    public DbSet<Education> Educations { get; set; }
    public DbSet<Experience> Experiences { get; set; }

    // Job
    public DbSet<Job> Jobs { get; set; }

    // Interactions
    public DbSet<Application> Applications { get; set; }
    public DbSet<CompanyReview> CompanyReviews { get; set; }

    // Advanced Features
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<JobTranslation> JobTranslations { get; set; }

    // Junction Tables
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<JobSeekerSkill> JobSeekerSkills { get; set; }
    public DbSet<JobSkill> JobSkills { get; set; }
    public DbSet<SavedJob> SavedJobs { get; set; }
    public DbSet<CompanyFollow> CompanyFollows { get; set; }
    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<CompanyRegistration> CompanyRegistrations { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostLike> PostLikes { get; set; }
    public DbSet<PostComment> PostComments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserRole>().HasKey(ur => new { ur.UserID, ur.RoleID });
        modelBuilder.Entity<JobSeekerSkill>().HasKey(jss => new { jss.ProfileId, jss.SkillId });
        modelBuilder.Entity<JobSkill>().HasKey(js => new { js.JobId, js.SkillId });
        modelBuilder.Entity<SavedJob>().HasKey(sj => new { sj.UserId, sj.JobId });
        modelBuilder.Entity<CompanyFollow>().HasKey(cf => new { cf.UserId, cf.CompanyId });
        modelBuilder.Entity<ConversationParticipant>().HasKey(cp => new { cp.ConversationId, cp.UserId });

        modelBuilder.Entity<Role>().HasIndex(r => r.RoleName).IsUnique();
        modelBuilder.Entity<Skill>().HasIndex(s => s.SkillName).IsUnique();
        modelBuilder.Entity<Industries>().HasIndex(i => i.IndustryName).IsUnique();
        modelBuilder.Entity<EducationLevel>().HasIndex(e => e.LevelName).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Company>().HasIndex(c => c.CompanyEmail).IsUnique();
        modelBuilder.Entity<JobSeekerProfile>().HasIndex(p => p.UserId).IsUnique(); 
        modelBuilder.Entity<JobTranslation>().HasIndex(t => new { t.JobId, t.LanguageCode }).IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Company)
            .WithMany(c => c.Employers)
            .HasForeignKey(u => u.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Job>()
            .HasOne(j => j.PostedByUser)
            .WithMany() 
            .HasForeignKey(j => j.PostedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Resume)
            .WithMany()
            .HasForeignKey(a => a.ResumeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Messaging: Prevent cascade conflicts
        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.Initiator)
            .WithMany()
            .HasForeignKey(c => c.InitiatedBy)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ConversationParticipant>()
            .HasOne(cp => cp.User)
            .WithMany()
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}