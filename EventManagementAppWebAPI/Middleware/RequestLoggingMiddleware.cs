using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace EventManagementAppWebAPI.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Log request
            context.Request.EnableBuffering();
            var requestBody = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0;

            _logger.LogInformation("Incoming Request: {Method} {Path} | Body: {Body}",
                context.Request.Method, context.Request.Path, requestBody);

            var stopwatch = Stopwatch.StartNew();

            await _next(context);

            stopwatch.Stop();
            _logger.LogInformation("Response {StatusCode} | Time Taken: {ElapsedMilliseconds}ms",
                context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
        }
    }
}
