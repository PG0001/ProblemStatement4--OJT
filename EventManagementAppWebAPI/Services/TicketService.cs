using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Ticket;

namespace EventManagementAppWebAPI.Services
{
    public class TicketService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TicketService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<string> BookTicketAsync(TicketBookDto dto, int userId)
        {
            var ev = await _unitOfWork.Events.GetByIdAsync(dto.EventId);
            if (ev == null)
                throw new Exception("Event not found.");

            if (ev.AvailableSeats < dto.Quantity)
                throw new Exception("Not enough seats available.");

            // Decrease seat count
            ev.AvailableSeats -= dto.Quantity;

            var ticket = new Ticket
            {
                EventId = ev.Id,
                UserId = userId,
                Quantity = dto.Quantity,
                TotalPrice = dto.Quantity * 100, // temporary fixed price
                BookingDate = DateTime.Now
            };

            await _unitOfWork.Tickets.AddAsync(ticket);
            await _unitOfWork.SaveAsync();

            return "Tickets booked successfully.";
        }

        public async Task<IEnumerable<Ticket>> GetUserTicketsAsync(int userId)
        {
            return await _unitOfWork.Tickets.FindAsync(t => t.UserId == userId);
        }
    }
}
