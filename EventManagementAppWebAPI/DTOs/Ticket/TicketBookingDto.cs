namespace EventManagementAppWebAPI.DTOs.Ticket
{
    public class TicketBookDto
    {
        public int EventId { get; set; }
        public int Quantity { get; set; }
    }

    public class TicketResponseDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime BookingDate { get; set; }
    }
}
