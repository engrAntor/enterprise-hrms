namespace HRMS.Application.Payroll.Queries;

public class PayrollDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Overtime { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal TaxDeduction { get; set; }
    public decimal InsuranceDeduction { get; set; }
    public decimal OtherDeductions { get; set; }
    public decimal NetSalary { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime GeneratedDate { get; set; }
}