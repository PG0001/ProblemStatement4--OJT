using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var data = await _dashboardService.GetAdminDashboardAsync();
            return Ok(data);
        }

        [HttpGet("organizer")]
        [Authorize(Roles = "Organizer")]
        public async Task<IActionResult> GetOrganizerDashboard()
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "nameid").Value);
            var data = await _dashboardService.GetOrganizerDashboardAsync(userId);
            return Ok(data);
        }
    }
}
