using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public class PayrollRecordConfiguration : IEntityTypeConfiguration<PayrollRecord>
{
    public void Configure(EntityTypeBuilder<PayrollRecord> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => new { p.EmployeeId, p.Month, p.Year })
            .IsUnique();

        builder.Property(p => p.BaseSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.Bonus)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(p => p.Overtime)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(p => p.GrossSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.TaxDeduction)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(p => p.InsuranceDeduction)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(p => p.OtherDeductions)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(p => p.NetSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
    }
}