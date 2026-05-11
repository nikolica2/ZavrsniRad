namespace API.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string CreatedById { get; set; }
        public AppUser CreatedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<string> Technologies { get; set; } = [];
    }
}
