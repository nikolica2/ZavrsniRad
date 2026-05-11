using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(AppDbContext context, TokenService tokenService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto dto)
        {
            if (await context.Users.AnyAsync(x => x.Email == dto.Email))
                return BadRequest("Email već postoji");

            using var hmac = new HMACSHA512();

            var user = new AppUser
            {
                DisplayName = dto.DisplayName,
                Email = dto.Email.ToLower(),
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return Ok(new { token = tokenService.CreateToken(user) });
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDto dto)
        {
            var user = await context.Users.FirstOrDefaultAsync(x => x.Email == dto.Email.ToLower());
            if (user == null) return Unauthorized("Pogrešan email ili lozinka");

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));

            if (!computedHash.SequenceEqual(user.PasswordHash))
                return Unauthorized("Pogrešan email ili lozinka");

            return Ok(new { token = tokenService.CreateToken(user) });
        }

        [HttpPost("make-admin/{id}")]
        public async Task<ActionResult> MakeAdmin(string id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Role = "Admin";
            await context.SaveChangesAsync();

            return Ok("Korisnik je sada admin");
        }
    }

    public record RegisterDto(string DisplayName, string Email, string Password);
    public record LoginDto(string Email, string Password);
}
