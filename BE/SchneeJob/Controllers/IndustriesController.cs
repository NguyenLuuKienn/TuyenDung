using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IndustriesController : ControllerBase
    {
        private readonly IIndustriesServices _industriesServices;

        public IndustriesController(IIndustriesServices industriesServices)
        {
            _industriesServices = industriesServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllIndustries()
        {
            var industries = await _industriesServices.GetAllIndustriesAsync();
            return Ok(industries);
        }

        [HttpGet("{industryId}")]
        public async Task<IActionResult> GetIndustryById(Guid industryId)
        {
            var industry = await _industriesServices.GetIndustryByIdAsync(industryId);
            return Ok(industry);
        }

        [HttpPost]
        public async Task<IActionResult> CreateIndustry([FromBody] Industries industry)
        {
            var createdIndustry = await _industriesServices.CreateIndustryAsync(industry);
            return CreatedAtAction(nameof(GetIndustryById), new { industryId = createdIndustry.IndustryId }, createdIndustry);
        }

        [HttpPut("{industryId}")]
        public async Task<IActionResult> UpdateIndustry(Guid industryId, [FromBody] Industries industry)
        {
            var updatedIndustry = await _industriesServices.UpdateIndustryAsync(industryId, industry);
            return Ok(updatedIndustry);
        }

        [HttpDelete("{industryId}")]
        public async Task<IActionResult> DeleteIndustry(Guid industryId)
        {
            await _industriesServices.DeleteIndustryAsync(industryId);
            return NoContent();
        }
    }
}
