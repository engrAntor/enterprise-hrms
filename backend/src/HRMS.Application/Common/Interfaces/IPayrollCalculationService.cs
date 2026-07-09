using HRMS.Domain.Entities;

namespace HRMS.Application.Common.Interfaces;

public interface IPayrollCalculationService
{
    decimal CalculateTax(decimal grossSalary);
    decimal CalculateInsurance(decimal baseSalary);
    decimal CalculateGrossSalary(decimal baseSalary, decimal bonus, decimal overtime);
    decimal CalculateNetSalary(decimal grossSalary, decimal taxDeduction, decimal insuranceDeduction, decimal otherDeductions);
}