using ErrorOr;
using FluentValidation;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Application.Salaries.Commands;

public record SetEmployeeSalaryCommand(
    Guid EmployeeId,
    decimal BaseSalary,
    decimal Bonus,
    decimal Deductions,
    DateTime EffectiveDate,
    string Reason,
    string ApprovedBy) : IRequest<ErrorOr<Guid>>;

public class SetEmployeeSalaryCommandValidator : AbstractValidator<SetEmployeeSalaryCommand>
{
    public SetEmployeeSalaryCommandValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.BaseSalary).GreaterThan(0)
            .WithMessage("Base salary must be positive.");
        RuleFor(x => x.Bonus).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Deductions).GreaterThanOrEqualTo(0);
        RuleFor(x => x.EffectiveDate).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ApprovedBy).NotEmpty().MaximumLength(100);
    }
}

public class SetEmployeeSalaryCommandHandler
    : IRequestHandler<SetEmployeeSalaryCommand, ErrorOr<Guid>>
{
    private readonly IApplicationDbContext _context;

    public SetEmployeeSalaryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ErrorOr<Guid>> Handle(
        SetEmployeeSalaryCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .Include(e => e.SalaryRecord)
                .ThenInclude(s => s!.Revisions)
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (employee is null)
            return Error.NotFound("Employee.NotFound", "Employee not found.");

        if (employee.SalaryRecord is not null)
        {
            var revision = new SalaryRevision
            {
                Id = Guid.NewGuid(),
                SalaryRecordId = employee.SalaryRecord.Id,
                PreviousSalary = employee.SalaryRecord.BaseSalary,
                NewSalary = request.BaseSalary,
                Reason = request.Reason,
                ApprovedBy = request.ApprovedBy,
                EffectiveDate = request.EffectiveDate,
                CreatedAt = DateTime.UtcNow
            };

            employee.SalaryRecord.Revisions.Add(revision);
            employee.SalaryRecord.BaseSalary = request.BaseSalary;
            employee.SalaryRecord.Bonus = request.Bonus;
            employee.SalaryRecord.Deductions = request.Deductions;
            employee.SalaryRecord.EffectiveDate = request.EffectiveDate;
            employee.SalaryRecord.Status = SalaryStatus.Revised;

            await _context.SaveChangesAsync(cancellationToken);
            return employee.SalaryRecord.Id;
        }

        var salaryRecord = new SalaryRecord
        {
            Id = Guid.NewGuid(),
            EmployeeId = request.EmployeeId,
            BaseSalary = request.BaseSalary,
            Bonus = request.Bonus,
            Deductions = request.Deductions,
            EffectiveDate = request.EffectiveDate,
            Status = SalaryStatus.Current
        };

        _context.SalaryRecords.Add(salaryRecord);
        await _context.SaveChangesAsync(cancellationToken);
        return salaryRecord.Id;
    }
}