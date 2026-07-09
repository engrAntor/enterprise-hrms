namespace HRMS.Domain.Entities;

// Pure domain user — no framework dependencies.
// Identity concerns live in Infrastructure only.
public class User
{
    public Guid Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ModifiedAt { get; set; }
}