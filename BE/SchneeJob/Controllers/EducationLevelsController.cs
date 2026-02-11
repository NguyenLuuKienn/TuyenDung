using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EducationLevelsController : ControllerBase
    {
        private readonly IEducationLevelServices _educationLevelServices;

        public EducationLevelsController(IEducationLevelServices educationLevelServices)
        {
            _educationLevelServices = educationLevelServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEducationLevels()
        {
            var levels = await _educationLevelServices.GetAllEducationLevelsAsync();
            return Ok(levels);
        }

        [HttpGet("{levelId}")]
        public async Task<IActionResult> GetEducationLevelById(Guid levelId)
        {
            var level = await _educationLevelServices.GetEducationLevelByIdAsync(levelId);
            return Ok(level);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEducationLevel([FromBody] EducationLevel level)
        {
            var createdLevel = await _educationLevelServices.CreateEducationLevelAsync(level);
            return CreatedAtAction(nameof(GetEducationLevelById), new { levelId = createdLevel.EducationLevelId }, createdLevel);
        }

        [HttpPut("{levelId}")]
        public async Task<IActionResult> UpdateEducationLevel(Guid levelId, [FromBody] EducationLevel level)
        {
            var updatedLevel = await _educationLevelServices.UpdateEducationLevelAsync(levelId, level);
            return Ok(updatedLevel);
        }

        [HttpDelete("{levelId}")]
        public async Task<IActionResult> DeleteEducationLevel(Guid levelId)
        {
            await _educationLevelServices.DeleteEducationLevelAsync(levelId);
            return NoContent();
        }
    }
}
