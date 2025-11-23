using Microsoft.AspNetCore.Mvc;
using ProjetoIntegrador.Dtos;
using ProjetoIntegrador.Repositories.RepositoryBase;
using ProjetoIntegrador.Service;

namespace ProjetoIntegrador.Controllers
{
    [ApiController]
    [Route("api/web/[controller]")]
    public class PratoController : ControllerBase
    {
        private readonly IPratoService _pratoService;
        private readonly IUnitOfWork _unitOfWork;

        public PratoController(IPratoService pratoService, IUnitOfWork unitOfWork)
        {
            _pratoService = pratoService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost]
        [Route("cria-prato")]
        public async Task<IActionResult> CreatePrato(CreatePratoInput input)
        {
            var prato = await _pratoService.CreatePrato(input);
            // await _unitOfWork.CompleteAsync(); // Descomente se o service não salvar sozinho

            return Ok(prato); // Retorna o prato com ID
        }

        // === NOVO: LISTAR ===
        [HttpGet]
        [Route("lista")]
        public async Task<IActionResult> GetAllPratos()
        {
            // Incluir ingredientes na busca seria ideal, mas vamos fazer o básico primeiro
            var lista = await _unitOfWork.Prato.GetAllAsync();
            return Ok(lista);
        }

        // === NOVO: DELETAR ===
        [HttpDelete]
        [Route("deleta")]
        public async Task<IActionResult> DeletePrato([FromQuery] long id)
        {
            var item = await _unitOfWork.Prato.GetByIdAsync(id);
            if (item == null) return NotFound("Prato não encontrado");

            _unitOfWork.Prato.Delete(item);
            await _unitOfWork.CompleteAsync();

            return Ok("Prato deletado com sucesso");
        }
    }
}