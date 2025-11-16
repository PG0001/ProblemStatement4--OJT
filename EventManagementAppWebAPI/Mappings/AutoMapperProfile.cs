using AutoMapper;
using EventManagementAppWebAPI.DTOs.Event;
using EventManagementAppWebAPI.DTOs.Review;
using EventManagementAppWebAPI.DTOs.Ticket;
using EventManagementAppWebAPI.DTOs.Auth;
using EventManagementAppWebAPI.Models;

namespace EventManagementAppWebAPI.Mappings
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<EventCreateDto, EventManagementAppLibrary.Models.Event>();
            CreateMap<EventUpdateDto, EventManagementAppLibrary.Models.Event>();
            CreateMap<EventManagementAppLibrary.Models.Event, EventResponseDto>();

            // ------------------------
            // Ticket mappings
            // ------------------------
            CreateMap<TicketBookDto, EventManagementAppLibrary.Models.Ticket>();
            CreateMap<EventManagementAppLibrary.Models.Ticket, TicketResponseDto>();

            // ------------------------
            // Review mappings
            // ------------------------
            CreateMap<ReviewCreateDto, EventManagementAppLibrary.Models.Review>();
            CreateMap<EventManagementAppLibrary.Models.Review, ReviewResponseDto>();

        }
    }

}
