using ErrorOr;
using HRMS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Application.Employees.Commands;

public record DeleteEmployeeCommand(Guid Id) : IRequest<ErrorOr<Deleted>>;

public class DeleteEmployeeCommandHandler
    : IRequestHandler<DeleteEmployeeCommand, ErrorOr<Deleted>>
{
    private readonly IApplicationDbContext _context;

    public DeleteEmployeeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ErrorOr<Deleted>> Handle(
        DeleteEmployeeCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (employee is null)
            return Error.NotFound("Employee.NotFound",
                $"Employee with ID {request.Id} was not found.");

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Deleted;
    }
}