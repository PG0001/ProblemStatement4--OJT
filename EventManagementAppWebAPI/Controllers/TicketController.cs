using EventManagementAppWebAPI.DTOs.Ticket;
using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Attendee,Admin")]
    public class TicketsController : ControllerBase
    {
        private readonly TicketService _ticketService;

        public TicketsController(TicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpPost("book")]
        public async Task<IActionResult> BookTicket(TicketBookDto dto)
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "nameid").Value);
            var result = await _ticketService.BookTicketAsync(dto, userId);
            return Ok(result);
        }

        [HttpGet("my")]
        public async Task<IActionResult> MyTickets()
        {
            var userId = int.Parse(User.Claims.First(c => c.Type == "nameid").Value);
            var tickets = await _ticketService.GetUserTicketsAsync(userId);
            return Ok(tickets);
        }
    }
}
