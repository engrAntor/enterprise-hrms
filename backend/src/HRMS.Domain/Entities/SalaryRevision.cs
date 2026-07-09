using HRMS.Domain.Common;

namespace HRMS.Domain.Entities;

public class SalaryRevision : BaseAuditableEntity
{
    public Guid Id { get; set; }
    public decimal PreviousSalary { get; set; }
    public decimal NewSalary { get; set; }
    public required string Reason { get; set; }
    public DateTime EffectiveDate { get; set; }
    public required string ApprovedBy { get; set; }

    public Guid SalaryRecordId { get; set; }
    public SalaryRecord SalaryRecord { get; set; } = null!;
}