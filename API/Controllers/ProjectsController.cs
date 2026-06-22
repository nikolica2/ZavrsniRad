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
    public class ProjectsController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Project>>> GetProjects()
        {
            return await context.Projects
                .Include(p => p.CreatedBy)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(CreateProjectDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedById = userId,
                Technologies = dto.Technologies
            };

            context.Projects.Add(project);
            await context.SaveChangesAsync();

            return await context.Projects
                .Include(p => p.CreatedBy)
                .FirstAsync(p => p.Id == project.Id);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProject(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await context.Projects.FindAsync(id);

            if (project == null) return NotFound();
            if (project.CreatedById != userId) return Forbid();

            context.Projects.Remove(project);
            await context.SaveChangesAsync();

            return Ok();
        }
        [HttpPost("{id}/apply")]
        public async Task<ActionResult> Apply(int id, ApplyDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var project = await context.Projects
                .Include(p => p.CreatedBy)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound();

            if (project.CreatedById == userId)
                return BadRequest("Ne možeš se prijaviti na vlastiti projekt");

            var alreadyApplied = await context.ProjectApplications
                .AnyAsync(a => a.ProjectId == id && a.UserId == userId);
            if (alreadyApplied)
                return BadRequest("Već si se prijavio na ovaj projekt");

            var applicant = await context.Users.FindAsync(userId);

            var application = new ProjectApplication
            {
                ProjectId = id,
                UserId = userId,
                Message = dto.Message
            };

            context.ProjectApplications.Add(application);

            // obavijest kreatoru projekta
            context.Notifications.Add(new Notification
            {
                UserId = project.CreatedById,
                Message = $"{applicant!.DisplayName} se prijavio na tvoj projekt \"{project.Title}\"",
                Type = "application"
            });

            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("{id}/applications")]
        public async Task<ActionResult<IReadOnlyList<ProjectApplication>>> GetApplications(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await context.Projects.FindAsync(id);

            if (project == null) return NotFound();
            if (project.CreatedById != userId) return Forbid();

            return await context.ProjectApplications
                .Where(a => a.ProjectId == id)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }
        [HttpPost("{id}/applications/{applicationId}/approve")]
        public async Task<ActionResult> ApproveApplication(int id, int applicationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await context.Projects.FindAsync(id);

            if (project == null) return NotFound();
            if (project.CreatedById != userId) return Forbid();

            var application = await context.ProjectApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == applicationId);
            if (application == null) return NotFound();

            var alreadyMember = await context.ProjectMembers
                .AnyAsync(m => m.ProjectId == id && m.UserId == application.UserId);

            if (!alreadyMember)
            {
                context.ProjectMembers.Add(new ProjectMember
                {
                    ProjectId = id,
                    UserId = application.UserId
                });

                // obavijest korisniku
                context.Notifications.Add(new Notification
                {
                    UserId = application.UserId,
                    Message = $"Tvoja prijava na projekt \"{project.Title}\" je odobrena!",
                    Type = "approval"
                });

                await context.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpGet("{id}/messages")]
        public async Task<ActionResult<IReadOnlyList<ChatMessage>>> GetMessages(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await context.ProjectMembers
                .AnyAsync(m => m.ProjectId == id && m.UserId == userId);
            var isCreator = await context.Projects
                .AnyAsync(p => p.Id == id && p.CreatedById == userId);

            if (!isMember && !isCreator) return Forbid();

            return await context.ChatMessages
                .Where(m => m.ProjectId == id)
                .Include(m => m.User)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();
        }

        [HttpPost("{id}/messages")]
        public async Task<ActionResult<ChatMessage>> SendMessage(int id, SendMessageDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var isMember = await context.ProjectMembers
                .AnyAsync(m => m.ProjectId == id && m.UserId == userId);
            var project = await context.Projects
                .Include(p => p.CreatedBy)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null) return NotFound();
            if (!isMember && project.CreatedById != userId) return Forbid();

            var message = new ChatMessage
            {
                ProjectId = id,
                UserId = userId!,
                Message = dto.Message
            };

            context.ChatMessages.Add(message);

            // obavijesti sve članove osim pošiljatelja
            var sender = await context.Users.FindAsync(userId);
            var members = await context.ProjectMembers
                .Where(m => m.ProjectId == id && m.UserId != userId)
                .ToListAsync();

            // obavijesti i kreatora ako nije pošiljatelj
            var recipientIds = members.Select(m => m.UserId).ToList();
            if (project.CreatedById != userId)
                recipientIds.Add(project.CreatedById);

            foreach (var recipientId in recipientIds)
            {
                context.Notifications.Add(new Notification
                {
                    UserId = recipientId,
                    Message = $"{sender!.DisplayName} je poslao poruku u projektu \"{project.Title}\"",
                    Type = "message"
                });
            }

            await context.SaveChangesAsync();

            return await context.ChatMessages
                .Include(m => m.User)
                .FirstAsync(m => m.Id == message.Id);
        }

        [HttpGet("my-chats")]
        public async Task<ActionResult> GetMyChats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine($"my-chats userId: {userId}");

            var asMember = await context.ProjectMembers
                .Where(m => m.UserId == userId)
                .ToListAsync();
            Console.WriteLine($"member count: {asMember.Count}");

            var asCreator = await context.Projects
                .Where(p => p.CreatedById == userId)
                .ToListAsync();

            var allMemberProjects = await context.ProjectMembers
                .Where(m => m.UserId == userId)
                .Include(m => m.Project)
                .Select(m => m.Project)
                .ToListAsync();

            var allChats = asCreator.Union(allMemberProjects).DistinctBy(p => p.Id).ToList();
            return Ok(allChats);
        }
        [HttpGet("my-applications")]
        public async Task<ActionResult<IReadOnlyList<int>>> GetMyApplications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var projectIds = await context.ProjectApplications
                .Where(a => a.UserId == userId)
                .Select(a => a.ProjectId)
                .ToListAsync();
            return projectIds;
        }
        [HttpGet("{id}/members")]
        public async Task<ActionResult> GetMembers(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await context.Projects.FindAsync(id);

            if (project == null) return NotFound();
            if (project.CreatedById != userId) return Forbid();

            var members = await context.ProjectMembers
                .Where(m => m.ProjectId == id)
                .Include(m => m.User)
                .ToListAsync();

            return Ok(members);
        }
    }

    public record CreateProjectDto(string Title, string Description, List<string> Technologies);
}
public record ApplyDto(string Message);
public record SendMessageDto(string Message);