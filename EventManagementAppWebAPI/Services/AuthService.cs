using EventManagementAppLibrary.Interfaces;
using EventManagementAppWebAPI.DTOs.Auth;
using EventManagementAppWebAPI.Services.Interfaces;

namespace EventManagementAppWebAPI.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _hasher;

        public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordHasher hasher)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _hasher = hasher;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            var existing = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existing != null)
                throw new Exception("Email already registered.");

            var user = new EventManagementAppLibrary.Models. User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = _hasher.Hash(dto.Password),
                Role = dto.Role
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveAsync();

            return "User registered successfully.";
        }

        public async Task<object> LoginAsync(LoginDto dto)
        {
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !_hasher.Verify(dto.Password, user.PasswordHash))
                throw new Exception("Invalid credentials.");
            var user1 = new Models.User
            {
                Name = user.Name,
                Email = user.Email,
                PasswordHash = _hasher.Hash(user.PasswordHash),
                Role = user.Role
            };

            var token = _jwtService.GenerateToken(user1);
            return new { Token = token, Role = user.Role, Name = user.Name };
        }
    }
}
