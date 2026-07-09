using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public class SalaryRevisionConfiguration : IEntityTypeConfiguration<SalaryRevision>
{
    public void Configure(EntityTypeBuilder<SalaryRevision> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.PreviousSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(r => r.NewSalary)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(r => r.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(r => r.ApprovedBy)
            .IsRequired()
            .HasMaxLength(100);
    }
}