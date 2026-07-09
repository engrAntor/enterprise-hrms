using Microsoft.AspNetCore.Identity;

namespace HRMS.Infrastructure.Persistence;

// This is the Identity user — only Infrastructure knows about it.
// Controllers and Application layer use this via UserManager<AppUser>.
public class AppUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}