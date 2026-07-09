namespace HRMS.Domain.Enums;

// Note: We use string representations in the frontend, but integers are more efficient
// for the database. EF Core will handle the mapping.
public enum UserRole { Admin, HRManager, Employee }
public enum Department { HR, IT, Finance, Marketing, Operations, Sales, Engineering, Legal }
public enum EmployeeStatus { Active, Inactive, OnLeave, Terminated }
public enum PayrollStatus { Draft, Generated, Approved, Paid, Cancelled }
public enum SalaryStatus { Current, Pending, Revised }