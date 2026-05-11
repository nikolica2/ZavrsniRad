namespace API.Entities
{
    public class ProjectMember
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public required string UserId { get; set; }
        public AppUser User { get; set; } = null!;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}