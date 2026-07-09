using AutoMapper;
using AutoMapper.QueryableExtensions;
using HRMS.Application.Common;
using HRMS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Application.Employees.Queries;

public record GetAllEmployeesQuery(
    string? SearchTerm,
    string? Department,
    string? Status,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<EmployeeDto>>;

public class GetAllEmployeesQueryHandler
    : IRequestHandler<GetAllEmployeesQuery, PagedResult<EmployeeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllEmployeesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<EmployeeDto>> Handle(
        GetAllEmployeesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Employees.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            query = query.Where(e =>
                e.FirstName.Contains(request.SearchTerm) ||
                e.LastName.Contains(request.SearchTerm) ||
                e.Email.Contains(request.SearchTerm) ||
                e.Position.Contains(request.SearchTerm));

        if (!string.IsNullOrWhiteSpace(request.Department) &&
            Enum.TryParse<HRMS.Domain.Enums.Department>(request.Department, out var dept))
            query = query.Where(e => e.Department == dept);

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<HRMS.Domain.Enums.EmployeeStatus>(request.Status, out var status))
            query = query.Where(e => e.Status == status);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(e => e.FirstName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<EmployeeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<EmployeeDto>(items, totalCount, request.Page, request.PageSize);
    }
}