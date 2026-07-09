using HRMS.Domain.Common;
using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities;

public class PayrollRecord : BaseAuditableEntity
{
    public Guid Id { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Overtime { get; set; }
    public decimal TaxDeduction { get; set; }
    public decimal InsuranceDeduction { get; set; }
    public decimal OtherDeductions { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public PayrollStatus Status { get; set; }
    public DateTime GeneratedDate { get; set; }
    public DateTime? PaidDate { get; set; }

    public Guid EmployeeId { get; set; }
    // Allow navigation property to be nullable so model binding does not require nested Employee object
    public Employee? Employee { get; set; }
}