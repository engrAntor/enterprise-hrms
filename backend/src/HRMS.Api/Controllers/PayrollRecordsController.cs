using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRMS.Application.Common.Interfaces;
using HRMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HRMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollRecordsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IPayrollCalculationService _calc;

    public PayrollRecordsController(IApplicationDbContext context, IPayrollCalculationService calc)
    {
        _context = context;
        _calc = calc;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.PayrollRecords.Include(p => p.Employee).ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.PayrollRecords.Include(p => p.Employee).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PayrollRecord payrollRecord, CancellationToken cancellationToken)
    {
        _context.PayrollRecords.Add(payrollRecord);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = payrollRecord.Id }, payrollRecord);
    }

    public class GeneratePayrollRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GeneratePayrollRequest req, CancellationToken cancellationToken)
    {
        // fetch current salary records with employee
        var salaryRecords = await _context.SalaryRecords.Include(s => s.Employee).ToListAsync(cancellationToken);

        // get already generated payroll employee ids for requested month/year to avoid unique index violations
        var existingEmployeeIds = await _context.PayrollRecords
            .Where(p => p.Month == req.Month && p.Year == req.Year)
            .Select(p => p.EmployeeId)
            .ToListAsync(cancellationToken);

        var existingSet = new HashSet<Guid>(existingEmployeeIds);

        var created = new List<PayrollRecord>();
        var skipped = new List<Guid>();

        foreach (var sr in salaryRecords)
        {
            if (existingSet.Contains(sr.EmployeeId))
            {
                skipped.Add(sr.EmployeeId);
                continue;
            }

            var baseSalary = sr.BaseSalary;
            var bonus = sr.Bonus;
            decimal overtime = 0m;

            var gross = _calc.CalculateGrossSalary(baseSalary, bonus, overtime);
            var tax = _calc.CalculateTax(gross);
            var insurance = _calc.CalculateInsurance(baseSalary);
            var other = sr.Deductions;
            var net = _calc.CalculateNetSalary(gross, tax, insurance, other);

            var pr = new PayrollRecord
            {
                Id = Guid.NewGuid(),
                EmployeeId = sr.EmployeeId,
                Month = req.Month,
                Year = req.Year,
                BaseSalary = baseSalary,
                Bonus = bonus,
                Overtime = overtime,
                TaxDeduction = tax,
                InsuranceDeduction = insurance,
                OtherDeductions = other,
                GrossSalary = gross,
                NetSalary = net,
                Status = HRMS.Domain.Enums.PayrollStatus.Generated,
                GeneratedDate = DateTime.UtcNow
            };

            _context.PayrollRecords.Add(pr);
            created.Add(pr);
            existingSet.Add(sr.EmployeeId);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { created = created.Count, skipped = skipped.Count, items = created });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int month, [FromQuery] int year, CancellationToken cancellationToken)
    {
        var monthRecords = await _context.PayrollRecords.Where(p => p.Month == month && p.Year == year).ToListAsync(cancellationToken);

        var totalEmployees = monthRecords.Count;
        var totalGrossSalary = monthRecords.Sum(p => p.GrossSalary);
        var totalDeductions = monthRecords.Sum(p => p.TaxDeduction + p.InsuranceDeduction + p.OtherDeductions);
        var totalNetSalary = monthRecords.Sum(p => p.NetSalary);
        var totalTax = monthRecords.Sum(p => p.TaxDeduction);

        return Ok(new
        {
            month,
            year,
            totalEmployees,
            totalGrossSalary,
            totalDeductions,
            totalNetSalary,
            totalTax,
            status = "Generated"
        });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PayrollRecord payrollRecord, CancellationToken cancellationToken)
    {
        if (id != payrollRecord.Id) return BadRequest();

        // Load existing entity and apply received values to avoid tracking/navigation key issues
        var existing = await _context.PayrollRecords.FindAsync(new object[] { id }, cancellationToken);
        if (existing == null) return NotFound();

        // update scalar properties only
        existing.Month = payrollRecord.Month;
        existing.Year = payrollRecord.Year;
        existing.BaseSalary = payrollRecord.BaseSalary;
        existing.Bonus = payrollRecord.Bonus;
        existing.Overtime = payrollRecord.Overtime;
        existing.TaxDeduction = payrollRecord.TaxDeduction;
        existing.InsuranceDeduction = payrollRecord.InsuranceDeduction;
        existing.OtherDeductions = payrollRecord.OtherDeductions;
        existing.GrossSalary = payrollRecord.GrossSalary;
        existing.NetSalary = payrollRecord.NetSalary;
        existing.Status = payrollRecord.Status;
        existing.GeneratedDate = payrollRecord.GeneratedDate;
        existing.PaidDate = payrollRecord.PaidDate;
        existing.EmployeeId = payrollRecord.EmployeeId;

        _context.PayrollRecords.Update(existing);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var item = await _context.PayrollRecords.FindAsync(new object[] { id }, cancellationToken);
        if (item == null) return NotFound();
        _context.PayrollRecords.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
