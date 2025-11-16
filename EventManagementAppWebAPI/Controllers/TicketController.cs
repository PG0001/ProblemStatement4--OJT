using EventManagementAppWebAPI.DTOs.Ticket;
using EventManagementAppWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventManagementAppWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly TicketService _ticketService;
        private readonly ILogger<TicketsController> _logger;

        public TicketsController(TicketService ticketService, ILogger<TicketsController> logger)
        {
            _ticketService = ticketService;
            _logger = logger;
        }

        // ---------------------------
        // BOOK TICKET
        // ---------------------------
        [HttpPost("book")]
        [Authorize(Roles = "Attendee,Admin,Organizer")]
        public async Task<IActionResult> BookTicket([FromBody] TicketBookDto dto)
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);

            _logger.LogInformation("User {UserId} attempting to book {Qty} tickets for Event {EventId}",
                                    userId, dto.Quantity, dto.EventId);

            try
            {
                var ticket = await _ticketService.BookTicketAsync(dto, userId);

                _logger.LogInformation("Ticket booked successfully for User {UserId} (Event {EventId})",
                                        userId, dto.EventId);

                return Ok(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error booking ticket for User {UserId} (Event {EventId})",
                                  userId, dto.EventId);

                return BadRequest(new { message = ex.Message });
            }
        }

        // ---------------------------
        // ORGANIZER VIEW: LIST OF TICKETS
        // ---------------------------
        [HttpGet("organizer")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> GetOrganizerTickets()
        {
            var organizerId = int.Parse(User.FindFirstValue("UserId")!);

            _logger.LogInformation("Organizer {OrganizerId} requested all tickets for their events",
                                    organizerId);

            var tickets = await _ticketService.GetTicketsByOrganizerAsync(organizerId);

            _logger.LogInformation("Organizer {OrganizerId} retrieved {Count} tickets",
                                    organizerId, tickets.Count());

            return Ok(tickets);
        }
    


        // ---------------------------
        // USER VIEW: MY BOOKINGS
        // ---------------------------
        [HttpGet("my")]
        [Authorize(Roles = "Attendee,Admin,Organizer")]
        public async Task<IActionResult> MyTickets()
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);

            _logger.LogInformation("User {UserId} requested all their booked tickets", userId);

            var tickets = await _ticketService.GetUserTicketsAsync(userId);

            _logger.LogInformation("User {UserId} has {Count} total bookings",
                                    userId, tickets.Count());

            return Ok(tickets);
        }
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllTickets()
        {
            try
            {
                var tickets = await _ticketService.GetAllTicketsAsync();
                _logger.LogInformation("Admin retrieved {Count} tickets", tickets.Count());
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all tickets");
                return StatusCode(500, new { message = "Internal server error" });
            }

        }

        // ---------------------------
        // CANCEL BOOKING
        // ---------------------------
        [HttpDelete("{ticketId}")]
        [Authorize(Roles = "Attendee,Admin")]
        public async Task<IActionResult> CancelBooking(int ticketId)
        {
            var userId = int.Parse(User.FindFirstValue("UserId")!);

            _logger.LogInformation("User {UserId} attempting to cancel Ticket {TicketId}", userId, ticketId);

            try
            {
                await _ticketService.CancelTicketAsync(ticketId, userId);
                _logger.LogInformation("Ticket {TicketId} canceled successfully by User {UserId}", ticketId, userId);
                return Ok(new { message = "Booking canceled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error canceling Ticket {TicketId} for User {UserId}", ticketId, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
