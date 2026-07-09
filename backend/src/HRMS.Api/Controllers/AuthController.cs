using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using HRMS.Infrastructure.Persistence;
using HRMS.Application.Common.Interfaces;

namespace HRMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtService;

    public AuthController(UserManager<AppUser> userManager, IJwtTokenService jwtService)
    {
        _userManager = userManager;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null) return Unauthorized(new { message = "Invalid credentials" });

        var valid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!valid) return Unauthorized(new { message = "Invalid credentials" });

        var roles = await _userManager.GetRolesAsync(user);

        var token = _jwtService.GenerateToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);

        var profile = new UserProfile
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? "Employee",
            AvatarUrl = user.AvatarUrl
        };

        return Ok(new LoginResponse { Token = token, User = profile });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var exists = await _userManager.FindByEmailAsync(request.Email);
        if (exists is not null) return BadRequest(new { message = "Email already in use" });

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        // assign default role
        await _userManager.AddToRoleAsync(user, request.Role ?? "Employee");

        return Ok();
    }

    // DTOs
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginResponse
    {
        public required string Token { get; set; }
        public required UserProfile User { get; set; }
    }

    public class UserProfile
    {
        public Guid Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class RegisterRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public string? Role { get; set; }
    }
}
