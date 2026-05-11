namespace API.Entities
{
    public class AppUser
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string DisplayName { get; set; }
        public required string Email { get; set; }
        public byte[] PasswordHash { get; set; } = [];
        public byte[] PasswordSalt { get; set; } = [];
        public string Role { get; set; } = "Member";
    }
}