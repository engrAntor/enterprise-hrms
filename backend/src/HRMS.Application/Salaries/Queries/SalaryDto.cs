namespace HRMS.Application.Salaries.Queries;

public class SalaryDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary => BaseSalary + Bonus - Deductions;
    public DateTime EffectiveDate { get; set; }
    public string Status { get; set; } = string.Empty;
}