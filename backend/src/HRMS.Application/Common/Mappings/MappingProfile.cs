using AutoMapper;
using HRMS.Application.Employees.Queries;
using HRMS.Application.Salaries.Queries;
using HRMS.Application.Payroll.Queries;
using HRMS.Domain.Entities;

namespace HRMS.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.Department, o => o.MapFrom(s => s.Department.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));

        CreateMap<SalaryRecord, SalaryDto>();
        CreateMap<PayrollRecord, PayrollDto>()
            .ForMember(d => d.EmployeeName,
                o => o.MapFrom(s => $"{s.Employee.FirstName} {s.Employee.LastName}"))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
    }
}