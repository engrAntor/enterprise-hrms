using ErrorOr;
using FluentValidation;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using MediatR;

namespace HRMS.Application.Employees.Commands;

// Command: Mutates state, returns the new entity's ID.
public record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    DateTime DateOfBirth,
    DateTime HireDate,
    string Position,
    string Department,
    string AccountNumber,
    string? Address,
    string? EmergencyContact,
    string? EmergencyPhone) : IRequest<ErrorOr<Guid>>;

// Validator: FluentValidation rules — runs automatically via ValidationBehavior pipeline.
public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Invalid phone number format.");
        RuleFor(x => x.DateOfBirth).LessThan(DateTime.UtcNow.AddYears(-18))
            .WithMessage("Employee must be at least 18 years old.");
        RuleFor(x => x.HireDate).LessThanOrEqualTo(DateTime.UtcNow);
        RuleFor(x => x.Position).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Department).NotEmpty()
            .Must(d => Enum.TryParse<Department>(d, out _))
            .WithMessage("Invalid department value.");
        RuleFor(x => x.AccountNumber).NotEmpty().MaximumLength(30);
    }
}

public class CreateEmployeeCommandHandler
    : IRequestHandler<CreateEmployeeCommand, ErrorOr<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateEmployeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ErrorOr<Guid>> Handle(
        CreateEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        // Check for duplicate email
        var emailExists = _context.Employees
            .Any(e => e.Email == request.Email);

        if (emailExists)
            return Error.Conflict("Employee.DuplicateEmail", "An employee with this email already exists.");

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            DateOfBirth = request.DateOfBirth,
            HireDate = request.HireDate,
            Position = request.Position,
            Department = Enum.Parse<Department>(request.Department),
            AccountNumber = request.AccountNumber,
            Status = EmployeeStatus.Active,
            Address = request.Address,
            EmergencyContact = request.EmergencyContact,
            EmergencyPhone = request.EmergencyPhone
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(cancellationToken);

        return employee.Id;
    }
}