using Microsoft.AspNetCore.Mvc;
using HRMS.Domain.Enums;

namespace HRMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetadataController : ControllerBase
{
    [HttpGet("departments")]
    public IActionResult GetDepartments()
    {
        var list = new[]
        {
            new { key = Department.HR.ToString(), value = "Human Resources" },
            new { key = Department.IT.ToString(), value = "Information Technology" },
            new { key = Department.Finance.ToString(), value = "Finance" },
            new { key = Department.Marketing.ToString(), value = "Marketing" },
            new { key = Department.Operations.ToString(), value = "Operations" },
            new { key = Department.Sales.ToString(), value = "Sales" },
            new { key = Department.Engineering.ToString(), value = "Engineering" },
            new { key = Department.Legal.ToString(), value = "Legal" }
        };

        return Ok(list);
    }

    [HttpGet("employee-statuses")]
    public IActionResult GetEmployeeStatuses()
    {
        var list = new[]
        {
            new { key = EmployeeStatus.Active.ToString(), value = "Active" },
            new { key = EmployeeStatus.Inactive.ToString(), value = "Inactive" },
            new { key = EmployeeStatus.OnLeave.ToString(), value = "On Leave" },
            new { key = EmployeeStatus.Terminated.ToString(), value = "Terminated" }
        };

        return Ok(list);
    }
}
