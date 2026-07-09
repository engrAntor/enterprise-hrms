namespace HRMS.Application.Employees.Queries;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public string? Address { get; set; }
    //public string remark { get; set; }
}