using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HRMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalaryRecordsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SalaryRecordsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.SalaryRecords.Include(s => s.Employee).ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.SalaryRecords.Include(s => s.Revisions).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpGet("{id:guid}/revisions")]
    public async Task<IActionResult> GetRevisions(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.SalaryRecords.Include(s => s.Revisions).FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (item == null) return NotFound();
        var revisions = item.Revisions.Select(r => new
        {
            id = r.Id,
            salaryRecordId = r.SalaryRecordId,
            previousSalary = r.PreviousSalary,
            newSalary = r.NewSalary,
            reason = r.Reason,
            effectiveDate = r.EffectiveDate,
            approvedBy = r.ApprovedBy,
            createdAt = r.CreatedAt
        });
        return Ok(revisions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SalaryRecord salaryRecord, CancellationToken cancellationToken)
    {
        _context.SalaryRecords.Add(salaryRecord);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = salaryRecord.Id }, salaryRecord);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SalaryRecord salaryRecord, CancellationToken cancellationToken)
    {
        if (id != salaryRecord.Id) return BadRequest();
        _context.SalaryRecords.Update(salaryRecord);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.SalaryRecords.FindAsync(new object[] { id }, cancellationToken);
        if (item == null) return NotFound();
        _context.SalaryRecords.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
