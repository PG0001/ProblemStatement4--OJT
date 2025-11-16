using AutoMapper;
using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Ticket;
using Microsoft.EntityFrameworkCore;

namespace EventManagementAppWebAPI.Services
{
    public class TicketService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TicketService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<TicketResponseDto> BookTicketAsync(TicketBookDto dto, int userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();

            try
            {
                var ev = await _unitOfWork.Events.GetByIdAsync(dto.EventId);
                if (ev == null)
                    throw new Exception("Event not found.");

                if (dto.Quantity <= 0)
                    throw new Exception("Quantity must be at least 1.");

                if (ev.AvailableSeats < dto.Quantity)
                    throw new Exception($"Only {ev.AvailableSeats} seats available.");

                var alreadyBooked = await _unitOfWork.Tickets
                    .FindAsync(t => t.EventId == dto.EventId && t.UserId == userId);

                if (alreadyBooked.Any())
                    throw new Exception("You have already booked this event.");

                ev.AvailableSeats -= dto.Quantity;

                var ticket = new Ticket
                {
                    EventId = ev.Id,
                    UserId = userId,
                    Quantity = dto.Quantity,
                    TotalPrice = dto.Quantity * 100,
                    BookingDate = DateTime.Now
                };

                await _unitOfWork.Tickets.AddAsync(ticket);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                ticket.Event = ev; // needed for EventTitle mapping

                return _mapper.Map<TicketResponseDto>(ticket);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task CancelTicketAsync(int ticketId, int userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();

            try
            {
                var ticket = await _unitOfWork.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId && t.UserId == userId);
                if (ticket == null)
                    throw new Exception("Ticket not found or not authorized");

                var ev = await _unitOfWork.Events.GetByIdAsync(ticket.EventId);
                if (ev != null)
                {
                    ev.AvailableSeats += ticket.Quantity;
                }

                _unitOfWork.Tickets.Remove(ticket);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        public async Task<List<TicketResponseDto>> GetTicketsByOrganizerAsync(int organizerId)
        {
            var tickets = await _unitOfWork.Tickets
                .GetTicketsWithEventAndUser()
                .Where(t => t.Event.OrganizerId == organizerId)
                .ToListAsync();

            return _mapper.Map<List<TicketResponseDto>>(tickets);
        }
        public async Task<List<TicketResponseDto>> GetAllTicketsAsync()
        {
            var tickets = await _unitOfWork.Tickets
                .GetTicketsWithEventAndUser().ToListAsync();// include related Event and User

            return _mapper.Map<List<TicketResponseDto>>(tickets);
        }

        public async Task<IEnumerable<TicketResponseDto>> GetUserTicketsAsync(int userId)
        {
            var tickets = await _unitOfWork.Tickets
                .GetTicketsWithEventAndUser()
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<TicketResponseDto>>(tickets);
        }
    }
}
