namespace API.Entities
{
    public class ProjectApplication
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public required string UserId { get; set; }
        public AppUser User { get; set; } = null!;
        public required string Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}