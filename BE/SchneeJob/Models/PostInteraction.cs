using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SchneeJob.Models
{
    public class PostLike
    {
        [Key]
        public int PostLikeId { get; set; }

        [Required]
        public Guid PostId { get; set; }

        [ForeignKey("PostId")]
        public Post? Post { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class PostComment
    {
        [Key]
        public int PostCommentId { get; set; }

        [Required]
        public Guid PostId { get; set; }

        [ForeignKey("PostId")]
        public Post? Post { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
