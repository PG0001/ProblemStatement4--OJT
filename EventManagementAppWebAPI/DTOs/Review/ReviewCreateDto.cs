namespace EventManagementAppWebAPI.DTOs.Review
{
    public class ReviewCreateDto
    {
        public int EventId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
