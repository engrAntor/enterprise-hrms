using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public class SalaryRecordConfiguration : IEntityTypeConfiguration<SalaryRecord>
{
    public void Configure(EntityTypeBuilder<SalaryRecord> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.BaseSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(s => s.Bonus)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(s => s.Deductions)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasMany(s => s.Revisions)
            .WithOne(r => r.SalaryRecord)
            .HasForeignKey(r => r.SalaryRecordId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}