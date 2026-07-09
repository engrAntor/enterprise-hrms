using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace HRMS.Api.Services;

public class LoggingHeartbeatService : BackgroundService
{
    private readonly ILogger<LoggingHeartbeatService> _logger;
    private readonly IConfiguration _configuration;

    public LoggingHeartbeatService(ILogger<LoggingHeartbeatService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("LoggingHeartbeatService starting.");

        try
        {
            // Read configuration (optional). Section: "LoggingHeartbeat:Enabled" (bool), "LoggingHeartbeat:IntervalSeconds" (int)
            var section = _configuration.GetSection("LoggingHeartbeat");
            var enabled = section.GetValue<bool?>("Enabled") ?? true;
            var intervalSeconds = section.GetValue<int?>("IntervalSeconds") ?? 30;

            if (!enabled)
            {
                _logger.LogInformation("LoggingHeartbeatService is disabled via configuration.");
                return;
            }

            var delay = TimeSpan.FromSeconds(Math.Max(1, intervalSeconds));

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Heartbeat: {Time}", DateTime.UtcNow);
                    await Task.Delay(delay, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // ignore cancellation
                }
                catch (Exception ex)
                {
                    // Log and continue loop to avoid unhandled exceptions bringing down the host
                    _logger.LogError(ex, "Unhandled exception in LoggingHeartbeatService loop. Continuing.");
                }
            }
        }
        catch (Exception ex)
        {
            // Top-level catch to ensure background service does not throw during startup
            _logger.LogError(ex, "Unhandled exception starting LoggingHeartbeatService. The service will stop but will not crash the host.");
        }
        finally
        {
            _logger.LogInformation("LoggingHeartbeatService stopping.");
        }
    }
}
