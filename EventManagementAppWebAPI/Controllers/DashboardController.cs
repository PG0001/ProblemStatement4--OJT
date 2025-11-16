using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(DashboardService dashboardService, ILogger<DashboardController> logger)
        {
            _dashboardService = dashboardService;
            _logger = logger;
        }

        // Admin Dashboard
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                var data = await _dashboardService.GetAdminDashboardAsync();
                _logger.LogInformation("Admin dashboard retrieved successfully by {User}", User.Identity?.Name ?? "unknown");
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin dashboard");
                return StatusCode(500, "Internal server error");
            }
        }

        // Organizer Dashboard
        [HttpGet("organizer")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> GetOrganizerDashboard()
        {
            try
            {
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "nameid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    _logger.LogWarning("Organizer dashboard requested with missing UserId claim");
                    return Unauthorized("UserId claim missing");
                }

                var userId = int.Parse(userIdClaim);
                var data = await _dashboardService.GetOrganizerDashboardAsync(userId);
                _logger.LogInformation("Organizer dashboard retrieved successfully for user {UserId}", userId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching organizer dashboard");
                return StatusCode(500, "Internal server error");
            }
        }

    }
}
