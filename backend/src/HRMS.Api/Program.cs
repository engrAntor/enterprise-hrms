using HRMS.Infrastructure;
using HRMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Register infrastructure (DbContext, Identity, services)
builder.Services.AddInfrastructure(builder.Configuration);

// Configure JWT authentication
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Add controllers
builder.Services.AddControllers().AddJsonOptions(x => { x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; x.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()); });
builder.Services.AddEndpointsApiExplorer();
// Add Swagger generation (enabled at runtime in Development environment below)
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "HRMS API",
        Version = "v1",
        Description = "Human Resource Management System API"
    });
});

// CORS for frontend during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Host diagnostic heartbeat service to help debug unexpected shutdowns
builder.Services.AddHostedService<HRMS.Api.Services.LoggingHeartbeatService>();

var app = builder.Build();

// Ensure database is migrated and seeded. Wrap in try/catch so startup does not crash on seed errors.
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<ApplicationDbContextSeeder>();
    try
    {
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        // Do not rethrow — allow the app to continue starting so you can inspect endpoints.
    }
}

// Add diagnostic logging for host lifetime and unhandled exceptions to help investigate unexpected shutdowns.
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    var lifetime = app.Lifetime;

    lifetime.ApplicationStarted.Register(() =>
    {
        logger.LogWarning("Host has fired ApplicationStarted event. ProcessId={Pid}", Environment.ProcessId);
    });

    lifetime.ApplicationStopping.Register(() =>
    {
        logger.LogWarning("Host is stopping: ApplicationStopping event fired.");
    });

    lifetime.ApplicationStopped.Register(() =>
    {
        logger.LogWarning("Host has stopped: ApplicationStopped event fired.");
    });

    AppDomain.CurrentDomain.UnhandledException += (s, e) =>
    {
        logger.LogError(e.ExceptionObject as Exception, "Unhandled exception in AppDomain");
    };

    TaskScheduler.UnobservedTaskException += (s, e) =>
    {
        logger.LogError(e.Exception, "Unobserved task exception");
        e.SetObserved();
    };
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable Swagger UI in Development for easier debugging and API exploration
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "HRMS API v1");
        options.RoutePrefix = "swagger";
    });
}

// Only enable HTTPS redirection in non-development environments to avoid
// the "Failed to determine the https port for redirect" warning when
// running with a non-HTTPS launch profile.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Apply CORS early so it runs before authentication/authorization.
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
