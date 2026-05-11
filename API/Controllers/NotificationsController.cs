using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult> GetNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpPut("read")]
        public async Task<ActionResult> MarkAllRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notifications = await context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
                n.IsRead = true;

            await context.SaveChangesAsync();
            return Ok();
        }
    }
}