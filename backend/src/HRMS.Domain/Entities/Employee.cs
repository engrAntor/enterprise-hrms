using HRMS.Domain.Common;
using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities;

public class Employee : BaseAuditableEntity
{
    public Guid Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime HireDate { get; set; }
    public required string Position { get; set; }
    public Department Department { get; set; }
    public required string AccountNumber { get; set; }
    public EmployeeStatus Status { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }

    public SalaryRecord? SalaryRecord { get; set; }
    public ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
}