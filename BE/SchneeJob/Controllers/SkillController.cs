using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillController : ControllerBase
    {
        private readonly ISkillServices _skillServices;
        public SkillController(ISkillServices skillServices)
        {
            _skillServices = skillServices;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllSkills()
        {
            var skills = await _skillServices.GetAllSkillsAsync();
            return Ok(skills);
        }
        [HttpGet("{skillId}")]
        public async Task<IActionResult> GetSkillById(Guid skillId)
        {
            var skill = await _skillServices.GetAllSkillAsync(skillId);
            return Ok(skill);
        }
        [HttpPost]
        public async Task<IActionResult> CreateSkill([FromBody] Skill skill)
        {
            var createdSkill = await _skillServices.CreateSkillAsync(skill);
            return CreatedAtAction(nameof(GetSkillById), new { skillId = createdSkill.SkillId }, createdSkill);
        }
        [HttpPut("{skillId}")]
        public async Task<IActionResult> UpdateSkill(Guid skillId, [FromBody] Skill skill)
        {
            var updatedSkill = await _skillServices.UpdateSkillAsync(skillId, skill);
            return Ok(updatedSkill);
        }
        [HttpDelete("{skillId}")]
        public async Task<IActionResult> DeleteSkill(Guid skillId)
        {
            await _skillServices.DeleteSkillAsync(skillId);
            return NoContent();
        }

    }
}
