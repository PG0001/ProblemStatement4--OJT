using EventManagementAppLibrary.Interfaces;
using EventManagementAppWebAPI.DTOs.Auth;
using EventManagementAppWebAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementAppWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _hasher;

        public AuthController(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordHasher hasher)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _hasher = hasher;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existing = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existing != null)
                return BadRequest("Email already registered.");

            var user = new EventManagementAppLibrary.Models.User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = _hasher.Hash(dto.Password),
                Role = dto.Role
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !_hasher.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials.");

            // No need to rehash password here
            var token = _jwtService.GenerateToken(new Models.User
            {
                Id = user.Id,  // include Id if your token uses it
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            });

            return Ok(new
            {
                Token = token,
                Role = user.Role,
                Name = user.Name
            });
        }

    }
}
