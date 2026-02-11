using System.ComponentModel.DataAnnotations;

namespace SchneeJob.Models
{
    public class Industries
    {
        [Key]
        public int IndustryId { get; set; }

        [Required]
        [MaxLength(100)]
        public string IndustryName { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public virtual ICollection<Company> Companies { get; set; } = new List<Company>();
    }
}
