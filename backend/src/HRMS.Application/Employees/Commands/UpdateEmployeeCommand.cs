using ErrorOr;
using FluentValidation;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Application.Employees.Commands;

public record UpdateEmployeeCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Position,
    string Department,
    string Status,
    string AccountNumber,
    string? Address,
    string? EmergencyContact,
    string? EmergencyPhone) : IRequest<ErrorOr<Updated>>;

public class UpdateEmployeeCommandValidator : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Position).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Department).NotEmpty()
            .Must(d => Enum.TryParse<Department>(d, out _))
            .WithMessage("Invalid department.");
        RuleFor(x => x.Status).NotEmpty()
            .Must(s => Enum.TryParse<EmployeeStatus>(s, out _))
            .WithMessage("Invalid status.");
        RuleFor(x => x.AccountNumber).NotEmpty().MaximumLength(30);
    }
}

public class UpdateEmployeeCommandHandler
    : IRequestHandler<UpdateEmployeeCommand, ErrorOr<Updated>>
{
    private readonly IApplicationDbContext _context;

    public UpdateEmployeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ErrorOr<Updated>> Handle(
        UpdateEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee is null)
            return Error.NotFound("Employee.NotFound",
                $"Employee with ID {request.Id} was not found.");

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Phone = request.Phone;
        employee.Position = request.Position;
        employee.Department = Enum.Parse<Department>(request.Department);
        employee.Status = Enum.Parse<EmployeeStatus>(request.Status);
        employee.AccountNumber = request.AccountNumber;
        employee.Address = request.Address;
        employee.EmergencyContact = request.EmergencyContact;
        employee.EmergencyPhone = request.EmergencyPhone;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Updated;
    }
}