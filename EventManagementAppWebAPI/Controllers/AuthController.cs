using EventManagementAppLibrary.Interfaces;
using EventManagementAppWebAPI.DTOs.Auth;
using EventManagementAppWebAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EventManagementAppWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _hasher;
        private readonly ILogger<AuthController> _logger; // ✅ Inject logger

        public AuthController(IUnitOfWork unitOfWork, IJwtService jwtService, IPasswordHasher hasher, ILogger<AuthController> logger)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _hasher = hasher;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                var existing = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existing != null)
                {
                    _logger.LogWarning("Registration attempt failed: Email {Email} already exists", dto.Email);
                    return BadRequest("Email already registered.");
                }

                var user = new EventManagementAppLibrary.Models.User
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    PasswordHash = _hasher.Hash(dto.Password),
                    Role = dto.Role
                };

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveAsync();

                _logger.LogInformation("New user registered: {Email}, Role: {Role}", dto.Email, dto.Role);
                return Ok("User registered successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user {Email}", dto.Email);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null || !_hasher.Verify(dto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for {Email}", dto.Email);
                    return Unauthorized("Invalid credentials.");
                }

                var token = _jwtService.GenerateToken(new Models.User
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role
                });

                _logger.LogInformation("User {Email} logged in successfully", dto.Email);
                return Ok(new
                {
                    Token = token,
                    Role = user.Role,
                    Name = user.Name,
                    Id = user.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", dto.Email);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
