using HRMS.Application.Common.Interfaces;

namespace HRMS.Infrastructure.Services;

public class PayrollCalculationService : IPayrollCalculationService
{
    // Bangladesh NBR income tax slabs (annual).
    // Adjust these brackets for your target country.
    // First  BDT 350,000  →  0%
    // Next   BDT 100,000  →  5%
    // Next   BDT 300,000  → 10%
    // Next   BDT 400,000  → 15%
    // Next   BDT 500,000  → 20%
    // Rest               → 25%
    private static readonly (decimal Limit, decimal Rate)[] TaxBrackets =
    {
        (350_000m, 0.00m),
        (100_000m, 0.05m),
        (300_000m, 0.10m),
        (400_000m, 0.15m),
        (500_000m, 0.20m),
        (decimal.MaxValue, 0.25m),
    };

    public decimal CalculateTax(decimal grossMonthlySalary)
    {
        // Convert monthly salary to annual for slab calculation
        var annualSalary = grossMonthlySalary * 12;
        var annualTax = 0m;
        var remaining = annualSalary;

        foreach (var (limit, rate) in TaxBrackets)
        {
            if (remaining <= 0) break;

            var taxable = Math.Min(remaining, limit);
            annualTax += taxable * rate;
            remaining -= taxable;
        }

        // Return monthly portion rounded to 2 decimal places
        return Math.Round(annualTax / 12, 2);
    }

    public decimal CalculateInsurance(decimal baseMonthlySalary)
    {
        // 5% of base salary, capped at BDT 5,000 per month
        var insurance = baseMonthlySalary * 0.05m;
        return Math.Round(Math.Min(insurance, 5_000m), 2);
    }

    public decimal CalculateGrossSalary(decimal baseSalary, decimal bonus, decimal overtime)
    {
        return Math.Round(baseSalary + bonus + overtime, 2);
    }

    public decimal CalculateNetSalary(
        decimal grossSalary,
        decimal taxDeduction,
        decimal insuranceDeduction,
        decimal otherDeductions)
    {
        var totalDeductions = taxDeduction + insuranceDeduction + otherDeductions;
        var net = grossSalary - totalDeductions;

        // Net salary can never be negative — guard against bad data
        return Math.Round(Math.Max(net, 0m), 2);
    }
}