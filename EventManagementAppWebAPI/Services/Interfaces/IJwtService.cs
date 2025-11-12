namespace EventManagementAppWebAPI.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(Models.User user);
    }
}
