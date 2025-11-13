using System.ComponentModel.DataAnnotations;

namespace EventManagementAppWebAPI.DTOs.Auth
{
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Attendee";
    }
}
