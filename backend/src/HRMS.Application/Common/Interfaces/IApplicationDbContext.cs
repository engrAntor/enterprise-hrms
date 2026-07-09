using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HRMS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Employee> Employees { get; }
    DbSet<SalaryRecord> SalaryRecords { get; }
    DbSet<PayrollRecord> PayrollRecords { get; }
    DbSet<SalaryRevision> SalaryRevisions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}