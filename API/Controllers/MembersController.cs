using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]  //localhost:5001/api/members
    [ApiController]
    public class MembersController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            var members = await context.Users.ToListAsync();

            return members;
        }

        [HttpGet("{id}")]   //localhost:5001/api/members/id
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await context.Users.FindAsync(id);
            if (member == null) return NotFound();
            return member;
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveMember(string id)
        {
            var member = await context.Users.FindAsync(id);
            if (member == null) return NotFound();

            context.Users.Remove(member);
            await context.SaveChangesAsync();

            return Ok();
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<AppUser>> UpdateMember(string id, UpdateMemberDto dto)
        {
            var member = await context.Users.FindAsync(id);
            if (member == null) return NotFound();

            member.DisplayName = dto.DisplayName;
            member.Email = dto.Email;
            if (dto.ProfileImage != null)
                member.ProfileImage = dto.ProfileImage;

            await context.SaveChangesAsync();
            return member;
        }

        public record UpdateMemberDto(string DisplayName, string Email, string? ProfileImage);
    }
}
