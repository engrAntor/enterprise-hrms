using FluentValidation;
using HRMS.Application.Common.Behaviors;
using HRMS.Application.Common.Mappings;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Application;

// Extension method — called once in Program.cs: builder.Services.AddApplication();
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Register pipeline behaviors — order matters!
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}