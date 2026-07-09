using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using System.Text.Json.Serialization;
using HRMS.Api.DTOs;
using HRMS.Api.DTOs;

namespace HRMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public EmployeesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.Employees.ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.Employees.FindAsync(new object[] { id }, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto, CancellationToken cancellationToken)
    {
        if (dto == null)
        {
            return BadRequest(new { error = "Request body is required" });
        }

        try
        {
            // Validate required fields
            var validationErrors = new List<string>();

            if (string.IsNullOrWhiteSpace(dto.FirstName))
                validationErrors.Add("FirstName is required");
            if (string.IsNullOrWhiteSpace(dto.LastName))
                validationErrors.Add("LastName is required");
            if (string.IsNullOrWhiteSpace(dto.Email))
                validationErrors.Add("Email is required");
            if (string.IsNullOrWhiteSpace(dto.Phone))
                validationErrors.Add("Phone is required");
            if (string.IsNullOrWhiteSpace(dto.Position))
                validationErrors.Add("Position is required");
            if (string.IsNullOrWhiteSpace(dto.AccountNumber))
                validationErrors.Add("AccountNumber is required");

            if (validationErrors.Any())
            {
                return BadRequest(new { errors = validationErrors });
            }

            // Prevent duplicate email insertions - return Conflict if email already exists
            var normalizedEmail = (dto.Email ?? string.Empty).Trim();
            if (!string.IsNullOrEmpty(normalizedEmail))
            {
                var emailExists = await _context.Employees.AnyAsync(e => e.Email.ToLower() == normalizedEmail.ToLower(), cancellationToken);
                if (emailExists)
                {
                    return Conflict(new { error = "Email already exists" });
                }
            }

            // Parse Department enum from string
            Department department = Department.IT;
            if (!string.IsNullOrWhiteSpace(dto.Department))
            {
                if (!Enum.TryParse<Department>(dto.Department.Replace(" ", ""), ignoreCase: true, out var parsedDept))
                {
                    return BadRequest(new { error = $"Invalid department: '{dto.Department}'" });
                }
                department = parsedDept;
            }

            // Parse Status enum from string
            EmployeeStatus status = EmployeeStatus.Active;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                if (!Enum.TryParse<EmployeeStatus>(dto.Status, ignoreCase: true, out var parsedStatus))
                {
                    return BadRequest(new { error = $"Invalid status: '{dto.Status}'" });
                }
                status = parsedStatus;
            }

            // Create Employee from DTO
            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                DateOfBirth = dto.DateOfBirth,
                HireDate = dto.HireDate,
                Position = dto.Position,
                Department = department,
                AccountNumber = dto.AccountNumber,
                Status = status,
                AvatarUrl = dto.AvatarUrl,
                Address = dto.Address,
                EmergencyContact = dto.EmergencyContact,
                EmergencyPhone = dto.EmergencyPhone
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = employee.Id }, employee);
        }
        catch (Exception ex)
        {
            return BadRequest(new 
            { 
                error = ex.Message, 
                innerException = ex.InnerException?.Message
            });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Employee employee, CancellationToken cancellationToken)
    {
        if (id != employee.Id) return BadRequest();

        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.Employees.FindAsync(new object[] { id }, cancellationToken);
        if (item == null) return NotFound();
        _context.Employees.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
