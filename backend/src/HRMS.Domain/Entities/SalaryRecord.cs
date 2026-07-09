using HRMS.Domain.Common;
using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities;

public class SalaryRecord : BaseAuditableEntity
{
    public Guid Id { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public DateTime EffectiveDate { get; set; }
    public SalaryStatus Status { get; set; }

    public Guid EmployeeId { get; set; }
    // Make navigation property nullable so model binding does not require nested Employee object
    public Employee? Employee { get; set; }

    public ICollection<SalaryRevision> Revisions { get; set; } = new List<SalaryRevision>();
}