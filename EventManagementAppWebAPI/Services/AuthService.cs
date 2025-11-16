using AutoMapper;
using EventManagementAppLibrary.Interfaces;
using EventManagementAppLibrary.Models;
using EventManagementAppWebAPI.DTOs.Auth;
using EventManagementAppWebAPI.Services.Interfaces;

namespace EventManagementAppWebAPI.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _hasher;
        private readonly IMapper _mapper;

        public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordHasher hasher, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _hasher = hasher;
            _mapper = mapper;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            var existing = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existing != null)
                throw new Exception("Email already registered.");

            // AutoMapper Maps RegisterDto → User
            var user = _mapper.Map<User>(dto);
            user.PasswordHash = _hasher.Hash(dto.Password);

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveAsync();

            return "User registered successfully.";
        }

        public async Task<object> LoginAsync(LoginDto dto)
        {
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !_hasher.Verify(dto.Password, user.PasswordHash))
                throw new Exception("Invalid credentials.");

            var user1 = new Models. User
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt

            };

            // Generate JWT with actual user
            var token = _jwtService.GenerateToken(user1);

            return new
            {
                Token = token,
                Role = user.Role,
                Name = user.Name
            };
        }
    }
}
