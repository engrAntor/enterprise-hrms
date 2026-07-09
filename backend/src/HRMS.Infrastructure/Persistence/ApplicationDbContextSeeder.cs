using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HRMS.Infrastructure.Persistence;

public class ApplicationDbContextSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ILogger<ApplicationDbContextSeeder> _logger;

    public ApplicationDbContextSeeder(
        ApplicationDbContext context,
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ILogger<ApplicationDbContextSeeder> logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await _context.Database.MigrateAsync();
        await SeedRolesAsync();
        await SeedAdminUserAsync();
        await SeedHRManagerUserAsync();
    }

    private async Task SeedRolesAsync()
    {
        foreach (UserRole ur in Enum.GetValues(typeof(UserRole)))
        {
            var roleName = GetRoleDisplayName(ur);
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var result = await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                if (result.Succeeded)
                    _logger.LogInformation("Created role: {Role}", roleName);
                else
                    _logger.LogError("Failed to create role {Role}: {Errors}",
                        roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
    }

    private static string GetRoleDisplayName(UserRole role)
    {
        return role switch
        {
            UserRole.HRManager => "HR Manager",
            _ => role.ToString()
        };
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminEmail = "admin@hrms.com";

        if (await _userManager.FindByEmailAsync(adminEmail) is not null)
            return;

        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "System",
            LastName = "Admin",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(admin, "Admin@123456!");

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(admin, GetRoleDisplayName(UserRole.Admin));
            await _userManager.AddToRoleAsync(admin, GetRoleDisplayName(UserRole.HRManager));
            _logger.LogInformation("Seeded admin user: {Email}", adminEmail);
        }
        else
        {
            _logger.LogError("Failed to seed admin user: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    private async Task SeedHRManagerUserAsync()
    {
        const string hrEmail = "hr@hrms.com";

        if (await _userManager.FindByEmailAsync(hrEmail) is not null)
            return;

        var hrManager = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = hrEmail,
            Email = hrEmail,
            FirstName = "HR",
            LastName = "Manager",
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(hrManager, "HrManager@123456!");

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(hrManager, GetRoleDisplayName(UserRole.HRManager));
            _logger.LogInformation("Seeded HR manager user: {Email}", hrEmail);
        }
        else
        {
            _logger.LogError("Failed to seed HR manager: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
}