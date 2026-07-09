using ErrorOr;
using FluentValidation;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Application.Payroll.Commands;

public record GenerateMonthlyPayrollCommand(int Month, int Year) : IRequest<ErrorOr<int>>;

public class GenerateMonthlyPayrollCommandValidator
    : AbstractValidator<GenerateMonthlyPayrollCommand>
{
    public GenerateMonthlyPayrollCommandValidator()
    {
        RuleFor(x => x.Month).InclusiveBetween(1, 12);
        RuleFor(x => x.Year).InclusiveBetween(2000, 2100);
    }
}

public class GenerateMonthlyPayrollCommandHandler
    : IRequestHandler<GenerateMonthlyPayrollCommand, ErrorOr<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPayrollCalculationService _calculator;

    public GenerateMonthlyPayrollCommandHandler(
        IApplicationDbContext context,
        IPayrollCalculationService calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    public async Task<ErrorOr<int>> Handle(
        GenerateMonthlyPayrollCommand request,
        CancellationToken cancellationToken)
    {
        var alreadyGenerated = await _context.PayrollRecords
            .AnyAsync(p => p.Month == request.Month &&
                           p.Year == request.Year, cancellationToken);

        if (alreadyGenerated)
            return Error.Conflict("Payroll.AlreadyGenerated",
                $"Payroll for {request.Month}/{request.Year} has already been generated.");

        var activeEmployees = await _context.Employees
            .Include(e => e.SalaryRecord)
            .Where(e => e.Status == EmployeeStatus.Active && e.SalaryRecord != null)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        if (!activeEmployees.Any())
            return Error.NotFound("Payroll.NoEmployees",
                "No active employees with salary records found.");

        var payrollRecords = new List<PayrollRecord>();

        foreach (var employee in activeEmployees)
        {
            var salary = employee.SalaryRecord!;
            var gross = _calculator.CalculateGrossSalary(salary.BaseSalary, salary.Bonus, overtime: 0);
            var tax = _calculator.CalculateTax(gross);
            var insurance = _calculator.CalculateInsurance(salary.BaseSalary);
            var net = _calculator.CalculateNetSalary(gross, tax, insurance, salary.Deductions);

            payrollRecords.Add(new PayrollRecord
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                Month = request.Month,
                Year = request.Year,
                BaseSalary = salary.BaseSalary,
                Bonus = salary.Bonus,
                Overtime = 0,
                GrossSalary = gross,
                TaxDeduction = tax,
                InsuranceDeduction = insurance,
                OtherDeductions = salary.Deductions,
                NetSalary = net,
                Status = PayrollStatus.Generated,
                GeneratedDate = DateTime.UtcNow
            });
        }

        _context.PayrollRecords.AddRange(payrollRecords);
        await _context.SaveChangesAsync(cancellationToken);

        return payrollRecords.Count;
    }
}