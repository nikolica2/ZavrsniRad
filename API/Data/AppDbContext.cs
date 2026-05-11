using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class AppDbContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<AppUser> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectApplication> ProjectApplications { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<Notification> Notifications { get; set; }

    }
}
