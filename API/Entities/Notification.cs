namespace API.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public AppUser User { get; set; } = null!;
        public required string Message { get; set; }
        public string Type { get; set; } = "general";
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}