using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Models;
using SchneeJob.Services;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleServices _roleServices;
        public RoleController(IRoleServices roleServices)
        {
            _roleServices = roleServices;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            return Ok(await _roleServices.GetAllRoleAsync());
        }

        [HttpGet("{roleId}")]
        public async Task<IActionResult> GetRoleById(Guid id)
        {
            var role = await _roleServices.GetRoleByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] Role role)
        {
            var createdRole = await _roleServices.CreateRoleAsync(role);
            return CreatedAtAction(nameof(GetRoleById), new { roleId = createdRole.RoleId }, createdRole);
        }

        [HttpPut("{roleId}")]
        public async Task<IActionResult> UpdateRoleRole(Guid roleId, [FromBody] Role role)
        {
            var updatedRole = await _roleServices.UpdateRoleAsync(roleId, role);
            if (updatedRole == null) return NotFound();
            return Ok(updatedRole);
        }

        [HttpDelete("{roleId}")]
        public async Task<IActionResult> DeleteRole(Guid roleId)
        {
            try
            {
                if (await _roleServices.DeleteRoleAsync(roleId))
                {
                    return NoContent();
                }
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
